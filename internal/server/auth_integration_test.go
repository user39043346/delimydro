package server_test

import (
	"context"
	"testing"

	pb "github.com/user39043346/delimydro/proto/api"
	utils "github.com/user39043346/delimydro/testutils"

	"github.com/stretchr/testify/require"
)

func TestAuth(t *testing.T) {
	c, err := utils.GetClient()
	require.NoError(t, err)

	username := utils.GetValidString(10)
	password := utils.GetValidString(10)

	t.Run("register_ok", func(t *testing.T) {
		_, err := c.Register(context.Background(), &pb.RegisterRequest{Username: username, Password: password})
		require.NoError(t, err)
	})
	t.Run("login ok", func(t *testing.T) {
		_, err := c.Login(context.Background(), &pb.LoginRequest{Username: username, Password: password})
		require.NoError(t, err)
	})
	t.Run("register_exists_user", func(t *testing.T) {
		_, err := c.Register(context.Background(), &pb.RegisterRequest{Username: username, Password: password})
		require.Error(t, err)
	})
}
