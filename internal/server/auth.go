package server

import (
	"context"
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"

	pb "github.com/user39043346/delimydro/proto/api"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) Register(ctx context.Context, req *pb.RegisterRequest) (*pb.Token, error) {
	if req.Username == "" || req.Password == "" {
		return nil, status.Errorf(codes.Unauthenticated, "username or password is empty")
	}
	if len(req.Username) > 32 || len(req.Password) > 32 {
		return nil, status.Errorf(codes.Unauthenticated, "username or password length is greater than 32")
	}
	code, err := genCode()
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Couldn't create user")
	}
	user_id := uuid.New().String()
	token, err := s.tm.NewToken(user_id)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "error creating token: %v", err)
	}
	if _, err := s.db.Exec("insert into users (id, username, image_path, password_hash, code) values ($1, $2, $3, $4, $5)", user_id, req.Username, req.ImagePath, hash(req.Password), code); err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "create user error: %v", err)
	}
	return &pb.Token{Token: token}, nil
}

func (s *Server) Login(ctx context.Context, req *pb.LoginRequest) (*pb.Token, error) {
	var id uuid.UUID
	if err := s.db.QueryRow("select id from users where username=$1 and password_hash=$2", req.Username, hash(req.Password)).Scan(&id); err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "invalid username or password")
	}
	token, err := s.tm.NewToken(id.String())
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "error creating token: %v", err)
	}
	return &pb.Token{Token: token}, nil
}

func (s *Server) RenewToken(ctx context.Context, req *pb.Empty) (*pb.Token, error) {
	id := ctx.Value(ctxIdKey).(string)
	token, err := s.tm.NewToken(id)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "create token error: %v", err)
	}
	return &pb.Token{Token: token}, nil
}

func genCode() (string, error) {
	b := make([]byte, 5)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func hash(s string) string {
	h := md5.Sum([]byte(s))
	return hex.EncodeToString(h[:])
}
