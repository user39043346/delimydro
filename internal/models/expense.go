package models

import (
	"time"

	pb "github.com/user39043346/delimydro/proto/api"

	"google.golang.org/protobuf/types/known/timestamppb"
)

type Expense struct {
	Id             string    `db:"id"`
	Name           string    `db:"name"`
	PayerName      *string   `db:"payer_name"`
	PayerImagePath string    `db:"payer_image_path"`
	DebtorName     *string   `db:"debtor_name"`
	TotalPaid      int64     `db:"total_paid"`
	Type           int64     `db:"type"`
	MyDiff         int64     `db:"my_diff"`
	Time           time.Time `db:"time"`
}

func (e *Expense) ToProto() *pb.Expense {
	if e.PayerName == nil {
		e.PayerName = new(string)
	}
	if e.DebtorName == nil {
		e.DebtorName = new(string)
	}
	return &pb.Expense{
		Id:             e.Id,
		Name:           e.Name,
		PayerName:      *e.PayerName,
		PayerImagePath: e.PayerImagePath,
		DebtorName:     *e.DebtorName,
		TotalPaid:      e.TotalPaid,
		Type:           e.Type,
		MyDiff:         e.MyDiff,
		Time:           timestamppb.New(e.Time),
	}
}

func ExpenseFromProto(e *pb.Expense) *Expense {
	return &Expense{
		Id:             e.Id,
		Name:           e.Name,
		PayerName:      &e.PayerName,
		PayerImagePath: e.PayerImagePath,
		DebtorName:     &e.DebtorName,
		TotalPaid:      e.TotalPaid,
		Type:           e.Type,
		MyDiff:         e.MyDiff,
		Time:           e.Time.AsTime(),
	}
}
