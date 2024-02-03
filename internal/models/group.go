package models

import (
	pb "github.com/user39043346/delimydro/proto/api"
)

type Group struct {
	Id         string `db:"id"`
	Name       string `db:"name"`
	ImagePath  string `db:"image_path"`
	Balance    int64  `db:"balance"`
	Type       int64  `db:"type"`
	InviteCode string `db:"invite_code"`
}

func (g *Group) ToProto() *pb.Group {
	return &pb.Group{
		Id:         g.Id,
		Name:       g.Name,
		ImagePath:  g.ImagePath,
		Balance:    g.Balance,
		Type:       g.Type,
		InviteCode: g.InviteCode,
	}
}

func GroupFromProto(g *pb.Group) *Group {
	return &Group{
		Id:         g.Id,
		Name:       g.Name,
		ImagePath:  g.ImagePath,
		Balance:    g.Balance,
		Type:       g.Type,
		InviteCode: g.InviteCode,
	}
}
