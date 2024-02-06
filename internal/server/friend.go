package server

import (
	"context"
	"database/sql"
	"time"

	"github.com/user39043346/delimydro/internal/models"
	pb "github.com/user39043346/delimydro/proto/api"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) AddFriend(ctx context.Context, req *pb.AddFriendRequest) (*pb.Empty, error) {
	ctx, frame := s.tracer.Frame(ctx, "AddFriend")
	defer frame.End()

	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		frame.Errorf("BeginTx err: %v", err)
		return nil, errCouldntAddFriend
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)
	var userId string
	if err := tx.QueryRowContext(ctx, "SELECT id FROM users WHERE code=$1", req.Code).Scan(&userId); err != nil {
		frame.Errorf("SELECT FROM users err: %v", err)
		return nil, errInvalidCode
	}

	var x int
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM users WHERE id=$1 FOR UPDATE", min(myId, userId)).Scan(&x); err != nil {
		frame.Errorf("SELECT FROM users err: %v", err)
		return nil, errInvalidCode
	}
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM users WHERE id=$1 FOR UPDATE", max(myId, userId)).Scan(&x); err != nil {
		frame.Errorf("SELECT FROM users err: %v", err)
		return nil, errInvalidCode
	}

	if _, err := tx.ExecContext(ctx, "INSERT INTO friends (payer_id, debtor_id, balance) VALUES ($1, $2, 0)", myId, userId); err != nil {
		frame.Errorf("INSERT INTO friends err: %v", err)
		return nil, errCouldntAddFriend
	}
	if _, err := tx.ExecContext(ctx, "INSERT INTO friends (payer_id, debtor_id, balance) VALUES ($1, $2, 0)", userId, myId); err != nil {
		frame.Errorf("INSERT INTO friends err: %v", err)
		return nil, errCouldntAddFriend
	}
	if err := tx.Commit(); err != nil {
		frame.Errorf("tx commit err: %v", err)
		return nil, errCouldntAddFriend
	}
	frame.Printf("friend1_id", myId, "friend2_id", userId)
	return &pb.Empty{}, nil
}

func (s *Server) ListMyFriends(ctx context.Context, req *pb.Empty) (*pb.ListMyFriendsResponse, error) {
	ctx, frame := s.tracer.Frame(ctx, "ListMyFriends")
	defer frame.End()

	myId := ctx.Value(ctxIdKey).(string)

	r, err := s.db.QueryxContext(ctx, `SELECT users.id, username, image_path, balance FROM friends 
										JOIN users ON debtor_id=users.id 
										WHERE payer_id=$1`, myId)
	if err != nil {
		frame.Errorf("SELECT FROM friends JOIN users err: %v", err)
		return nil, errCouldntListFriends
	}
	defer r.Close()

	var users []*pb.User
	for r.Next() {
		var u models.User
		if err := r.StructScan(&u); err != nil {
			frame.Errorf("User scan err: %v", err)
			return nil, errCouldntListFriends
		}
		users = append(users, u.ToProto())
	}
	frame.Printf("id", myId, "len(friends)", len(users))
	return &pb.ListMyFriendsResponse{Friends: users}, nil
}

func (s *Server) CreateFriendExpense(ctx context.Context, req *pb.CreateFriendExpenseRequest) (*pb.Empty, error) {
	ctx, frame := s.tracer.Frame(ctx, "CreateFriendExpense")
	defer frame.End()

	if req.Amount <= 0 {
		frame.Errorf("Amount must be a positive number, got: %v", req.Amount)
		return nil, status.Errorf(codes.InvalidArgument, "Amount must be a positive number")
	}
	payerId := ctx.Value(ctxIdKey).(string)
	debtorId := req.FriendId

	if !req.FriendIsDebtor {
		debtorId, payerId = payerId, debtorId
	}

	if err := s.addFriendExpense(ctx, payerId, debtorId, req.Amount, req.ExpenseName, 0); err != nil {
		frame.Errorf("addFriendExpense err: %v", err)
		return nil, errCouldntCreateExpense
	}

	return &pb.Empty{}, nil
}

func (s *Server) DeleteFriendExpense(ctx context.Context, req *pb.DeleteFriendExpenseRequest) (*pb.Empty, error) {
	ctx, frame := s.tracer.Frame(ctx, "DeleteFriendExpense")
	defer frame.End()

	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{})
	if err != nil {
		frame.Errorf("BeginTx err: %v", err)
		return nil, errCouldntDeleteExpense
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)

	var x int
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM users WHERE id=$1 FOR UPDATE", min(myId, req.FriendId)).Scan(&x); err != nil {
		frame.Errorf("SELECT FROM users err: %v", err)
		return nil, errInvalidUserId
	}
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM users WHERE id=$1 FOR UPDATE", max(myId, req.FriendId)).Scan(&x); err != nil {
		frame.Errorf("SELECT FROM users err: %v", err)
		return nil, errInvalidUserId
	}
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM friends WHERE payer_id=$1 AND debtor_id=$2", myId, req.FriendId).Scan(&x); err != nil {
		frame.Errorf("SELECT FROM friends err: %v", err)
		return nil, status.Errorf(codes.InvalidArgument, "Users are not friends")
	}
	var group_id *string
	if err := tx.QueryRowContext(ctx, "SELECT group_id FROM expenses WHERE id=$1", req.ExpenseId).Scan(&group_id); err != nil {
		frame.Errorf("SELECT FROM expenses err: %v", err)
		return nil, errInvalidExpenseId
	}
	if group_id != nil {
		frame.Errorf("group_id: waited nil, got %s", *group_id)
		return nil, errInvalidExpenseId
	}
	var amounts []models.Diff
	r, err := tx.QueryxContext(ctx, "SELECT user_id, diff FROM expense_items WHERE expense_id=$1 AND (user_id=$2 OR user_id=$3)", req.ExpenseId, req.FriendId, myId)
	if err != nil {
		frame.Errorf("SELECT FROM expense_items err: %v", err)
		return nil, errCouldntDeleteExpense
	}
	defer r.Close()

	for r.Next() {
		var x models.Diff
		if err := r.StructScan(&x); err != nil {
			frame.Errorf("Diff scan err: %v", err)
			return nil, errCouldntDeleteExpense
		}
		amounts = append(amounts, x)
	}
	if len(amounts) != 2 {
		frame.Errorf("wrong amounts: len != 2, got: %v", amounts)
		return nil, errInvalidExpenseId
	}
	if _, err := tx.ExecContext(ctx, "UPDATE friends SET balance=balance-$1 WHERE payer_id=$2 AND debtor_id=$3", amounts[0].Diff, amounts[0].UserId, amounts[1].UserId); err != nil {
		frame.Errorf("UPDATE friends err: %v", err)
		return nil, errCouldntDeleteExpense
	}
	if _, err := tx.ExecContext(ctx, "UPDATE friends SET balance=balance-$1 WHERE payer_id=$2 AND debtor_id=$3", amounts[1].Diff, amounts[1].UserId, amounts[0].UserId); err != nil {
		frame.Errorf("UPDATE friends err: %v", err)
		return nil, errCouldntDeleteExpense
	}

	if _, err := tx.ExecContext(ctx, "DELETE FROM expenses WHERE id=$1", req.ExpenseId); err != nil {
		frame.Errorf("DELETE FROM expenses err: %v", err)
		return nil, errCouldntDeleteExpense
	}

	if err := tx.Commit(); err != nil {
		frame.Errorf("tx commit err: %v", err)
		return nil, errCouldntDeleteExpense
	}
	frame.Printf("expense_id", req.ExpenseId, "friend1_id", myId, "friend2_id", req.FriendId)
	return &pb.Empty{}, nil
}

func (s *Server) ListFriendsExpenses(ctx context.Context, req *pb.ListFriendsExpensesRequest) (*pb.ListFriendsExpensesResponse, error) {
	ctx, frame := s.tracer.Frame(ctx, "ListFriendExpenses")
	defer frame.End()

	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{Isolation: sql.LevelRepeatableRead})
	if err != nil {
		frame.Errorf("BeginTx err: %v", err)
		return nil, errCouldntListExpenses
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)
	if !(1 <= req.N && req.N <= 100) {
		frame.Errorf("!(1 <= N <= 100), N = %v", req.N)
		return nil, status.Errorf(codes.InvalidArgument, "N must be between 1 and 100")
	}
	if req.Offset < 0 {
		frame.Errorf("Offset < 0, Offset = %v", req.Offset)
		return nil, status.Errorf(codes.InvalidArgument, "Offset can't be negative")
	}

	r, err := tx.QueryxContext(ctx, `SELECT expenses.id, expenses.name, username AS payer_name, image_path AS payer_image_path, total_paid, time, type 
										FROM expense_items 
										JOIN expenses ON expense_id=expenses.id 
										JOIN users ON payer_id=users.id 
										WHERE expense_items.user_id=$1 AND expenses.group_id IS NULL 
										ORDER BY time DESC LIMIT $2 OFFSET $3`, myId, req.N, req.Offset)
	if err != nil {
		frame.Errorf("SELECT FROM expense_items JOIN expenses JOIN users err: %v", err)
		return nil, errCouldntListExpenses
	}
	defer r.Close()

	var expenses []*pb.Expense
	for r.Next() {
		var x models.Expense
		if err := r.StructScan(&x); err != nil {
			frame.Errorf("Expense scan err: %v", err)
			return nil, errCouldntListExpenses
		}
		expenses = append(expenses, x.ToProto())
	}

	if err := tx.Commit(); err != nil {
		frame.Errorf("tx commit err: %v", err)
		return nil, errCouldntListExpenses
	}
	frame.Printf("id", myId, "len(expenses)", len(expenses))
	return &pb.ListFriendsExpensesResponse{Expenses: expenses}, nil
}

func (s *Server) FriendSettleUp(ctx context.Context, req *pb.FriendSettleUpRequest) (*pb.Empty, error) {
	ctx, frame := s.tracer.Frame(ctx, "FriendSettleUp")
	defer frame.End()

	payerId := ctx.Value(ctxIdKey).(string)
	debtorId := req.FriendId

	if req.FriendPays {
		payerId, debtorId = debtorId, payerId
	}

	if err := s.addFriendExpense(ctx, payerId, debtorId, req.Amount, "Settle up", 1); err != nil {
		frame.Errorf("addFriendExpense err: %v", err)
		return nil, errCouldntSettleUp
	}
	frame.Printf("payer_id", payerId, "debtor_id", debtorId)
	return &pb.Empty{}, nil
}

func (s *Server) addFriendExpense(ctx context.Context, payerId string, debtorId string, amount int64, expenseName string, expenseType int) error {
	ctx, frame := s.tracer.Frame(ctx, "addFriendExpense")
	defer frame.End()

	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		frame.Errorf("BeginTx err: %v", err)
		return errCouldntAddExpense
	}
	defer tx.Rollback()

	var x int64
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM users WHERE id=$1 FOR UPDATE", min(payerId, debtorId)).Scan(&x); err != nil {
		frame.Errorf("SELECT FROM users err: %v", err)
		return errInvalidUserId
	}
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM users WHERE id=$1 FOR UPDATE", max(payerId, debtorId)).Scan(&x); err != nil {
		frame.Errorf("SELECT FROM users err: %v", err)
		return errInvalidUserId
	}
	if err := tx.QueryRowContext(ctx, "SELECT balance FROM friends WHERE payer_id=$1 AND debtor_id=$2", payerId, debtorId).Scan(&x); err != nil {
		frame.Errorf("SELECT FROM friends err: %v", err)
		return status.Errorf(codes.InvalidArgument, "Users are not friends")
	}
	if expenseType == 1 && amount+x > 0 {
		frame.Errorf("settle_up > debt, settle_up: %v, debt: %v", amount, x)
		return status.Error(codes.InvalidArgument, "Can't settle up more than payer debt")
	}

	if _, err := tx.ExecContext(ctx, "UPDATE friends SET balance=balance+$1 WHERE (payer_id=$2 AND debtor_id=$3)", amount, payerId, debtorId); err != nil {
		frame.Errorf("UPDATE friends err: %v", err)
		return errCouldntAddExpense
	}
	if _, err := tx.ExecContext(ctx, "UPDATE friends SET balance=balance-$1 WHERE (debtor_id=$2 AND payer_id=$3)", amount, payerId, debtorId); err != nil {
		frame.Errorf("UPDATE friends err: %v", err)
		return errCouldntAddExpense
	}

	expenseId := uuid.New()
	if _, err := tx.ExecContext(ctx, "INSERT INTO expenses (id, group_id, payer_id, total_paid, name, type, time) VALUES ($1, $2, $3, $4, $5, $6, $7)", expenseId, nil, payerId, amount, expenseName, expenseType, time.Now()); err != nil {
		frame.Errorf("INSERT INTO expenses err: %v", err)
		return errCouldntAddExpense
	}
	if _, err := tx.ExecContext(ctx, "INSERT INTO expense_items (expense_id, user_id, diff) VALUES ($1, $2, $3), ($1, $4, -$3)", expenseId, payerId, amount, debtorId); err != nil {
		frame.Errorf("INSERT INTO expense_items err: %v", err)
		return errCouldntAddExpense
	}

	if err := tx.Commit(); err != nil {
		frame.Errorf("tx commit err: %v", err)
		return errCouldntAddExpense
	}
	frame.Printf("status", "ok")
	return nil
}
