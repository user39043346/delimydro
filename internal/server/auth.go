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
	ctx, frame := s.tracer.Frame(ctx, "Register")
	defer frame.End()

	if req.Username == "" || req.Password == "" {
		frame.Errorf("username or password is empty")
		return nil, status.Errorf(codes.Unauthenticated, "username or password is empty")
	}
	if len(req.Username) > 32 || len(req.Password) > 32 {
		frame.Errorf("username or password length > 32")
		return nil, status.Errorf(codes.Unauthenticated, "username or password length is greater than 32")
	}
	code, err := genCode()
	if err != nil {
		frame.Errorf("genCode err: %v", err)
		return nil, errCouldntCreateUser
	}
	userId := uuid.New().String()
	token, err := s.tm.NewToken(userId)
	if err != nil {
		frame.Errorf("token.TokenManager.NewToken: %v", err)
		return nil, errCouldntCreateUser
	}
	if _, err := s.db.ExecContext(ctx, "INSERT INTO users (id, username, image_path, password_hash, code) VALUES ($1, $2, $3, $4, $5)", userId, req.Username, req.ImagePath, hash(req.Password), code); err != nil {
		frame.Errorf("db INSERT err: %v", err)
		return nil, status.Error(codes.Unauthenticated, "User exists")
	}
	frame.Printf("token", token, "username", req.Username)
	return &pb.Token{Token: token}, nil
}

func (s *Server) Login(ctx context.Context, req *pb.LoginRequest) (*pb.Token, error) {
	ctx, frame := s.tracer.Frame(ctx, "Login")
	defer frame.End()

	var id uuid.UUID
	if err := s.db.QueryRowContext(ctx, "SELECT id FROM users WHERE username=$1 AND password_hash=$2", req.Username, hash(req.Password)).Scan(&id); err != nil {
		frame.Errorf("invalid username or password: (%s, %s)", req.Username, hash(req.Password))
		return nil, status.Errorf(codes.Unauthenticated, "invalid username or password")
	}
	token, err := s.tm.NewToken(id.String())
	if err != nil {
		frame.Errorf("TokenManager.NewToken err: %v", err)
		return nil, status.Errorf(codes.Unauthenticated, "Couldn't login")
	}

	frame.Printf("token", token, "username", req.Username)
	return &pb.Token{Token: token}, nil
}

func (s *Server) RenewToken(ctx context.Context, req *pb.Empty) (*pb.Token, error) {
	ctx, frame := s.tracer.Frame(ctx, "RenewToken")
	defer frame.End()

	id := ctx.Value(ctxIdKey).(string)
	token, err := s.tm.NewToken(id)
	if err != nil {
		frame.Errorf("TokenManager.NewToken err: %v", err)
		return nil, status.Errorf(codes.Unauthenticated, "Couldn't renew token")
	}

	frame.Printf("token", token, "id", id)
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
