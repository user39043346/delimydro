package server

import (
	"context"
	"database/sql"

	"github.com/user39043346/delimydro/internal/models"
	pb "github.com/user39043346/delimydro/proto/api"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) ExpenseInfo(ctx context.Context, req *pb.ExpenseInfoRequest) (*pb.ExpenseInfoResponse, error) {
	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{Isolation: sql.LevelRepeatableRead})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get expense")
	}
	defer tx.Rollback()

	rows, err := tx.QueryxContext(ctx, `SELECT payer_id, debtor_id, amount FROM expense_items WHERE expense_id=$1`, req.ExpenseId)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't get expense")
	}
	defer rows.Close()

	var usersDistribution []*pb.Debt
	for rows.Next() {
		var x models.Debt
		if err := rows.StructScan(&x); err != nil {
			return nil, status.Errorf(codes.Internal, "Couldn't get expense")
		}
		usersDistribution = append(usersDistribution, x.ToProto())
	}
	return &pb.ExpenseInfoResponse{UsersDistribution: usersDistribution}, nil
}
