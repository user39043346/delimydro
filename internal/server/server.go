package server

import (
	"github.com/user39043346/delimydro/internal/tokens"
	"github.com/user39043346/delimydro/internal/tracer"
	pb "github.com/user39043346/delimydro/proto/api"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/jmoiron/sqlx"
)

var (
	errInvalidCode      = status.Errorf(codes.InvalidArgument, "Invalid code")
	errInvalidUserId    = status.Errorf(codes.InvalidArgument, "Invalid user_id")
	errInvalidExpenseId = status.Errorf(codes.InvalidArgument, "Invalid expense id")
	errInvalidGroupId   = status.Errorf(codes.InvalidArgument, "Invalid group id")

	errCouldntListFriends  = status.Errorf(codes.Internal, "Couldn't list friends")
	errCouldntListExpenses = status.Errorf(codes.Internal, "Couldn't list expenses")

	errCouldntAddFriend  = status.Errorf(codes.Internal, "Couldn't add friend")
	errCouldntAddExpense = status.Errorf(codes.Internal, "Couldn't add expense")
	errCouldntAddUsers   = status.Errorf(codes.Internal, "Couldn't add users")

	errCouldntCreateUser    = status.Errorf(codes.Internal, "Couldn't create user")
	errCouldntCreateExpense = status.Errorf(codes.Internal, "Couldn't create expense")
	errCouldntCreateGroup   = status.Errorf(codes.Internal, "Couldn't create group")

	errCouldntGetUsers         = status.Errorf(codes.Internal, "Couldn't get users")
	errCouldntGetExpense       = status.Errorf(codes.Internal, "Couldn't get expense")
	errCouldntGetGroupBalances = status.Errorf(codes.Internal, "Couldn't get group balances")
	errCouldntGetGroup         = status.Errorf(codes.Internal, "Couldn't get group")

	errCouldntDeleteExpense = status.Errorf(codes.Internal, "Couldn't delete expense")
	errCouldntDeleteGroup   = status.Errorf(codes.Internal, "Couldn't delete group")

	errCouldntSettleUp = status.Errorf(codes.Internal, "Couldn't settle up")

	errCouldntChangeGroupType = status.Errorf(codes.Internal, "Couldn't change group type")

	errCouldntGetPayersAndDebtors = status.Errorf(codes.Internal, "Couldn't get payers and debtors")
)

type Server struct {
	tm     tokens.TokenManager
	db     *sqlx.DB
	tracer *tracer.Tracer
	pb.UnimplementedServiceServer
}

func NewServer(db *sqlx.DB, secretKey string, t trace.Tracer, logger *zap.Logger) *Server {
	s := &Server{
		db:     db,
		tm:     tokens.NewTokenManager(secretKey),
		tracer: tracer.NewTracer(t, logger),
	}
	return s
}
