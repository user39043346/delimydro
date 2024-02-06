package server

import (
	"context"
	"strings"
	"time"

	"go.opentelemetry.io/otel/trace"
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
		ctx, frame := s.tracer.Frame(ctx, "AuthInterceptor")
		defer frame.End()

		method := getMethod(info.FullMethod)
		if method == "Login" || method == "Register" {
			return handler(ctx, req)
		}

		md, ok := metadata.FromIncomingContext(ctx)
		if !ok {
			frame.Errorf("missing metadata")
			return nil, status.Errorf(codes.Unauthenticated, "Missing metadata")
		}

		if len(md[authHeader]) != 1 {
			frame.Errorf("len(md[auth_header])=%v", len(md[authHeader]))
			return nil, status.Errorf(codes.Unauthenticated, "Missing auth token")
		}
		tokenString := md[authHeader][0]
		id, err := s.tm.GetIdFromToken(tokenString)
		if err != nil {
			frame.Errorf("invalid token: %v", err)
			return nil, status.Errorf(codes.Unauthenticated, "Invalid token")
		}

		var x int
		if err := s.db.QueryRow("SELECT 1 FROM users WHERE id=$1", id).Scan(&x); err != nil {
			frame.Errorf("SELECT FROM users err: %v", err)
			return nil, status.Errorf(codes.Unauthenticated, "User not found")
		}

		ctx = context.WithValue(ctx, ctxIdKey, id)
		frame.Printf("token", tokenString, "id", id)
		return handler(ctx, req)
	}
}

func TracerInterceptor(
	ctx context.Context,
	req any,
	info *grpc.UnaryServerInfo,
	handler grpc.UnaryHandler,
) (resp any, err error) {
	traceId := trace.SpanContextFromContext(ctx).TraceID()

	resp, err = handler(ctx, req)

	header := metadata.Pairs("x-trace-id", traceId.String())
	grpc.SetHeader(ctx, header)

	return resp, err
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
