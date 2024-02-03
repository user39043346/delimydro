package server

import (
	"context"
	"database/sql"

	"github.com/user39043346/delimydro/internal/models"
	pb "github.com/user39043346/delimydro/proto/api"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) SearchUser(ctx context.Context, req *pb.SearchUserRequest) (*pb.SearchUserResponse, error) {
	var u models.User
	if err := s.db.QueryRowxContext(ctx, "SELECT code, username, image_path FROM users WHERE code=$1", req.Code).StructScan(&u); err != nil {
		return nil, status.Errorf(codes.Internal, "Invalid code")
	}

	return &pb.SearchUserResponse{User: u.ToProto()}, nil
}

func (s *Server) GetUsersWithOutstandingBalance(ctx context.Context, req *pb.Empty) (*pb.GetUsersWithOutstandingBalanceResponse, error) {
	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{Isolation: sql.LevelRepeatableRead})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't add expense")
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)

	debtorsRows, err := tx.QueryxContext(ctx, `SELECT username, image_path, SUM(amount) AS balance 
												FROM (
													SELECT debtor_id, SUM(amount) AS amount FROM debts 
													JOIN groups ON debts.group_id=groups.id AND debts.type=groups.type
													WHERE payer_id=$1
													GROUP BY debtor_id
													UNION 
													SELECT debtor_id, balance FROM friends
													WHERE payer_id=$1 AND balance > 0
												) AS debtors
												JOIN users ON users.id=debtors.debtor_id
												GROUP BY debtors.debtor, username, image_path`, myId)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get users")
	}
	payersRows, err := tx.QueryxContext(ctx, `SELECT username, image_path, SUM(amount) AS balance 
												FROM (
													SELECT payer_id, SUM(amount) AS amount FROM debts 
													JOIN groups ON debts.group_id=groups.id AND debts.type=groups.type
													WHERE debtor_id=$1
													GROUP BY payer_id
													UNION 
													SELECT payer_id, balance FROM friends
													WHERE debtor_id=$1 AND balance > 0
												) AS payers
												JOIN users ON users.id=payers.payer_id
												GROUP BY payers.payer_id, username, image_path`, myId)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get users")
	}

	var debtors, payers []*pb.User

	for debtorsRows.Next() {
		var u models.User
		if err := debtorsRows.StructScan(&u); err != nil {
			return nil, status.Errorf(codes.Internal, "Couldn't get users")
		}
		debtors = append(debtors, u.ToProto())
	}
	for payersRows.Next() {
		var u models.User
		if err := payersRows.StructScan(&u); err != nil {
			return nil, status.Errorf(codes.Internal, "Couldn't get users")
		}
		payers = append(payers, u.ToProto())
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get users")
	}

	return &pb.GetUsersWithOutstandingBalanceResponse{Debtors: debtors, Payers: payers}, nil
}

func (s *Server) GetUserGroupsDistribution(ctx context.Context, req *pb.GetUserGroupsDistributionRequest) (*pb.GetUserGroupsDistributionResponse, error) {
	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{Isolation: sql.LevelRepeatableRead})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't add expense")
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)
	var userIsDebtor, userIsPayer []*pb.Group

	rows, err := tx.QueryxContext(ctx, `SELECT group_id, name, image_path, SUM(amount) AS amount
											FROM debts
											JOIN groups ON debts.group_id=groups.id AND debts.type=groups.type
											WHERE payer_id=$1 AND debtor_id=$2
											GROUP BY group_id, name, image_path`, myId, req.UserId)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get users")
	}

	for rows.Next() {
		var g models.Group
		if err := rows.StructScan(&g); err != nil {
			return nil, status.Errorf(codes.Internal, "Couldn't get users")
		}
		userIsDebtor = append(userIsDebtor, g.ToProto())
	}

	rows, err = tx.QueryxContext(ctx, `SELECT group_id, name, image_path, SUM(amount) AS amount
											FROM debts
											JOIN groups ON debts.group_id=groups.id AND debts.type=groups.type
											WHERE payer_id=$1 AND debtor_id=$2
											GROUP BY group_id, name, image_path`, req.UserId, myId)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get users")
	}

	for rows.Next() {
		var g models.Group
		if err := rows.StructScan(&g); err != nil {
			return nil, status.Errorf(codes.Internal, "Couldn't get users")
		}
		userIsPayer = append(userIsPayer, g.ToProto())
	}

	var nonGroupBalance int64
	_ = tx.QueryRowContext(ctx, "SELECT balance FROM friends WHERE payer_id=$1 AND debtor_id=$2", myId).Scan(&nonGroupBalance)

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get users")
	}

	return &pb.GetUserGroupsDistributionResponse{
		UserIsDebtor:    userIsDebtor,
		UserIsPayer:     userIsPayer,
		NonGroupBalance: nonGroupBalance,
	}, nil
}
