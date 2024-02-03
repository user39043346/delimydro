package main

import (
	"context"
	"log"
	"math/rand"
	"sync"

	pb "github.com/user39043346/delimydro/proto/api"
	utils "github.com/user39043346/delimydro/testutils"
)

func check(err error) {
	if err != nil {
		log.Println(err)
	}
}

func main() {
	N := 1000
	wg := sync.WaitGroup{}
	wg.Add(N)
	log.Println("start")
	for i := 0; i < N; i++ {
		go func() {
			defer wg.Done()
			c, err := utils.GetClient()
			check(err)

			N := 30
			K := 1000
			ctx := make([]context.Context, N)
			users := make([]*pb.User, N)
			for i := range users {
				resp, err := c.Register(context.Background(), &pb.RegisterRequest{
					Username: utils.GetValidString(10),
					Password: utils.GetValidString(10),
				})
				if err != nil {
					log.Println(err)
					return
				}
				token := resp.Token
				ctx[i] = utils.ContextWithToken(token)
				users[i], err = c.MyProfile(ctx[i], &pb.Empty{})
				if err != nil {
					log.Println(err)
					return
				}
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
			if err != nil {
				log.Println(err)
				return
			}
			groupId := createResp.GroupId

			wg := sync.WaitGroup{}
			wg.Add(1)
			go func() {
				defer wg.Done()
				for k := 0; k < K; k++ {
					_, err := c.GetGroupBalances(ctx[0], &pb.GetGroupBalancesRequest{GroupId: groupId})
					check(err)
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
				check(err)
			}
			wg.Wait()
		}()
	}
	log.Println("waiting")
	wg.Wait()
	log.Println("finish")
}
