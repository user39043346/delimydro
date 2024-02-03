package server

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/user39043346/delimydro/internal/models"
	pb "github.com/user39043346/delimydro/proto/api"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) SearchGroup(ctx context.Context, req *pb.SearchGroupRequest) (*pb.SearchGroupResponse, error) {
	var g models.Group
	if err := s.db.QueryRowxContext(ctx, "SELECT invite_code, name, image_path FROM groups WHERE invite_code=$1", req.InviteCode).StructScan(&g); err != nil {
		return nil, status.Errorf(codes.Internal, "Invalid invite code")
	}

	return &pb.SearchGroupResponse{Group: g.ToProto()}, nil
}

func (s *Server) GetGroupBalances(ctx context.Context, req *pb.GetGroupBalancesRequest) (*pb.GetGroupBalancesResponse, error) {
	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{Isolation: sql.LevelRepeatableRead})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get group balances")
	}
	defer tx.Rollback()

	rows, err := tx.QueryxContext(ctx, `SELECT users.id, users.username, users.image_path, balance
											FROM user_group
											JOIN users ON user_id=users.id
											WHERE group_id=$1
											ORDER BY users.username`, req.GroupId)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get group balances")
	}
	defer rows.Close()

	var users []*pb.User
	for rows.Next() {
		var x models.User
		if err := rows.StructScan(&x); err != nil {
			return nil, status.Errorf(codes.Internal, "Couldn't get group balances")
		}
		users = append(users, x.ToProto())
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get group balances")
	}

	return &pb.GetGroupBalancesResponse{Users: users}, nil
}

func (s *Server) GetGroupUsers(ctx context.Context, req *pb.GetGroupUsersRequest) (*pb.GetGroupUsersResponse, error) {
	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get users")
	}
	defer tx.Rollback()

	rows, err := tx.QueryxContext(ctx, `SELECT users.id, username, image_path FROM user_group
											JOIN users ON users.id=user_id
											WHERE group_id=$1`, req.GroupId)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get users")
	}
	defer rows.Close()

	var users []*pb.User
	myId := ctx.Value(ctxIdKey).(string)
	foundMyId := false
	for rows.Next() {
		var x models.User
		if err := rows.StructScan(&x); err != nil {
			return nil, status.Errorf(codes.Internal, "Couldn't get users")
		}
		if x.Id == myId {
			foundMyId = true
		}
		users = append(users, x.ToProto())
	}

	if !foundMyId {
		return nil, status.Errorf(codes.Internal, "Invalid group id")
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get users")
	}

	return &pb.GetGroupUsersResponse{Users: users}, nil
}

func (s *Server) AddUsersToGroup(ctx context.Context, req *pb.AddUsersToGroupRequest) (*pb.Empty, error) {
	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't add users")
	}
	defer tx.Rollback()

	var x int
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM groups WHERE id=$1 FOR UPDATE", req.GroupId).Scan(&x); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid group id")
	}
	myId := ctx.Value(ctxIdKey).(string)
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM user_group WHERE group_id=$1 AND user_id=$2", req.GroupId, myId).Scan(&x); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid group id")
	}

	addedCnt, err := addUsersToGroup(ctx, tx, req.GroupId, req.UsersIds)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't add users")
	}

	if addedCnt != len(req.UsersIds) {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid users ids")
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't add users")
	}

	return &pb.Empty{}, nil
}

func (s *Server) CreateGroup(ctx context.Context, req *pb.CreateGroupRequest) (*pb.CreateGroupResponse, error) {
	if req.Name == "" {
		return nil, status.Errorf(codes.InvalidArgument, "Group name is empty")
	}
	if req.Type != 0 && req.Type != 1 {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid type")
	}

	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't create group")
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)
	if _, err := tx.ExecContext(ctx, "SELECT 1 FROM users WHERE id=$1 FOR UPDATE", myId); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't create group")
	}

	var x int
	if err := tx.QueryRowContext(ctx, "SELECT COUNT(group_id) FROM user_group WHERE user_id=$1", myId).Scan(&x); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't create group")
	}

	if x >= 50 {
		return nil, status.Errorf(codes.InvalidArgument, "User can have 50 groups max")
	}

	groupId := uuid.New()
	code, err := genCode()
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't create group")
	}
	if _, err := tx.ExecContext(ctx, "INSERT INTO groups (id, name, image_path, invite_code, type) VALUES ($1, $2, $3, $4, $5)", groupId, req.Name, req.ImagePath, code, req.Type); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't create group")
	}

	req.UsersIds = append(req.UsersIds, myId)

	addedCnt, err := addUsersToGroup(ctx, tx, groupId.String(), req.UsersIds)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't create group")
	}

	if addedCnt != len(req.UsersIds) {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid users ids")
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't add users")
	}

	return &pb.CreateGroupResponse{GroupId: groupId.String()}, nil
}

func addUsersToGroup(ctx context.Context, tx *sql.Tx, groupId string, usersIds []string) (int, error) {
	values := make([]string, 0, len(usersIds))
	args := make([]interface{}, 0, len(usersIds)+1)
	args = append(args, groupId)

	for i, userId := range usersIds {
		values = append(values, fmt.Sprintf("($%d, $1, 0)", i+2))
		args = append(args, userId)
	}

	queryTmpl := `INSERT INTO user_group (user_id, group_id, balance) VALUES %s RETURNING balance`
	query := fmt.Sprintf(queryTmpl, strings.Join(values, ","))

	rows, err := tx.QueryContext(ctx, query, args...)
	if err != nil {
		return 0, err
	}
	defer rows.Close()

	addedCnt := 0
	for rows.Next() {
		var x int
		if err := rows.Scan(&x); err != nil {
			return 0, err
		}
		addedCnt += 1
	}
	return addedCnt, nil
}

func (s *Server) DeleteGroup(ctx context.Context, req *pb.DeleteGroupRequest) (*pb.Empty, error) {
	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't delete group")
	}
	defer tx.Rollback()

	var x int
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM groups WHERE id=$1 FOR UPDATE", req.GroupId).Scan(&x); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid group id")
	}
	myId := ctx.Value(ctxIdKey).(string)
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM user_group WHERE group_id=$1 AND user_id=$2", req.GroupId, myId).Scan(&x); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid group id")
	}

	if _, err := tx.ExecContext(ctx, "DELETE FROM groups WHERE id=$1", req.GroupId); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't delete group")
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't add users")
	}
	return &pb.Empty{}, nil
}

func (s *Server) GetGroup(ctx context.Context, req *pb.GetGroupRequest) (*pb.GetGroupResponse, error) {
	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get group")
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)
	var x int
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM user_group WHERE group_id=$1 AND user_id=$2", req.GroupId, myId).Scan(&x); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid group id")
	}

	var group models.Group
	if err := tx.QueryRowxContext(ctx, "SELECT id, name, image_path, type, invite_code FROM groups WHERE id=$1", req.GroupId).StructScan(&group); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get group")
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get group")
	}

	return &pb.GetGroupResponse{Group: group.ToProto()}, nil
}

func (s *Server) ChangeGroupType(ctx context.Context, req *pb.ChangeGroupTypeRequest) (*pb.Empty, error) {
	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't change group type")
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)
	var x int
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM user_group WHERE group_id=$1 AND user_id=$2", req.GroupId, myId).Scan(&x); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid group id")
	}

	if _, err := tx.ExecContext(ctx, "UPDATE groups SET type=$1 WHERE id=$2", req.NewType, req.GroupId); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't change group type")
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't change group type")
	}
	return &pb.Empty{}, nil
}

func (s *Server) GetUserPayersDebtorsInGroup(ctx context.Context, req *pb.GetUserPayersDebtorsInGroupRequest) (*pb.GetUserPayersDebtorsInGroupResponse, error) {
	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{Isolation: sql.LevelRepeatableRead})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get payers and debtors")
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)
	var x int
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM user_group WHERE group_id=$1 AND user_id=$2", req.GroupId, myId).Scan(&x); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid group id")
	}

	debtorsRows, err := tx.QueryxContext(ctx, `SELECT username, users.image_path, amount
												FROM debts
												JOIN groups ON group_id=groups.id
												JOIN users ON debtor_id=users.id
												WHERE group_id=$1 AND debts.type=groups.type AND payer_id=$2`, req.GroupId, req.UserId)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get payers and debtors")
	}
	defer debtorsRows.Close()
	payersRows, err := tx.QueryxContext(ctx, `SELECT username, users.image_path, amount
												FROM debts
												JOIN groups ON group_id=groups.id
												JOIN users ON payer_id=users.id
												WHERE group_id=$1 AND debts.type=groups.type AND debtor_id=$2`, req.GroupId, req.UserId)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get payers and debtors")
	}
	defer payersRows.Close()

	var debtors, payers []*pb.User

	for debtorsRows.Next() {
		var x models.User
		if err := debtorsRows.StructScan(&x); err != nil {
			return nil, status.Errorf(codes.Internal, "Couldn't get payers and debtors")
		}
		debtors = append(debtors, x.ToProto())
	}
	for payersRows.Next() {
		var x models.User
		if err := debtorsRows.StructScan(&x); err != nil {
			return nil, status.Errorf(codes.Internal, "Couldn't get payers and debtors")
		}
		payers = append(payers, x.ToProto())
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get payers and debtors")
	}

	return &pb.GetUserPayersDebtorsInGroupResponse{Debtors: debtors, Payers: payers}, nil
}
