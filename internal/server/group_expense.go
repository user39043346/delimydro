package server

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	pb "github.com/user39043346/delimydro/proto/api"

	"github.com/user39043346/delimydro/internal/models"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Item struct {
	PayerId  string `db:"payer_id"`
	DebtorId string `db:"debtor_id"`
	Amount   int64  `db:"amount"`
}

func (i *Item) ToPair() Pair {
	return Pair{PayerId: i.PayerId, DebtorId: i.DebtorId}
}

func (i *Item) ToInvPair() Pair {
	return Pair{PayerId: i.DebtorId, DebtorId: i.PayerId}
}

type Pair struct {
	PayerId  string `db:"payer_id"`
	DebtorId string `db:"debtor_id"`
}

func calcItems(diffs []*models.Diff) ([]*Item, error) {
	var items []*Item
	debtorIdx := 0
	for payerIdx := range diffs {
		for diffs[payerIdx].Diff > 0 {
			for debtorIdx < len(diffs) {
				if diffs[debtorIdx].Diff < 0 {
					items = append(items, &Item{PayerId: diffs[payerIdx].UserId, DebtorId: diffs[debtorIdx].UserId})
					if diffs[payerIdx].Diff+diffs[debtorIdx].Diff <= 0 {
						items[len(items)-1].Amount = diffs[payerIdx].Diff
						diffs[debtorIdx].Diff += diffs[payerIdx].Diff
						diffs[payerIdx].Diff = 0
						break
					} else {
						items[len(items)-1].Amount = -diffs[debtorIdx].Diff
						diffs[payerIdx].Diff += diffs[debtorIdx].Diff
						diffs[debtorIdx].Diff = 0
					}
				}
				debtorIdx++
			}
			if diffs[payerIdx].Diff > 0 && debtorIdx == len(diffs) {
				return nil, status.Errorf(codes.InvalidArgument, "Invalid diffs")
			}
		}
	}
	for i := range diffs {
		if diffs[i].Diff != 0 {
			return nil, status.Errorf(codes.InvalidArgument, "Invalid diffs")
		}
	}
	return items, nil
}

func (s *Server) CreateGroupExpense(ctx context.Context, req *pb.CreateGroupExpenseRequest) (*pb.Empty, error) {
	if req.ExpenseName == "" {
		return nil, status.Errorf(codes.InvalidArgument, "Empty expense name")
	}

	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't create expense")
	}
	defer tx.Rollback()

	var x int
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM groups WHERE id=$1 FOR UPDATE", req.GroupId).Scan(&x); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid group id")
	}

	m := make(map[string]int64)
	payersMap := make(map[string]int64)
	for _, diff := range req.Payers {
		m[diff.UserId] = diff.Diff
		payersMap[diff.UserId] = diff.Diff
	}
	for _, diff := range req.Debtors {
		m[diff.UserId] += diff.Diff
	}

	diffs := make([]*models.Diff, 0, len(m))
	for id, diff := range m {
		d := &models.Diff{UserId: id, Diff: diff}
		diffs = append(diffs, d)
	}
	if err := addGroupExpense(ctx, tx, diffs, req.GroupId); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't create expense")
	}

	payersCnt := 0
	totalPaid := int64(0)
	var payerId *string
	for _, diff := range req.Payers {
		if diff.Diff > 0 {
			payersCnt += 1
			totalPaid += diff.Diff
			payerId = &diff.UserId
		}
	}
	if payersCnt > 1 {
		payerId = nil
	}

	expenseId := uuid.New()
	if _, err := tx.ExecContext(ctx, "INSERT INTO expenses (id, group_id, payer_id, total_paid, name, type, time) VALUES ($1, $2, $3, $4, $5, $6, $7)", expenseId, req.GroupId, payerId, totalPaid, req.ExpenseName, 0, time.Now()); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't create expense")
	}

	items, err := calcItems(diffs)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't create expense")
	}

	values := make([]string, 0, len(items))
	args := make([]interface{}, 0, len(items)*3+1)
	args = append(args, expenseId)
	i := 1
	for _, item := range items {
		values = append(values, fmt.Sprintf("($1, $%d, $%d, $%d)", i+1, i+2, i+3))
		args = append(args, item.PayerId, item.DebtorId, item.Amount)
		i += 3
	}
	for _, diff := range req.Debtors {
		if v, ok := payersMap[diff.UserId]; ok && v != 0 {
			values = append(values, fmt.Sprintf("($1, $%d, $%d, $%d)", i+1, i+2, i+3))
			i += 3
			args = append(args, diff.UserId, diff.UserId, min(v, -diff.Diff))
		}
	}

	queryTmpl := `INSERT INTO expense_items (expense_id, payer_id, debtor_id, amount) VALUES %s`
	query := fmt.Sprintf(queryTmpl, strings.Join(values, ","))

	if _, err := tx.ExecContext(ctx, query, args...); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't create expense")
	}

	if err = tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't create expense")
	}

	return &pb.Empty{}, nil
}

func (s *Server) DeleteGroupExpense(ctx context.Context, req *pb.DeleteGroupExpenseRequest) (*pb.Empty, error) {
	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't delete expense")
	}
	defer tx.Rollback()

	var x int
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM groups WHERE id=$1 FOR UPDATE", req.GroupId).Scan(&x); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid group id")
	}

	myId := ctx.Value(ctxIdKey).(string)
	if err := tx.QueryRowContext(ctx, `SELECT 1 FROM expenses 
											JOIN user_group ON user_group.group_id=expenses.group_id 
											WHERE expenses.id=$1 AND user_group.group_id=$2 AND user_group.user_id=$3`, req.ExpenseId, req.GroupId, myId).Scan(&x); err != nil {
		return nil, status.Errorf(codes.Internal, "Invalid expense or group id")
	}

	rows, err := tx.QueryxContext(ctx, "SELECT payer_id, debtor_id, amount FROM expense_items WHERE expense_id=$1", req.ExpenseId)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't delete expense")
	}
	defer rows.Close()

	m := make(map[string]int64)
	for rows.Next() {
		var payerId, debtorId string
		var amount int64
		if err := rows.Scan(&payerId, &debtorId, &amount); err != nil {
			return nil, status.Errorf(codes.Internal, "Couldn't delete expense")
		}
		m[payerId] -= amount
		m[debtorId] += amount
	}

	diffs := make([]*models.Diff, 0, len(m))
	for id, amount := range m {
		diffs = append(diffs, &models.Diff{UserId: id, Diff: amount})
	}

	if err := addGroupExpense(ctx, tx, diffs, req.GroupId); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't delete expense")
	}

	if _, err := tx.ExecContext(ctx, "DELETE FROM expenses WHERE id=$1", req.ExpenseId); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't delete expense")
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't delete expense")
	}

	return &pb.Empty{}, nil
}

func (s *Server) ListGroupExpenses(ctx context.Context, req *pb.ListGroupExpensesRequest) (*pb.ListGroupExpensesResponse, error) {
	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{Isolation: sql.LevelRepeatableRead})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't list expenses")
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)
	rows, err := tx.QueryxContext(ctx, `SELECT expenses.id, expenses.name, u1.username as payer_name, u2.username as debtor_name, total_paid, time, type,
											(SELECT COALESCE(SUM(amount), 0) FROM expense_items WHERE expense_id=expenses.id AND payer_id=$4) - (SELECT COALESCE(SUM(amount), 0) FROM expense_items WHERE expense_id=expenses.id AND debtor_id=$4) AS my_diff
											FROM expenses
											LEFT JOIN users AS u1 ON expenses.payer_id=u1.id
											LEFT JOIN users AS u2 ON expenses.debtor_id=u2.id
											WHERE group_id=$1
											ORDER BY time DESC
											LIMIT $2 OFFSET $3`, req.GroupId, req.N, req.Offset, myId)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't list expenses")
	}
	defer rows.Close()

	var expenses []*pb.Expense
	for rows.Next() {
		var x models.Expense
		if err := rows.StructScan(&x); err != nil {
			return nil, status.Errorf(codes.Internal, "Couldn't list expenses")
		}
		expenses = append(expenses, x.ToProto())
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't list expenses")
	}

	return &pb.ListGroupExpensesResponse{Expenses: expenses}, nil
}

func addGroupExpense(ctx context.Context, tx *sqlx.Tx, diffs []*models.Diff, groupId string) error {
	diffCopy := make([]*models.Diff, 0, len(diffs))
	for _, diff := range diffs {
		diffCopy = append(diffCopy, &models.Diff{UserId: diff.UserId, Diff: diff.Diff})
	}
	items, err := calcItems(diffCopy)
	if err != nil {
		return err
	}

	pairs := make(map[Pair]int64)
	for _, item := range items {
		pairs[item.ToPair()] = item.Amount
	}

	args := make([]interface{}, 0, len(items)*2+1)
	args = append(args, groupId)
	queryParts := make([]string, 0, len(items))

	for i, item := range items {
		queryPart := fmt.Sprintf("(payer_id=$%d AND debtor_id=$%d) OR (payer_id=$%d AND debtor_id=$%d)", (i+1)*2, (i+1)*2+1, (i+1)*2+1, (i+1)*2)
		queryParts = append(queryParts, queryPart)
		args = append(args, item.DebtorId, item.PayerId)
	}
	queryTmpl := "SELECT payer_id, debtor_id, amount FROM debts WHERE group_id=$1 AND type=0 AND (%s)"
	query := fmt.Sprintf(queryTmpl, strings.Join(queryParts, " OR "))

	rows, err := tx.QueryxContext(ctx, query, args...)
	if err != nil {
		return err
	}
	defer rows.Close()

	i := 1
	var values []string
	args = make([]interface{}, 0, 1)
	args = append(args, groupId)

	for rows.Next() {
		var x Item
		if err := rows.StructScan(&x); err != nil {
			return err
		}
		values = append(values, fmt.Sprintf("($%d, $%d, $%d)", i+1, i+2, i+3))
		pair, invPair := x.ToPair(), x.ToInvPair()
		if amount, ok := pairs[pair]; ok {
			args = append(args, x.PayerId, x.DebtorId, amount)
			pairs[pair] = 0
		} else {
			amount = -pairs[invPair]
			args = append(args, x.PayerId, x.DebtorId, amount)
			pairs[invPair] = 0
		}
		i += 3
	}
	if len(values) > 0 {
		queryTmpl = `UPDATE debts AS d1 SET amount=d1.amount+d2.amount::int
						FROM (VALUES %s) AS d2(payer_id, debtor_id, amount)
						WHERE d1.group_id=$1 AND d1.type=0 AND d1.payer_id=UUID(d2.payer_id) AND d1.debtor_id=UUID(d2.debtor_id)`
		query = fmt.Sprintf(queryTmpl, strings.Join(values, ","))

		if _, err := tx.ExecContext(ctx, query, args...); err != nil {
			return err
		}
	}

	if _, err := tx.ExecContext(ctx, "DELETE FROM debts WHERE group_id=$1 AND type=0 AND amount=0", groupId); err != nil {
		return err
	}

	args = make([]interface{}, 0, 1)
	args = append(args, groupId)
	values = make([]string, 0)
	i = 1
	for pair, amount := range pairs {
		if amount != 0 {
			values = append(values, fmt.Sprintf("($%d, $1, $%d, $%d, $%d, 0)", i+1, i+2, i+3, i+4))
			args = append(args, uuid.New(), pair.PayerId, pair.DebtorId, amount)
			i += 4
		}
	}
	if len(values) > 0 {
		queryTmpl = `INSERT INTO debts (id, group_id, payer_id, debtor_id, amount, type) VALUES %s`
		query = fmt.Sprintf(queryTmpl, strings.Join(values, ","))

		if _, err := tx.ExecContext(ctx, query, args...); err != nil {
			return err
		}
	}

	if _, err := tx.ExecContext(ctx, "DELETE FROM debts WHERE group_id=$1 AND type=1", groupId); err != nil {
		return err
	}

	args = make([]interface{}, 0, len(diffs)*2+1)
	args = append(args, groupId)
	values = make([]string, 0, len(diffs))
	for i, diff := range diffs {
		values = append(values, fmt.Sprintf("($%d, $%d)", (i+1)*2, (i+1)*2+1))
		args = append(args, diff.UserId, diff.Diff)
	}
	queryTmpl = `UPDATE user_group AS ug1 SET balance=balance+ug2.diff::int
					FROM (VALUES %s) AS ug2(user_id, diff)
					WHERE ug1.group_id=$1 AND ug1.user_id=UUID(ug2.user_id)`
	query = fmt.Sprintf(queryTmpl, strings.Join(values, ","))
	if _, err = tx.ExecContext(ctx, query, args...); err != nil {
		return err
	}

	rows, err = tx.QueryxContext(ctx, "SELECT user_id, balance AS diff FROM user_group WHERE group_id=$1", groupId)
	if err != nil {
		return err

	}
	defer rows.Close()

	newDiffs := make([]*models.Diff, 0)
	for rows.Next() {
		var diff models.Diff
		if err := rows.StructScan(&diff); err != nil {
			return err
		}
		newDiffs = append(newDiffs, &diff)
	}

	items, err = calcItems(newDiffs)
	if err != nil {
		return err
	}

	args = make([]interface{}, 0, len(items)*4+1)
	args = append(args, groupId)
	values = make([]string, 0, len(items))
	i = 1
	for _, item := range items {
		values = append(values, fmt.Sprintf("($%d, $1, $%d, $%d, $%d, 1)", i+1, i+2, i+3, i+4))
		args = append(args, uuid.New(), item.PayerId, item.DebtorId, item.Amount)
		i += 4
	}
	if len(values) > 0 {
		queryTmpl = `INSERT INTO debts (id, group_id, payer_id, debtor_id, amount, type) VALUES %s`
		query = fmt.Sprintf(queryTmpl, strings.Join(values, ","))

		if _, err := tx.ExecContext(ctx, query, args...); err != nil {
			return err
		}
	}

	return nil
}

func (s *Server) GroupSettleUp(ctx context.Context, req *pb.GroupSettleUpRequest) (*pb.Empty, error) {
	if req.Amount <= 0 {
		return nil, status.Errorf(codes.InvalidArgument, "Amount must be a positive number")
	}

	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't settle up")
	}
	defer tx.Rollback()

	var x int64
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM groups WHERE id=$1 FOR UPDATE", req.GroupId).Scan(&x); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid group id")
	}
	if err := tx.QueryRowContext(ctx, "SELECT amount FROM debts WHERE group_id=$1 AND payer_id=$2 AND debtor_id=$3", req.GroupId, req.PayerId, req.DebtorId).Scan(&x); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "First user doesn't owe second user")
	}
	if req.Amount > x {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid amount")
	}

	diffs := []*models.Diff{
		{UserId: req.PayerId, Diff: -req.Amount},
		{UserId: req.DebtorId, Diff: req.Amount},
	}

	if err := addGroupExpense(ctx, tx, diffs, req.GroupId); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't settle up")
	}

	expenseId := uuid.New()
	if _, err := tx.ExecContext(ctx, "INSERT INTO expenses (id, group_id, payer_id, debtor_id, total_paid, name, type, time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", expenseId, req.GroupId, req.PayerId, req.DebtorId, req.Amount, "Settle up", 1, time.Now()); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't settle up")
	}
	if _, err := tx.ExecContext(ctx, `INSERT INTO expense_items (expense_id, payer_id, debtor_id, amount) VALUES ($1, $2, $3, $4)`, expenseId, req.DebtorId, req.PayerId, req.Amount); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't settle up")
	}

	if err = tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't settle up")
	}

	return &pb.Empty{}, nil
}
