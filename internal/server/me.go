package server

import (
	"context"
	"database/sql"

	"github.com/user39043346/delimydro/internal/models"
	pb "github.com/user39043346/delimydro/proto/api"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) MyProfile(ctx context.Context, req *pb.Empty) (*pb.MyProfileResponse, error) {
	ctx, frame := s.tracer.Frame(ctx, "MyProfile")
	defer frame.End()

	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{Isolation: sql.LevelRepeatableRead})
	if err != nil {
		frame.Errorf("BeginTx err: %v", err)
		return nil, status.Errorf(codes.Internal, "Couldn't get profile")
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)
	var user models.User
	if err := s.db.QueryRowxContext(ctx, "SELECT id, username, image_path, code FROM users WHERE id=$1", myId).StructScan(&user); err != nil {
		frame.Errorf("SELECT FROM users err: %v", err)
		return nil, status.Errorf(codes.InvalidArgument, "Invalid user id")
	}

	rows, err := tx.QueryxContext(ctx, `SELECT groups.id, groups.name, groups.image_path, invite_code, balance, type
											FROM user_group
											JOIN groups ON user_group.group_id=groups.id
											WHERE user_group.user_id=$1
											ORDER BY groups.name`, myId)
	if err != nil {
		frame.Errorf("SELECT FROM user_group JOIN groups err: %v", err)
		return nil, status.Errorf(codes.Internal, "Couldn't get profile")
	}
	defer rows.Close()

	var groups []*pb.Group
	for rows.Next() {
		var x models.Group
		if err := rows.StructScan(&x); err != nil {
			frame.Errorf("Group scan err: %v", err)
			return nil, status.Errorf(codes.Internal, "Couldn't get profile")
		}
		groups = append(groups, x.ToProto())
	}

	rows, err = tx.QueryxContext(ctx, `SELECT users.id, username, image_path
											FROM friends
											JOIN users ON friends.debtor_id=users.id
											WHERE friends.payer_id=$1
											ORDER BY username`, myId)
	if err != nil {
		frame.Errorf("SELECT FROM friends JOIN users err: %v", err)
		return nil, status.Errorf(codes.Internal, "Couldn't get profile")
	}
	defer rows.Close()

	var friends []*pb.User
	for rows.Next() {
		var x models.User
		if err := rows.StructScan(&x); err != nil {
			frame.Errorf("User scan err: %v", err)
			return nil, status.Errorf(codes.Internal, "Couldn't get profile")
		}
		friends = append(friends, x.ToProto())
	}

	if err := tx.Commit(); err != nil {
		frame.Errorf("tx commit err: %v", err)
		return nil, status.Errorf(codes.Internal, "Couldn't get profile")
	}
	frame.Printf("id", user.Id, "len(groups)", len(groups), "len(friends)", len(friends))
	return &pb.MyProfileResponse{User: user.ToProto(), Groups: groups, Friends: friends}, nil
}

func (s *Server) ListMyGroups(ctx context.Context, req *pb.Empty) (*pb.ListMyGroupsResponse, error) {
	ctx, frame := s.tracer.Frame(ctx, "ListMyGroups")
	defer frame.End()

	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{Isolation: sql.LevelRepeatableRead})
	if err != nil {
		frame.Errorf("BeginTx err: %v", err)
		return nil, status.Errorf(codes.Internal, "Couldn't get groups")
	}
	defer tx.Rollback()

	myId := ctx.Value(ctxIdKey).(string)

	rows, err := tx.QueryxContext(ctx, `SELECT groups.id, groups.name, groups.image_path, balance, type
											FROM user_group
											JOIN groups ON user_group.group_id=groups.id
											WHERE user_group.user_id=$1`, myId)
	if err != nil {
		frame.Errorf("SELECT FROM user_group JOIN groups err: %v", err)
		return nil, status.Errorf(codes.Internal, "Couldn't get groups")
	}
	defer rows.Close()

	var groups []*pb.Group
	for rows.Next() {
		var x models.Group
		if err := rows.StructScan(&x); err != nil {
			frame.Errorf("Group scan err: %v", err)
			return nil, status.Errorf(codes.Internal, "Couldn't get groups")
		}
		groups = append(groups, x.ToProto())
	}

	if err := tx.Commit(); err != nil {
		frame.Errorf("tx commit err: %v", err)
		return nil, status.Errorf(codes.Internal, "Couldn't get groups")
	}
	frame.Printf("id", myId, "len(groups)", len(groups))
	return &pb.ListMyGroupsResponse{Groups: groups}, nil
}

func (s *Server) LeaveGroup(ctx context.Context, req *pb.LeaveGroupRequest) (*pb.Empty, error) {
	ctx, frame := s.tracer.Frame(ctx, "LeaveGroup")
	defer frame.End()

	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		frame.Errorf("BeginTx err: %v", err)
		return nil, status.Errorf(codes.Internal, "Couldn't leave group")
	}
	defer tx.Rollback()

	var x int
	if err := tx.QueryRowContext(ctx, "SELECT 1 FROM groups WHERE group_id=$1 FOR UPDATE", req.GroupId).Scan(&x); err != nil {
		frame.Errorf("SELECT FROM groups err: %v", err)
		return nil, status.Errorf(codes.InvalidArgument, "Invalid group id")
	}
	myId := ctx.Value(ctxIdKey).(string)
	if _, err := tx.ExecContext(ctx, "DELETE FROM user_group WHERE group_id=$1 AND user_id=$2", req.GroupId, myId); err != nil {
		frame.Errorf("DELET FROM user_group err: %v", err)
		return nil, status.Errorf(codes.Internal, "Couldn't leave group")
	}

	if err := tx.Commit(); err != nil {
		frame.Errorf("tx commit err: %v", err)
		return nil, status.Errorf(codes.Internal, "Couldn't leave group")
	}
	frame.Printf("id", myId, "group_id", req.GroupId)
	return &pb.Empty{}, nil
}

func (s *Server) JoinGroup(ctx context.Context, req *pb.JoinGroupRequest) (*pb.Empty, error) {
	ctx, frame := s.tracer.Frame(ctx, "JoinGroup")
	defer frame.End()

	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		frame.Errorf("BeginTx err: %v", err)
		return nil, status.Errorf(codes.Internal, "Couldn't join group")
	}
	defer tx.Rollback()

	var groupId string
	if err := tx.QueryRowContext(ctx, "SELECT id FROM groups WHERE invite_code=$1", req.InviteCode).Scan(&groupId); err != nil {
		frame.Errorf("SELECT FROM groups err: %v", err)
		return nil, status.Errorf(codes.Internal, "Couldn't join group")
	}
	myId := ctx.Value(ctxIdKey).(string)
	if _, err := tx.ExecContext(ctx, "INSERT INTO user_group (user_id, group_id, balance) VALUES ($1, $2, 0)", myId, groupId); err != nil {
		frame.Errorf("INSERT INTO user_group err: %v", err)
		return nil, status.Errorf(codes.InvalidArgument, "You've already joined this group")
	}

	if err := tx.Commit(); err != nil {
		frame.Errorf("tx commit err: %v", err)
		return nil, status.Errorf(codes.Internal, "Couldn't join group")
	}
	frame.Printf("id", myId, "group_id", groupId)
	return &pb.Empty{}, nil
}
