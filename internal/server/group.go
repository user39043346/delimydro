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
	ctx, frame := s.tracer.Frame(ctx, "SearchGroup")
	defer frame.End()

	var g models.Group
	if err := s.db.QueryRowxContext(ctx, "SELECT invite_code, name, image_path FROM groups WHERE invite_code=$1", req.InviteCode).StructScan(&g); err != nil {
		frame.Errorf("Group scan err: %v", err)
		return nil, errInvalidCode
	}

	frame.Printf("code", req.InviteCode, "group", g)
	return &pb.SearchGroupResponse{Group: g.ToProto()}, nil
}

func (s *Server) GetGroupBalances(ctx context.Context, req *pb.GetGroupBalancesRequest) (*pb.GetGroupBalancesResponse, error) {
	ctx, frame := s.tracer.Frame(ctx, "GetGroupBalances")
	defer frame.End()

	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{Isolation: sql.LevelRepeatableRead})
	if err != nil {
		frame.Errorf("BeginTx err: %v", err)
		return nil, errCouldntGetGroupBalances
	}
	defer tx.Rollback()

	rows, err := tx.QueryxContext(ctx, `SELECT users.id, users.username, users.image_path, balance
											FROM user_group
											JOIN users ON user_id=users.id
											WHERE group_id=$1
											ORDER BY users.username`, req.GroupId)
	if err != nil {
		frame.Errorf("SELECT FROM user_group JOIN users err: %v", err)
		return nil, errCouldntGetGroupBalances
	}
	defer rows.Close()

	var users []*pb.User
	for rows.Next() {
		var x models.User
		if err := rows.StructScan(&x); err != nil {
			frame.Errorf("User scan err: %v", err)
			return nil, errCouldntGetGroupBalances
		}
		users = append(users, x.ToProto())
	}

	if err := tx.Commit(); err != nil {
		frame.Errorf("tx commit err: %v", err)
		return nil, errCouldntGetGroupBalances
	}
	frame.Printf("group_id", req.GroupId, "len(users)", len(users))
	return &pb.GetGroupBalancesResponse{Users: users}, nil
}

func (s *Server) GetGroupUsers(ctx context.Context, req *pb.GetGroupUsersRequest) (*pb.GetGroupUsersResponse, error) {
	ctx, frame := s.tracer.Frame(ctx, "GetGroupUsers")
	defer frame.End()

	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{})
	if err != nil {
		frame.Errorf("BeginTx err: %v", err)
		return nil, errCouldntGetUsers
	}
	defer tx.Rollback()

	rows, err := tx.QueryxContext(ctx, `SELECT users.id, username, image_path FROM user_group
											JOIN users ON users.id=user_id
											WHERE group_id=$1`, req.GroupId)
	if err != nil {
		frame.Errorf("SELECT FROM user_group JOIN users err: %v", err)
		return nil, errCouldntGetUsers
	}
	defer rows.Close()

	var users []*pb.User
	myId := ctx.Value(ctxIdKey).(string)
	foundMyId := false
	for rows.Next() {
		var x models.User
		if err := rows.StructScan(&x); err != nil {
			frame.Errorf("User scan err: %v", err)
			return nil, errCouldntGetUsers
		}
		if x.Id == myId {
			foundMyId = true
		}
		users = append(users, x.ToProto())
	}

	if !foundMyId {
		frame.Errorf("id not found in users, id=%v, users=%v", myId, users)
		return nil, status.Errorf(codes.Internal, "Invalid group id")
	}

	if err := tx.Commit(); err != nil {
		frame.Errorf("tx commit err: %v", err)
		return nil, errCouldntGetUsers
	}

	frame.Printf("group_id", req.GroupId, "len(users)", len(users))
	return &pb.GetGroupUsersResponse{Users: users}, nil
}

func (s *Server) AddUsersToGroup(ctx context.Context, req *pb.AddUsersToGroupRequest) (*pb.Empty, error) {
	ctx, frame := s.tracer.Frame(ctx, "AddUsersToGroup")
	defer frame.End()

	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		frame.Errorf("BeginTx err: %v", err)
		return nil, errCouldntAddUsers
	}
	defer tx.Rollback()

	var x int
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM groups WHERE id=$1 FOR UPDATE", req.GroupId).Scan(&x); err != nil {
		frame.Errorf("SELECT FROM groups err: %v", err)
		return nil, errInvalidGroupId
	}
	myId := ctx.Value(ctxIdKey).(string)
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM user_group WHERE group_id=$1 AND user_id=$2", req.GroupId, myId).Scan(&x); err != nil {
		frame.Errorf("SELECT FROM user_group err: %v", err)
		return nil, errInvalidGroupId
	}

	addedCnt, err := s.addUsersToGroup(ctx, tx, req.GroupId, req.UsersIds)
	if err != nil {
		frame.Errorf("addUsersToGroup err: %v", err)
		return nil, errCouldntAddUsers
	}

	if addedCnt != len(req.UsersIds) {
		frame.Printf("addedCnt != len(users_ids), addedCnt=%v, len(users_ids)=%v", addedCnt, len(req.UsersIds))
		return nil, status.Errorf(codes.InvalidArgument, "Invalid users ids")
	}

	if err := tx.Commit(); err != nil {
		frame.Printf("tx commit err: %v", err)
		return nil, errCouldntAddUsers
	}
	frame.Printf("id", myId, "added_cnt", addedCnt)
	return &pb.Empty{}, nil
}

func (s *Server) CreateGroup(ctx context.Context, req *pb.CreateGroupRequest) (*pb.CreateGroupResponse, error) {
	ctx, frame := s.tracer.Frame(ctx, "CreateGroup")
	defer frame.End()

	if req.Name == "" {
		frame.Errorf("name == \"\"")
		return nil, status.Errorf(codes.InvalidArgument, "Group name is empty")
	}
	if req.Type != 0 && req.Type != 1 {
		frame.Errorf("type != 0 && type != 1")
		return nil, status.Errorf(codes.InvalidArgument, "Invalid type")
	}

	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		frame.Errorf("BeginTx err: %v", err)
		return nil, errCouldntCreateGroup
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)
	if _, err := tx.ExecContext(ctx, "SELECT 1 FROM users WHERE id=$1 FOR UPDATE", myId); err != nil {
		frame.Errorf("SELECT FROM users err: %v", err)
		return nil, errCouldntCreateGroup
	}

	var x int
	if err := tx.QueryRowContext(ctx, "SELECT COUNT(group_id) FROM user_group WHERE user_id=$1", myId).Scan(&x); err != nil {
		frame.Errorf("SELECT FROM user_group err: %v", err)
		return nil, errCouldntCreateGroup
	}

	if x >= 50 {
		frame.Errorf("user have %v groups (>50)", x)
		return nil, status.Errorf(codes.InvalidArgument, "User can have 50 groups max")
	}

	groupId := uuid.New()
	code, err := genCode()
	if err != nil {
		frame.Errorf("genCode err: %v", err)
		return nil, errCouldntCreateGroup
	}
	if _, err := tx.ExecContext(ctx, "INSERT INTO groups (id, name, image_path, invite_code, type) VALUES ($1, $2, $3, $4, $5)", groupId, req.Name, req.ImagePath, code, req.Type); err != nil {
		frame.Errorf("INSERT INTO groups err: %v", err)
		return nil, errCouldntCreateGroup
	}

	req.UsersIds = append(req.UsersIds, myId)

	addedCnt, err := s.addUsersToGroup(ctx, tx, groupId.String(), req.UsersIds)
	if err != nil {
		frame.Errorf("addUsersToGroup err: %v", err)
		return nil, errCouldntCreateGroup
	}

	if addedCnt != len(req.UsersIds) {
		frame.Errorf("addedCnt != len(users_ids), addedCnt=%v, len(users_ids)=%v", addedCnt, len(req.UsersIds))
		return nil, status.Errorf(codes.InvalidArgument, "Invalid users ids")
	}

	if err := tx.Commit(); err != nil {
		frame.Errorf("tx commit err: %v", err)
		return nil, errCouldntAddUsers
	}
	frame.Printf("id", myId, "group_id", groupId, "addedCnt", addedCnt)
	return &pb.CreateGroupResponse{GroupId: groupId.String()}, nil
}

func (s *Server) addUsersToGroup(ctx context.Context, tx *sql.Tx, groupId string, usersIds []string) (int, error) {
	ctx, frame := s.tracer.Frame(ctx, "addUsersToGroup")
	defer frame.End()

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
		frame.Errorf("INSERT INTO user_group err: %v", err)
		return 0, err
	}
	defer rows.Close()

	addedCnt := 0
	for rows.Next() {
		var x int
		if err := rows.Scan(&x); err != nil {
			frame.Errorf("int scan err: %v", err)
			return 0, err
		}
		addedCnt += 1
	}
	frame.Printf("addedCnt", addedCnt)
	return addedCnt, nil
}

func (s *Server) DeleteGroup(ctx context.Context, req *pb.DeleteGroupRequest) (*pb.Empty, error) {
	ctx, frame := s.tracer.Frame(ctx, "DeleteGroup")
	defer frame.End()

	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		frame.Errorf("BeginTx err: %v", err)
		return nil, errCouldntDeleteGroup
	}
	defer tx.Rollback()

	var x int
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM groups WHERE id=$1 FOR UPDATE", req.GroupId).Scan(&x); err != nil {
		frame.Errorf("SELECT FROM groups err: %v", err)
		return nil, errInvalidGroupId
	}
	myId := ctx.Value(ctxIdKey).(string)
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM user_group WHERE group_id=$1 AND user_id=$2", req.GroupId, myId).Scan(&x); err != nil {
		frame.Errorf("SELECT FROM user_group err: %v", err)
		return nil, errInvalidGroupId
	}

	if _, err := tx.ExecContext(ctx, "DELETE FROM groups WHERE id=$1", req.GroupId); err != nil {
		frame.Errorf("DELETE FROM groups err: %v", err)
		return nil, errCouldntDeleteGroup
	}

	if err := tx.Commit(); err != nil {
		frame.Errorf("tx commit err: %v", err)
		return nil, errCouldntDeleteGroup
	}
	frame.Printf("group_id", req.GroupId)
	return &pb.Empty{}, nil
}

func (s *Server) GetGroup(ctx context.Context, req *pb.GetGroupRequest) (*pb.GetGroupResponse, error) {
	ctx, frame := s.tracer.Frame(ctx, "GetGroup")
	defer frame.End()

	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{})
	if err != nil {
		frame.Errorf("BeginTx err: %v", err)
		return nil, errCouldntGetGroup
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)
	var x int
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM user_group WHERE group_id=$1 AND user_id=$2", req.GroupId, myId).Scan(&x); err != nil {
		frame.Errorf("int scan err: %v", err)
		return nil, errInvalidGroupId
	}

	var group models.Group
	if err := tx.QueryRowxContext(ctx, "SELECT id, name, image_path, type, invite_code FROM groups WHERE id=$1", req.GroupId).StructScan(&group); err != nil {
		frame.Errorf("Group scan err: %v", err)
		return nil, errCouldntGetGroup
	}

	if err := tx.Commit(); err != nil {
		frame.Errorf("tx commit err: %v", err)
		return nil, errCouldntGetGroup
	}
	frame.Printf("id", myId, "group_id", group.Id)
	return &pb.GetGroupResponse{Group: group.ToProto()}, nil
}

func (s *Server) ChangeGroupType(ctx context.Context, req *pb.ChangeGroupTypeRequest) (*pb.Empty, error) {
	ctx, frame := s.tracer.Frame(ctx, "ChangeGroupType")
	defer frame.End()

	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		frame.Errorf("BeginTx err: %v", err)
		return nil, errCouldntChangeGroupType
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)
	var x int
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM user_group WHERE group_id=$1 AND user_id=$2", req.GroupId, myId).Scan(&x); err != nil {
		frame.Errorf("int scan err: %v", err)
		return nil, errInvalidGroupId
	}

	if _, err := tx.ExecContext(ctx, "UPDATE groups SET type=$1 WHERE id=$2", req.NewType, req.GroupId); err != nil {
		frame.Errorf("UPDATE groups err: %v", err)
		return nil, errCouldntChangeGroupType
	}

	if err := tx.Commit(); err != nil {
		frame.Errorf("tx commit err: %v", err)
		return nil, errCouldntChangeGroupType
	}
	frame.Printf("group_id", req.GroupId, "type", req.NewType)
	return &pb.Empty{}, nil
}

func (s *Server) GetUserPayersDebtorsInGroup(ctx context.Context, req *pb.GetUserPayersDebtorsInGroupRequest) (*pb.GetUserPayersDebtorsInGroupResponse, error) {
	ctx, frame := s.tracer.Frame(ctx, "GetUserPayersDebtorsInGroup")
	defer frame.End()

	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{Isolation: sql.LevelRepeatableRead})
	if err != nil {
		frame.Errorf("BeginTx err: %v", err)
		return nil, errCouldntGetPayersAndDebtors
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)
	var x int
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM user_group WHERE group_id=$1 AND user_id=$2", req.GroupId, myId).Scan(&x); err != nil {
		frame.Errorf("SELECT FROM user_group err: %v", err)
		return nil, errInvalidGroupId
	}

	debtorsRows, err := tx.QueryxContext(ctx, `SELECT username, users.image_path, amount
												FROM debts
												JOIN groups ON group_id=groups.id
												JOIN users ON debtor_id=users.id
												WHERE group_id=$1 AND debts.type=groups.type AND payer_id=$2`, req.GroupId, req.UserId)
	if err != nil {
		frame.Errorf("SELECT FROM debts JOIN groups JOIN users err: %v", err)
		return nil, errCouldntGetPayersAndDebtors
	}
	defer debtorsRows.Close()
	payersRows, err := tx.QueryxContext(ctx, `SELECT username, users.image_path, amount
												FROM debts
												JOIN groups ON group_id=groups.id
												JOIN users ON payer_id=users.id
												WHERE group_id=$1 AND debts.type=groups.type AND debtor_id=$2`, req.GroupId, req.UserId)
	if err != nil {
		frame.Errorf("SELECT FROM debts JOIN groups JOIN users err: %v", err)
		return nil, errCouldntGetPayersAndDebtors
	}
	defer payersRows.Close()

	var debtors, payers []*pb.User

	for debtorsRows.Next() {
		var x models.User
		if err := debtorsRows.StructScan(&x); err != nil {
			frame.Errorf("User scan err: %v", err)
			return nil, errCouldntGetPayersAndDebtors
		}
		debtors = append(debtors, x.ToProto())
	}
	for payersRows.Next() {
		var x models.User
		if err := debtorsRows.StructScan(&x); err != nil {
			frame.Errorf("User scan err: %v", err)
			return nil, errCouldntGetPayersAndDebtors
		}
		payers = append(payers, x.ToProto())
	}

	if err := tx.Commit(); err != nil {
		frame.Errorf("tx commit err: %v", err)
		return nil, errCouldntGetPayersAndDebtors
	}
	frame.Printf("id", myId, "len(debtors)", len(debtors), "len(payers)", len(payers))
	return &pb.GetUserPayersDebtorsInGroupResponse{Debtors: debtors, Payers: payers}, nil
}

func (s *Server) GetGroupDebts(ctx context.Context, req *pb.GetGroupDebtsRequest) (*pb.GetGroupDebtsResponse, error) {
	ctx, frame := s.tracer.Frame(ctx, "GetGroupDebts")
	defer frame.End()

	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{Isolation: sql.LevelRepeatableRead})
	if err != nil {
		frame.Errorf("BeginTx err: %v", err)
		return nil, status.Errorf(codes.Internal, "Couldn't get group debts")
	}
	defer tx.Rollback()

	rows, err := tx.QueryxContext(ctx, `SELECT payer_id, debtor_id, amount FROM debts
											JOIN groups ON groups.id=group_id AND debts.type=groups.type
											WHERE group_id=$1`, req.GroupId)
	if err != nil {
		frame.Errorf("SELECT FROM debts err: %v", err)
		return nil, status.Errorf(codes.Internal, "Couldn't get group debts")
	}

	var debts []*pb.Debt
	for rows.Next() {
		var x models.Debt
		if err := rows.StructScan(&x); err != nil {
			frame.Errorf("Debt scan err: %v", err)
			return nil, status.Errorf(codes.Internal, "Couldn't get group debts")
		}
		debts = append(debts, x.ToProto())
	}
	frame.Printf("group_id", req.GroupId, "len(debts)", len(debts))
	return &pb.GetGroupDebtsResponse{Debts: debts}, nil
}
