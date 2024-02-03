package models

import (
	pb "github.com/user39043346/delimydro/proto/api"
)

type Diff struct {
	UserId string `db:"user_id"`
	Diff   int64  `db:"diff"`
}

func (d *Diff) ToProto() *pb.Diff {
	return &pb.Diff{UserId: d.UserId, Diff: d.Diff}
}

func DiffFromProto(d *pb.Diff) *Diff {
	return &Diff{UserId: d.UserId, Diff: d.Diff}
}
