package models

import (
	pb "github.com/user39043346/delimydro/proto/api"
)

type Debt struct {
	PayerId  string `db:"payer_id"`
	DebtorId string `db:"debtor_id"`
	Amount   int64  `db:"amount"`
}

func (d *Debt) ToProto() *pb.Debt {
	return &pb.Debt{PayerId: d.PayerId, DebtorId: d.DebtorId, Amount: d.Amount}
}

func DebtFromProto(d *pb.Debt) *Debt {
	return &Debt{PayerId: d.PayerId, DebtorId: d.DebtorId, Amount: d.Amount}
}
