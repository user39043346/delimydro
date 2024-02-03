package server

import (
	"github.com/user39043346/delimydro/internal/tokens"
	pb "github.com/user39043346/delimydro/proto/api"

	"github.com/jmoiron/sqlx"
)

type Server struct {
	tm tokens.TokenManager
	db *sqlx.DB
	pb.UnimplementedServiceServer
}

func NewServer(db *sqlx.DB, secretKey string) *Server {
	s := &Server{db: db, tm: tokens.NewTokenManager(secretKey)}
	return s
}
