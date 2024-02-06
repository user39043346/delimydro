package server

import (
	"context"
	"database/sql"

	"github.com/user39043346/delimydro/internal/models"
	pb "github.com/user39043346/delimydro/proto/api"
)

func (s *Server) ExpenseInfo(ctx context.Context, req *pb.ExpenseInfoRequest) (*pb.ExpenseInfoResponse, error) {
	ctx, frame := s.tracer.Frame(ctx, "ExpenseInfo")
	defer frame.End()

	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{Isolation: sql.LevelRepeatableRead})
	if err != nil {
		frame.Errorf("db.BeginTxx err: %v", err)
		return nil, errCouldntGetExpense
	}
	defer tx.Rollback()

	rows, err := tx.QueryxContext(ctx, `SELECT payer_id, debtor_id, amount FROM expense_items WHERE expense_id=$1`, req.ExpenseId)
	if err != nil {
		frame.Errorf("SELECT FROM expense_items err: %v", err)
		return nil, errCouldntGetExpense
	}
	defer rows.Close()

	var usersDistribution []*pb.Debt
	for rows.Next() {
		var x models.Debt
		if err := rows.StructScan(&x); err != nil {
			frame.Errorf("Debt scan err: %v", err)
			return nil, errCouldntGetExpense
		}
		usersDistribution = append(usersDistribution, x.ToProto())
	}

	if err := tx.Commit(); err != nil {
		frame.Errorf("tx commit err: %v", err)
		return nil, errCouldntGetExpense
	}

	frame.Printf("expense_id", req.ExpenseId, "len(usersDistribution)", len(usersDistribution))
	return &pb.ExpenseInfoResponse{UsersDistribution: usersDistribution}, nil
}
