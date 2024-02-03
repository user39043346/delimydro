package server_test

import (
	"context"
	"math/rand"
	"slices"
	"sync"
	"testing"

	pb "github.com/user39043346/delimydro/proto/api"
	utils "github.com/user39043346/delimydro/testutils"

	"github.com/stretchr/testify/require"
)

func TestGroup(t *testing.T) {
	t.Run("create_expense", func(t *testing.T) {
		c, err := utils.GetClient()
		require.NoError(t, err)

		N := 10
		ctx, usersIds, groupId := utils.CreateGroup(t, N)

		groupUsers, err := c.GetGroupUsers(ctx[0], &pb.GetGroupUsersRequest{GroupId: groupId})
		require.NoError(t, err)
		for _, user := range groupUsers.Users {
			require.Contains(t, usersIds, user.Id)
		}
		require.Equal(t, len(usersIds), len(groupUsers.Users))

		diffsMap := make(map[string]int64)
		for k := 0; k < 5; k++ {
			s := int64(0)
			diffs := make([]*pb.Diff, len(usersIds))
			for i, id := range usersIds {
				x := rand.Int63n(100) - 50
				if i == len(usersIds)-1 {
					x = -s
				}
				diffs[i] = &pb.Diff{UserId: id, Diff: x}
				diffsMap[usersIds[i]] += x
				s += x
			}
			addExpenseReq := &pb.CreateGroupExpenseRequest{
				GroupId:     groupId,
				ExpenseName: utils.GetValidString(10),
				Diffs:       diffs,
			}
			_, err = c.CreateGroupExpense(ctx[0], addExpenseReq)
			require.NoError(t, err)

			utils.CheckGropbalances(ctx[0], t, groupId, diffsMap)
		}
	})
	t.Run("delete_expense", func(t *testing.T) {
		c, err := utils.GetClient()
		require.NoError(t, err)

		N := 10
		ctx, usersIds, groupId := utils.CreateGroup(t, N)

		K := 5
		diffsMap := make(map[string]int64)
		expenses := make([]*pb.CreateGroupExpenseRequest, K)
		for k := 0; k < K; k++ {
			s := int64(0)
			diffs := make([]*pb.Diff, len(usersIds))
			for i, id := range usersIds {
				x := rand.Int63n(100) - 50
				if i == len(usersIds)-1 {
					x = -s
				}
				diffs[i] = &pb.Diff{UserId: id, Diff: x}
				diffsMap[usersIds[i]] += x
				s += x
			}
			expenses[k] = &pb.CreateGroupExpenseRequest{
				GroupId:     groupId,
				ExpenseName: utils.GetValidString(10),
				Diffs:       diffs,
			}
			_, err = c.CreateGroupExpense(ctx[0], expenses[k])
			require.NoError(t, err)
		}
		utils.CheckGropbalances(ctx[0], t, groupId, diffsMap)

		list, err := c.ListGroupExpenses(ctx[0], &pb.ListGroupExpensesRequest{GroupId: groupId, N: 100, Offset: 0})
		require.NoError(t, err)
		require.Equal(t, len(expenses), len(list.Expenses))

		slices.Reverse(expenses)
		expenseIds := make([]string, len(list.Expenses))
		for i, expense := range list.Expenses {
			expenseIds[i] = expense.Id
			require.Equal(t, expenses[i].ExpenseName, expense.Name)
			require.Equal(t, int64(0), expense.Type)
			resp, err := c.ExpenseInfo(ctx[0], &pb.ExpenseInfoRequest{ExpenseId: expense.Id})
			require.NoError(t, err)
			for _, user := range resp.UsersDistribution {
				require.True(t, utils.DiffContain(expenses[i].Diffs, user))
			}
		}

		_, err = c.DeleteGroupExpense(ctx[0], &pb.DeleteGroupExpenseRequest{GroupId: groupId, ExpenseId: expenseIds[1]})
		require.NoError(t, err)

		for _, diff := range expenses[1].Diffs {
			diffsMap[diff.UserId] -= diff.Diff
		}
		utils.CheckGropbalances(ctx[0], t, groupId, diffsMap)

		list, err = c.ListGroupExpenses(ctx[0], &pb.ListGroupExpensesRequest{GroupId: groupId, N: 100, Offset: 0})
		require.NoError(t, err)
		require.Equal(t, len(expenseIds)-1, len(list.Expenses))

		for i, expense := range list.Expenses {
			if i == 0 {
				require.Equal(t, expenseIds[0], expense.Id)
			} else {
				require.Equal(t, expenseIds[i+1], expense.Id)
			}
		}
	})
	t.Run("settle up", func(t *testing.T) {
		c, err := utils.GetClient()
		require.NoError(t, err)

		N := 10
		ctx, usersIds, groupId := utils.CreateGroup(t, N)

		_, err = c.CreateGroupExpense(ctx[0], &pb.CreateGroupExpenseRequest{
			GroupId:     groupId,
			ExpenseName: utils.GetValidString(10),
			Diffs: []*pb.Diff{
				{UserId: usersIds[0], Diff: 30},
				{UserId: usersIds[1], Diff: -17},
				{UserId: usersIds[2], Diff: -15},
				{UserId: usersIds[3], Diff: 2},
			},
		})
		require.NoError(t, err)

		_, err = c.GroupSettleUp(ctx[0], &pb.GroupSettleUpRequest{
			GroupId:  groupId,
			PayerId:  usersIds[0],
			DebtorId: usersIds[1],
			Amount:   15,
		})
		require.NoError(t, err)

		r, err := c.GetGropbalances(ctx[0], &pb.GetGropbalancesRequest{GroupId: groupId})
		require.NoError(t, err)

		for _, u := range r.Users {
			switch u.Id {
			case usersIds[0]:
				require.EqualValues(t, 15, u.Balance)
			case usersIds[1]:
				require.EqualValues(t, -2, u.Balance)
			case usersIds[2]:
				require.EqualValues(t, -15, u.Balance)
			case usersIds[3]:
				require.EqualValues(t, 2, u.Balance)
			default:
				require.EqualValues(t, 0, u.Balance)
			}
		}

		list, err := c.ListGroupExpenses(ctx[0], &pb.ListGroupExpensesRequest{GroupId: groupId, N: 100, Offset: 0})
		require.NoError(t, err)

		require.Equal(t, 2, len(list.Expenses))

		settleUpExpense := list.Expenses[0]
		require.Equal(t, int64(1), settleUpExpense.Type)
		require.Equal(t, int64(15), settleUpExpense.TotalPaid)

	})
}

func BenchmarkGroupExpense(b *testing.B) {
	for i := 0; i < b.N; i++ {
		func() {
			c, err := utils.GetClient()
			require.NoError(b, err)

			N := 30
			K := 100
			ctx := make([]context.Context, N)
			users := make([]*pb.User, N)
			for i := range users {
				token := utils.AddUser(b)
				ctx[i] = utils.ContextWithToken(token)
				resp, err := c.MyProfile(ctx[i], &pb.Empty{})
				require.NoError(b, err)
				users[i] = resp.User
			}

			usersIds := make([]string, N)
			for i := range usersIds {
				usersIds[i] = users[i].Id
			}
			createGroupReq := &pb.CreateGroupRequest{
				Name:      utils.GetValidString(10),
				ImagePath: "",
				Type:      0,
				UsersIds:  usersIds[1:],
			}
			createResp, err := c.CreateGroup(ctx[0], createGroupReq)
			require.NoError(b, err)
			groupId := createResp.GroupId

			b.ResetTimer()

			wg := sync.WaitGroup{}
			wg.Add(1)
			go func() {
				defer wg.Done()
				for k := 0; k < K; k++ {
					_, err := c.GetGropbalances(ctx[0], &pb.GetGropbalancesRequest{GroupId: groupId})
					require.NoError(b, err)
				}
			}()

			diffsMap := make(map[string]int64)
			for k := 0; k < K; k++ {
				s := int64(0)
				diffs := make([]*pb.Diff, len(usersIds))
				for i, id := range usersIds {
					x := rand.Int63n(1000000) - 500000
					if i == len(usersIds)-1 {
						x = -s
					}
					diffs[i] = &pb.Diff{UserId: id, Diff: x}
					diffsMap[usersIds[i]] += x
					s += x
				}
				addExpenseReq := &pb.CreateGroupExpenseRequest{
					GroupId:     groupId,
					ExpenseName: utils.GetValidString(10),
					Diffs:       diffs,
				}
				_, err = c.CreateGroupExpense(ctx[0], addExpenseReq)
				require.NoError(b, err)
			}
			wg.Wait()

			resp, err := c.GetGropbalances(ctx[0], &pb.GetGropbalancesRequest{GroupId: groupId})
			require.NoError(b, err)
			for _, u := range resp.Users {
				require.Equal(b, diffsMap[u.Id], u.Balance)
			}
		}()
	}
}
