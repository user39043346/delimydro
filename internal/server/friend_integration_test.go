package server_test

import (
	"math/rand"
	"testing"

	pb "github.com/user39043346/delimydro/proto/api"
	utils "github.com/user39043346/delimydro/testutils"

	"github.com/stretchr/testify/require"
)

func TestFriend(t *testing.T) {
	t.Run("add_friend", func(t *testing.T) {
		token1 := utils.AddUser(t)
		token2 := utils.AddUser(t)
		c, err := utils.GetClient()
		require.NoError(t, err)

		ctx1 := utils.ContextWithToken(token1)
		ctx2 := utils.ContextWithToken(token2)

		resp, err := c.MyProfile(ctx1, &pb.Empty{})
		require.NoError(t, err)
		u1 := resp.User

		resp, err = c.MyProfile(ctx2, &pb.Empty{})
		require.NoError(t, err)
		u2 := resp.User

		_, err = c.AddFriend(ctx1, &pb.AddFriendRequest{Code: u2.Code})
		require.NoError(t, err)

		_, err = c.AddFriend(ctx2, &pb.AddFriendRequest{Code: u1.Code})
		require.Error(t, err)

		r1, err := c.ListMyFriends(ctx1, &pb.Empty{})
		require.NoError(t, err)
		require.Equal(t, 1, len(r1.Friends))
		require.Equal(t, u2.Id, r1.Friends[0].Id)

		r2, err := c.ListMyFriends(ctx2, &pb.Empty{})
		require.NoError(t, err)
		require.Equal(t, 1, len(r2.Friends))
		require.Equal(t, u1.Id, r2.Friends[0].Id)
	})

	t.Run("friend_expense_ok", func(t *testing.T) {
		token1 := utils.AddUser(t)
		token2 := utils.AddUser(t)
		c, err := utils.GetClient()
		require.NoError(t, err)

		ctx1 := utils.ContextWithToken(token1)
		ctx2 := utils.ContextWithToken(token2)

		resp, err := c.MyProfile(ctx1, &pb.Empty{})
		require.NoError(t, err)
		u1 := resp.User
		resp, err = c.MyProfile(ctx2, &pb.Empty{})
		require.NoError(t, err)
		u2 := resp.User

		_, err = c.AddFriend(ctx1, &pb.AddFriendRequest{Code: u2.Code})
		require.NoError(t, err)

		req := &pb.CreateFriendExpenseRequest{
			FriendId:       u2.Id,
			Amount:         int64(rand.Int()%100) + 11,
			FriendIsDebtor: bool((rand.Int() % 2) == 1),
			ExpenseName:    utils.GetValidString(10),
		}
		payer := u1.Username
		if req.FriendIsDebtor == false {
			payer = u2.Username
		}
		_, err = c.CreateFriendExpense(ctx1, req)
		require.NoError(t, err)

		list1, err := c.ListFriendsExpenses(ctx1, &pb.ListFriendsExpensesRequest{N: 100, Offset: 0})
		require.NoError(t, err)
		list2, err := c.ListFriendsExpenses(ctx2, &pb.ListFriendsExpensesRequest{N: 100, Offset: 0})
		require.NoError(t, err)

		require.Equal(t, list1, list2)
		require.Equal(t, 1, len(list1.Expenses))
		e := list1.Expenses[0]
		require.Equal(t, req.ExpenseName, e.Name)
		require.Equal(t, payer, e.PayerName)
		require.Equal(t, e.TotalPaid, req.Amount)

		_, err = c.DeleteFriendExpense(ctx2, &pb.DeleteFriendExpenseRequest{ExpenseId: e.Id, FriendId: u1.Id})
		require.NoError(t, err)

		list1, err = c.ListFriendsExpenses(ctx1, &pb.ListFriendsExpensesRequest{N: 100, Offset: 0})
		require.NoError(t, err)
		list2, err = c.ListFriendsExpenses(ctx2, &pb.ListFriendsExpensesRequest{N: 100, Offset: 0})
		require.NoError(t, err)
		require.Equal(t, list1, list2)
		require.Equal(t, 0, len(list1.Expenses))
	})

	t.Run("friend_settle_up_ok", func(t *testing.T) {
		token1 := utils.AddUser(t)
		token2 := utils.AddUser(t)
		c, err := utils.GetClient()
		require.NoError(t, err)

		ctx1 := utils.ContextWithToken(token1)
		ctx2 := utils.ContextWithToken(token2)

		resp, err := c.MyProfile(ctx1, &pb.Empty{})
		require.NoError(t, err)
		u1 := resp.User
		resp, err = c.MyProfile(ctx2, &pb.Empty{})
		require.NoError(t, err)
		u2 := resp.User

		_, err = c.AddFriend(ctx1, &pb.AddFriendRequest{Code: u2.Code})
		require.NoError(t, err)

		req := &pb.CreateFriendExpenseRequest{
			FriendId:       u2.Id,
			Amount:         int64(rand.Int()%100) + 10,
			FriendIsDebtor: bool((rand.Int() % 2) == 1),
			ExpenseName:    utils.GetValidString(10),
		}
		debtor := u1.Username
		if req.FriendIsDebtor == true {
			debtor = u2.Username
		}
		_, err = c.CreateFriendExpense(ctx1, req)
		require.NoError(t, err)

		friends, err := c.ListMyFriends(ctx1, &pb.Empty{})
		require.NoError(t, err)
		require.Equal(t, 1, len(friends.Friends))
		balance := req.Amount
		if !req.FriendIsDebtor {
			balance = -balance
		}
		require.Equal(t, balance, friends.Friends[0].Balance)

		settleUpAmount := int64(rand.Int()%(int(req.Amount)-5) + 5)
		_, err = c.FriendSettleUp(ctx2, &pb.FriendSettleUpRequest{
			FriendId:   u1.Id,
			Amount:     int64(settleUpAmount),
			FriendPays: !req.FriendIsDebtor,
		})
		require.NoError(t, err)

		list1, err := c.ListFriendsExpenses(ctx1, &pb.ListFriendsExpensesRequest{N: 100, Offset: 0})
		require.NoError(t, err)
		list2, err := c.ListFriendsExpenses(ctx2, &pb.ListFriendsExpensesRequest{N: 100, Offset: 0})
		require.NoError(t, err)

		require.Equal(t, list1, list2)
		require.Equal(t, 2, len(list1.Expenses))
		e := list1.Expenses[0]
		require.Equal(t, debtor, e.PayerName)
		require.Equal(t, e.TotalPaid, settleUpAmount)

		_, err = c.FriendSettleUp(ctx2, &pb.FriendSettleUpRequest{
			FriendId:   u1.Id,
			Amount:     req.Amount - int64(settleUpAmount),
			FriendPays: !req.FriendIsDebtor,
		})
		require.NoError(t, err)

		friends, err = c.ListMyFriends(ctx1, &pb.Empty{})
		require.NoError(t, err)
		require.Equal(t, 1, len(friends.Friends))
		require.Equal(t, int64(0), friends.Friends[0].Balance)
	})
}
