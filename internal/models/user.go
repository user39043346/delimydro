package models

import (
	pb "github.com/user39043346/delimydro/proto/api"
)

type User struct {
	Id        string `db:"id"`
	Username  string `db:"username"`
	ImagePath string `db:"image_path"`
	Balance   int64  `db:"balance"`
	Code      string `db:"code"`
}

func (u *User) ToProto() *pb.User {
	return &pb.User{
		Id:        u.Id,
		Username:  u.Username,
		ImagePath: u.ImagePath,
		Balance:   u.Balance,
		Code:      u.Code,
	}
}

func UserFromProto(u *pb.User) *User {
	return &User{
		Id:        u.Id,
		Username:  u.Username,
		ImagePath: u.ImagePath,
		Balance:   u.Balance,
		Code:      u.Code,
	}
}
