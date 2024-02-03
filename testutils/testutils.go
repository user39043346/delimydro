package testutils

import (
	"context"
	"math/rand"

	pb "github.com/user39043346/delimydro/proto/api"

	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
)

const (
	ADDR        = "127.0.0.1:1234"
	AUTH_HEADER = "authorization"
)

func GetClient() (pb.ServiceClient, error) {
	conn, err := grpc.Dial(ADDR, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	return pb.NewServiceClient(conn), nil
}

func ContextWithToken(token string) context.Context {
	return metadata.AppendToOutgoingContext(context.Background(), AUTH_HEADER, token)
}

func GetValidString(n int) string {
	alpha := []rune("1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM")
	s := make([]rune, n)
	for i := range s {
		s[i] = alpha[rand.Int()%len(alpha)]
	}
	return string(s)
}

func AddUser(t require.TestingT) string {
	c, err := GetClient()
	require.NoError(t, err)
	resp, err := c.Register(context.Background(), &pb.RegisterRequest{
		Username: GetValidString(10),
		Password: GetValidString(10),
	})
	require.NoError(t, err)

	return resp.Token
}

func CreateGroup(t require.TestingT, N int) (ctx []context.Context, usersIds []string, groupId string) {
	c, err := GetClient()
	require.NoError(t, err)

	ctx = make([]context.Context, N)
	usersIds = make([]string, N)
	for i := range usersIds {
		token := AddUser(t)
		ctx[i] = ContextWithToken(token)
		u, err := c.MyProfile(ctx[i], &pb.Empty{})
		usersIds[i] = u.User.Id
		require.NoError(t, err)
	}

	createGroupReq := &pb.CreateGroupRequest{
		Name:      GetValidString(10),
		ImagePath: "",
		Type:      0,
		UsersIds:  usersIds[1:],
	}
	createResp, err := c.CreateGroup(ctx[0], createGroupReq)
	require.NoError(t, err)
	groupId = createResp.GroupId
	return ctx, usersIds, groupId
}

func DiffContain(diff []*pb.Diff, u *pb.User) bool {
	for _, d := range diff {
		if d.UserId == u.Id && d.Diff == u.Balance {
			return true
		}
	}
	return false
}

func CheckGropbalances(ctx context.Context, t require.TestingT, groupId string, diffsMap map[string]int64) {
	c, err := GetClient()
	require.NoError(t, err)
	getBalancesResp, err := c.GetGroupBalances(ctx, &pb.GetGroupBalancesRequest{GroupId: groupId})
	require.NoError(t, err)

	for _, u := range getBalancesResp.Users {
		require.Equal(t, diffsMap[u.Id], u.Balance)
	}
}
