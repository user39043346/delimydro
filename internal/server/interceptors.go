package server

import (
	"context"
	"strings"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

const authHeader = "authorization"

type ctxIdKeyType struct{}

var ctxIdKey = ctxIdKeyType{}

func getMethod(fullMethod string) string {
	method := strings.Split(fullMethod, "/")[2]
	return method
}

func (s *Server) AuthInterceptor() grpc.UnaryServerInterceptor {
	return func(
		ctx context.Context,
		req any,
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
	) (resp any, err error) {
		method := getMethod(info.FullMethod)
		if method == "Login" || method == "Register" {
			return handler(ctx, req)
		}

		md, ok := metadata.FromIncomingContext(ctx)
		if !ok {
			return nil, status.Errorf(codes.Unauthenticated, "missing metadata")
		}

		if len(md[authHeader]) != 1 {
			return nil, status.Errorf(codes.Unauthenticated, "missing auth token")
		}
		tokenString := md[authHeader][0]
		id, err := s.tm.GetIdFromToken(tokenString)
		if err != nil {
			return nil, status.Errorf(codes.Unauthenticated, "invalid token: %v", err)
		}

		var x int
		if err := s.db.QueryRow("select 1 from users where id=$1", id).Scan(&x); err != nil {
			return nil, status.Errorf(codes.Unauthenticated, "no such user")
		}

		ctx = context.WithValue(ctx, ctxIdKey, id)

		return handler(ctx, req)
	}
}

func TimeoutInterceptor(
	ctx context.Context,
	req any,
	info *grpc.UnaryServerInfo,
	handler grpc.UnaryHandler,
) (resp any, err error) {
	ctx, cancel := context.WithTimeout(ctx, time.Second*5)
	defer cancel()

	resp, err = handler(ctx, req)

	if ctx.Err() != nil {
		return nil, status.Error(codes.DeadlineExceeded, "Timeout")
	}
	return resp, err
}
