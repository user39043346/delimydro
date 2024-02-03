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

var (
	ErrCouldntAddFriend = status.Errorf(codes.Internal, "Couldn't add friend")
)

func (s *Server) SearchFriend(ctx context.Context, req *pb.SearchFriendRequest) (*pb.SearchFriendResponse, error) {
	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{Isolation: sql.LevelRepeatableRead})
	if err != nil {
		return nil, ErrCouldntAddFriend
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)

	rows, err := tx.QueryxContext(ctx, `SELECT id, username, image_path 
											FROM friends 
											JOIN users ON friends.debtor_id=users.id
											WHERE friends.payer_id=$1 AND username LIKE $2`, myId, "%"+req.Prefix+"%")
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't search friends")
	}

	var users []*pb.User
	for rows.Next() {
		var u models.User
		if err := rows.StructScan(&u); err != nil {
			return nil, status.Errorf(codes.Internal, "Couldn't search friends")
		}
		users = append(users, u.ToProto())
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't search friends")
	}

	return &pb.SearchFriendResponse{Friends: users}, nil
}

func (s *Server) AddFriend(ctx context.Context, req *pb.AddFriendRequest) (*pb.Empty, error) {
	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, ErrCouldntAddFriend
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)
	var userId string
	if err := tx.QueryRowContext(ctx, "SELECT id FROM users WHERE code=$1", req.Code).Scan(&userId); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid code")
	}

	var x int
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM users WHERE id=$1 FOR UPDATE", min(myId, userId)).Scan(&x); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid code")
	}
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM users WHERE id=$1 FOR UPDATE", max(myId, userId)).Scan(&x); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid code")
	}

	if _, err := tx.ExecContext(ctx, "INSERT INTO friends (payer_id, debtor_id, balance) VALUES ($1, $2, 0)", myId, userId); err != nil {
		return nil, ErrCouldntAddFriend
	}
	if _, err := tx.ExecContext(ctx, "INSERT INTO friends (payer_id, debtor_id, balance) VALUES ($1, $2, 0)", userId, myId); err != nil {
		return nil, ErrCouldntAddFriend
	}
	if err := tx.Commit(); err != nil {
		return nil, ErrCouldntAddFriend
	}
	return &pb.Empty{}, nil
}

func (s *Server) ListMyFriends(ctx context.Context, req *pb.Empty) (*pb.ListMyFriendsResponse, error) {
	myId := ctx.Value(ctxIdKey).(string)

	r, err := s.db.QueryxContext(ctx, "SELECT users.id, username, image_path, balance FROM friends JOIN users ON debtor_id=users.id WHERE payer_id=$1", myId)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't list friends")
	}
	defer r.Close()

	var users []*pb.User
	for r.Next() {
		var u models.User
		if err := r.StructScan(&u); err != nil {
			return nil, status.Errorf(codes.Internal, "Couldn't list friends")
		}
		users = append(users, u.ToProto())
	}
	return &pb.ListMyFriendsResponse{Friends: users}, nil
}

func (s *Server) CreateFriendExpense(ctx context.Context, req *pb.CreateFriendExpenseRequest) (*pb.Empty, error) {
	if req.Amount <= 0 {
		return nil, status.Errorf(codes.InvalidArgument, "Amount must be a positive number")
	}
	payerId := ctx.Value(ctxIdKey).(string)
	debtorId := req.FriendId

	if !req.FriendIsDebtor {
		debtorId, payerId = payerId, debtorId
	}

	if err := s.addFriendExpense(ctx, payerId, debtorId, req.Amount, req.ExpenseName, 0); err != nil {
		return nil, err
	}

	return &pb.Empty{}, nil
}

func (s *Server) DeleteFriendExpense(ctx context.Context, req *pb.DeleteFriendExpenseRequest) (*pb.Empty, error) {
	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't delete expense")
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)

	var x int
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM users WHERE id=$1 FOR UPDATE", min(myId, req.FriendId)).Scan(&x); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid user_id")
	}
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM users WHERE id=$1 FOR UPDATE", max(myId, req.FriendId)).Scan(&x); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid user_id")
	}
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM friends WHERE payer_id=$1 AND debtor_id=$2", myId, req.FriendId).Scan(&x); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Users are not friends")
	}
	var group_id *string
	if err := tx.QueryRowContext(ctx, "SELECT group_id FROM expenses WHERE id=$1", req.ExpenseId).Scan(&group_id); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid expense id")
	}
	if group_id != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid expense id")
	}
	var amounts []models.Diff
	r, err := tx.QueryxContext(ctx, "SELECT user_id, diff FROM expense_items WHERE expense_id=$1 AND (user_id=$2 OR user_id=$3)", req.ExpenseId, req.FriendId, myId)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't delete expense")
	}
	defer r.Close()

	for r.Next() {
		var x models.Diff
		if err := r.StructScan(&x); err != nil {
			return nil, status.Errorf(codes.Internal, "Couldn't delete expense")
		}
		amounts = append(amounts, x)
	}
	if len(amounts) != 2 {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid expense id")
	}
	if _, err := tx.ExecContext(ctx, "UPDATE friends SET balance=balance-$1 WHERE payer_id=$2 AND debtor_id=$3", amounts[0].Diff, amounts[0].UserId, amounts[1].UserId); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Couldn't delete expense1")
	}
	if _, err := tx.ExecContext(ctx, "UPDATE friends SET balance=balance-$1 WHERE payer_id=$2 AND debtor_id=$3", amounts[1].Diff, amounts[1].UserId, amounts[0].UserId); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Couldn't delete expense2")
	}

	if _, err := tx.ExecContext(ctx, "DELETE FROM expenses WHERE id=$1", req.ExpenseId); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Couldn't delete expense2")
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Couldn't delete expense3")
	}

	return &pb.Empty{}, nil
}

func (s *Server) ListFriendsExpenses(ctx context.Context, req *pb.ListFriendsExpensesRequest) (*pb.ListFriendsExpensesResponse, error) {
	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{Isolation: sql.LevelRepeatableRead})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't list friends expenses")
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)
	if !(1 <= req.N && req.N <= 100) {
		return nil, status.Errorf(codes.InvalidArgument, "N must be between 1 and 100")
	}
	if req.Offset < 0 {
		return nil, status.Errorf(codes.InvalidArgument, "Offset can't be negative")
	}

	r, err := tx.QueryxContext(ctx, `SELECT expenses.id, expenses.name, username AS payer_name, image_path AS payer_image_path, total_paid, time, type 
										FROM expense_items 
										JOIN expenses ON expense_id=expenses.id 
										JOIN users ON payer_id=users.id 
										WHERE expense_items.user_id=$1 AND expenses.group_id IS NULL 
										ORDER BY time DESC LIMIT $2 OFFSET $3`, myId, req.N, req.Offset)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't list friends expenses")
	}
	defer r.Close()

	var expenses []*pb.Expense
	for r.Next() {
		var x models.Expense
		if err := r.StructScan(&x); err != nil {
			return nil, status.Errorf(codes.Internal, "Couldn't list friends expenses")
		}
		expenses = append(expenses, x.ToProto())
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't list friends expenses")
	}
	return &pb.ListFriendsExpensesResponse{Expenses: expenses}, nil
}

func (s *Server) FriendSettleUp(ctx context.Context, req *pb.FriendSettleUpRequest) (*pb.Empty, error) {
	payerId := ctx.Value(ctxIdKey).(string)
	debtorId := req.FriendId

	if req.FriendPays {
		payerId, debtorId = debtorId, payerId
	}

	if err := s.addFriendExpense(ctx, payerId, debtorId, req.Amount, "Settle up", 1); err != nil {
		return nil, err
	}

	return &pb.Empty{}, nil
}

func (s *Server) addFriendExpense(ctx context.Context, payerId string, debtorId string, amount int64, expenseName string, expenseType int) error {
	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return status.Errorf(codes.Internal, "Couldn't add expense")
	}
	defer tx.Rollback()

	var x int64
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM users WHERE id=$1 FOR UPDATE", min(payerId, debtorId)).Scan(&x); err != nil {
		return status.Errorf(codes.InvalidArgument, "Invalid user_id")
	}
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM users WHERE id=$1 FOR UPDATE", max(payerId, debtorId)).Scan(&x); err != nil {
		return status.Errorf(codes.InvalidArgument, "Invalid user_id")
	}
	if err := tx.QueryRowContext(ctx, "SELECT balance FROM friends WHERE payer_id=$1 AND debtor_id=$2", payerId, debtorId).Scan(&x); err != nil {
		return status.Errorf(codes.InvalidArgument, "Users are not friends")
	}
	if expenseType == 1 && amount+x > 0 {
		return status.Error(codes.InvalidArgument, "Can't settle up more than payer debt")
	}

	if _, err := tx.ExecContext(ctx, "UPDATE friends SET balance=balance+$1 WHERE (payer_id=$2 AND debtor_id=$3)", amount, payerId, debtorId); err != nil {
		return status.Errorf(codes.Internal, "Couldn't add expense")
	}
	if _, err := tx.ExecContext(ctx, "UPDATE friends SET balance=balance-$1 WHERE (debtor_id=$2 AND payer_id=$3)", amount, payerId, debtorId); err != nil {
		return status.Errorf(codes.Internal, "Couldn't add expense")
	}

	expenseId := uuid.New()
	if _, err := tx.ExecContext(ctx, "INSERT INTO expenses (id, group_id, payer_id, total_paid, name, type, time) VALUES ($1, $2, $3, $4, $5, $6, $7)", expenseId, nil, payerId, amount, expenseName, expenseType, time.Now()); err != nil {
		return status.Errorf(codes.Internal, "Couldn't add expense")
	}
	if _, err := tx.ExecContext(ctx, "INSERT INTO expense_items (expense_id, user_id, diff) VALUES ($1, $2, $3), ($1, $4, -$3)", expenseId, payerId, amount, debtorId); err != nil {
		return status.Errorf(codes.Internal, "Couldn't add expense")
	}

	if err := tx.Commit(); err != nil {
		return status.Errorf(codes.Internal, "Couldn't add expense")
	}
	return nil
}
