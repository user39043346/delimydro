import { Expense, Group, MyProfileResponse, User } from '@/proto/api';
import { useServiceAuthorizedClient } from '@/service/service';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ErrorAlertContext } from './alert';
import AddFriend from './addFriend';
import AddGroup from './addGroup';
import AddExpense from './addExpense';
import { RiLogoutBoxRLine } from 'react-icons/ri';
import { AuthContext } from './auth';
import Toggle from '@/components/toggle';
import SettleUp from './settleUp';
import UserImage from '@/components/userImage';
import ExpenseDate from '@/components/expenseDate';
import SettleUpSign from '@/components/settleUpSign';
import { CgNotes } from 'react-icons/cg';
import { FaPlus } from 'react-icons/fa';
import InviteToGroup from './inviteToGroup';
import DeleteGroupForm from './deleteGroupForm';
import DeleteExpenseForm from './deleteExpenseForm';

export default function Root() {
  const errorContext = useRef(useContext(ErrorAlertContext));
  const authContext = useContext(AuthContext);
  const client = useServiceAuthorizedClient();
  const [me, setMe] = useState<MyProfileResponse | null>(null);
  const [addFriend, setAddFriend] = useState<boolean>(false);
  const [addGroup, setAddGroup] = useState<boolean>(false);
  const [inviteToGroup, setInviteToGroup] = useState<Group | null>(null);

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupExpenses, setGroupExpenses] = useState<Expense[] | null>(null);
  const [balances, setBalances] = useState<User[] | null>(null);
  const [addExpense, setAddExpense] = useState(false);
  const [settleUp, setSettleUp] = useState(false);
  const [deleteGroupFlag, setDeleteGroupFlag] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const fetchMyProfile = useCallback(async () => {
    try {
      const dateTime = new Date();
      const me = await client.myProfile({});
      console.log(me, new Date().getTime() - dateTime.getTime());
      return me;
    } catch (e) {
      errorContext.current?.showError(e);
      return null;
    }
  }, [client]);

  const updateMe = useCallback(() => {
    void fetchMyProfile().then(resp => setMe(resp));
  }, [fetchMyProfile]);

  useEffect(() => {
    updateMe();
  }, [updateMe]);

  const getGroupBalances = useCallback(async () => {
    try {
      const resp = await client.getGroupBalances({ groupId: selectedGroup?.id ?? '' });
      return resp;
    } catch (e) {
      errorContext.current?.showError(e);
      return null;
    }
  }, [client, selectedGroup?.id]);

  const updateGroupBalances = useCallback(() => {
    void getGroupBalances().then(resp => {
      setBalances(resp?.users ?? []);
    });
  }, [getGroupBalances]);

  useEffect(() => {
    if (selectedGroup) {
      updateGroupBalances();
    }
  }, [selectedGroup, updateGroupBalances]);

  const fetchGroupExpenses = useCallback(async () => {
    try {
      const resp = await client.listGroupExpenses({ n: 100, offset: 0, groupId: selectedGroup?.id ?? '' });
      return resp;
    } catch (e) {
      errorContext.current?.showError(e);
      return null;
    }
  }, [client, selectedGroup?.id]);

  const updateGroupExpenses = useCallback(() => {
    void fetchGroupExpenses().then(resp => {
      setGroupExpenses(resp?.expenses ?? []);
    });
  }, [fetchGroupExpenses]);

  useEffect(() => {
    if (selectedGroup) {
      updateGroupExpenses();
    }
  }, [selectedGroup, updateGroupExpenses]);

  const selectGroup = (group: Group) => {
    setSelectedGroup(group);
    setBalances(null);
  };

  const changeGroupType = async (checked: boolean) => {
    try {
      await client.changeGroupType({ groupId: selectedGroup?.id, newType: Number(checked) });
    } catch (e) {
      errorContext.current?.showError(e);
    }
  };

  if (!me) {
    return <></>;
  }

  return (
    <>
      {addFriend === false ? null : (
        <AddFriend save={updateMe} close={() => setAddFriend(false)} client={client} myCode={me.user?.code ?? ''} />
      )}
      {addGroup === false ? (
        <></>
      ) : (
        <AddGroup friends={me.friends} save={updateMe} close={() => setAddGroup(false)} client={client} />
      )}
      {inviteToGroup === null ? null : (
        <InviteToGroup
          friends={me.friends}
          group={inviteToGroup}
          save={() => {
            if (selectedGroup?.id === inviteToGroup.id) {
              updateGroupBalances();
            }
          }}
          close={() => setInviteToGroup(null)}
          client={client}
        />
      )}
      {addExpense === false ? null : (
        <AddExpense
          groupId={selectedGroup?.id ?? ''}
          users={balances ?? []}
          save={() => {
            updateGroupExpenses();
            updateGroupBalances();
          }}
          close={() => setAddExpense(false)}
          client={client}
        />
      )}
      {settleUp === false ? null : (
        <SettleUp
          groupId={selectedGroup?.id ?? ''}
          users={balances ?? []}
          me={me?.user ?? null}
          save={() => {
            updateGroupBalances();
            updateGroupExpenses();
          }}
          close={() => setSettleUp(false)}
          client={client}
        />
      )}
      {deleteGroupFlag === false ? null : (
        <DeleteGroupForm
          group={selectedGroup}
          client={client}
          save={() => {
            setSelectedGroup(null);
            updateMe();
          }}
          close={() => setDeleteGroupFlag(false)}
        />
      )}
      {expenseToDelete === null ? null : (
        <DeleteExpenseForm
          groupId={selectedGroup?.id ?? ''}
          expense={expenseToDelete}
          client={client}
          save={() => {
            updateGroupBalances();
            updateGroupExpenses();
          }}
          close={() => setExpenseToDelete(null)}
        />
      )}
      {/* <div className="text-white flex w-[100%] bg-[#ac8bcc] h-[40px] py-2 xl:px-[20%] md:px-[10%] px-5"> */}
      {/* topbar */}
      <div className="text-white flex w-[100%] bg-purple-400 h-[40px] py-2 xl:px-[20%] md:px-[10%] px-5">
        <div className="space-x-2 flex">
          <img src="/favicon.ico" />
          <div className="text-center font-bold">Delimydro</div>
        </div>
        {/* <div className="flex-1" /> */}
        <div className="flex-1 flex justify-end gap-2">
          <UserImage src={me.user?.imagePath ?? 'img1.png'} />
          <div className="w-min text-end font-semibold">{me.user?.username}</div>
        </div>
        <button onClick={authContext?.logout} className="pl-2">
          <RiLogoutBoxRLine className="text-[22px] p-[2px]" />
        </button>
      </div>
      {/* 3 columns */}
      <div className="py-2 flex h-full space-x-4 xl:px-[20%] md:px-[10%] sm:px-5">
        {/* left column */}
        <div className="w-[150px] space-y-2">
          {/* my groups */}
          <div>
            <div className="bg-purple-200 hover:bg-purple-300 px-[6px] flex">
              <div className="text-[12px] flex-1">GROUPS</div>
              <button onClick={() => setAddGroup(true)} className="text-[10px] text-center m-auto">
                add
              </button>
            </div>
            {me.groups.length === 0 ? (
              <div className="text-[10px] text-wrap px-2 py-1 text-center bg-purple-200">
                You do not have groups yet.
              </div>
            ) : (
              me.groups.map(group => (
                <div
                  key={group.id}
                  onClick={() => {
                    if (group != selectedGroup) {
                      selectGroup(group);
                    }
                  }}
                  className="cursor-pointer items-center h-[25px] flex gap-2 w-full bg-gray-100 hover:bg-gray-200 text-[11px] p-1 text-right"
                >
                  <UserImage src={group.imagePath} />
                  <span>{group.name}</span>
                  <div className="flex-1" />
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setInviteToGroup(group);
                    }}
                    className="text-gray-500 pr-1"
                  >
                    <FaPlus />
                  </button>
                </div>
              ))
            )}
          </div>
          {/* my friends */}
          <div>
            <div className="bg-purple-200 hover:bg-purple-300 px-[6px] flex">
              <div className="text-[12px] flex-1">FRIENDS</div>
              <button onClick={() => setAddFriend(true)} className="text-[10px] text-center m-auto">
                add
              </button>
            </div>
            {me.friends.length === 0 ? (
              <div className="text-[10px] text-wrap px-2 py-1 text-center bg-purple-200">
                You do not have friends yet.
              </div>
            ) : (
              me.friends.map(friend => (
                <button
                  key={friend.username}
                  className="h-[25px] flex gap-2 w-full bg-gray-100 hover:bg-gray-200 text-[11px] px-1 py-1 text-right"
                >
                  <UserImage src={friend.imagePath} />
                  {friend.username}
                </button>
              ))
            )}
          </div>
        </div>
        {!selectedGroup ? (
          <></>
        ) : (
          <>
            {/* center column */}
            <div className="shadow-lg w-[calc(59%)] h-[calc(100vh-60px)]">
              {/* group header */}
              <div className="h-[50px] gap-2 p-2 bg-gray-100 flex items-center">
                <UserImage src={selectedGroup.imagePath} />
                <div className="text-[20px] font-bold">{selectedGroup.name}</div>
                <div className="flex-1" />
                <div className="space-x-2">
                  <button
                    onClick={() => setAddExpense(true)}
                    className="text-[12px] px-2 lg:text-[14px] lg:px-3 py-2 rounded-md hover:bg-orange-400 bg-orange-300"
                  >
                    Add an expense
                  </button>
                  <button
                    onClick={() => setSettleUp(true)}
                    className="text-[12px] px-2 lg:text-[14px] lg:px-3 py-2 rounded-md hover:bg-green-400 bg-green-300"
                  >
                    Settle up
                  </button>
                </div>
              </div>
              {/* expenses list */}
              <div className="grid grid-cols-1 divide-y">
                {groupExpenses?.map(expense => (
                  <button key={`expense${expense.id}`} className="flex gap-2 items-center justify-start px-2 py-1">
                    <>
                      <ExpenseDate time={expense.time ?? null} />
                      {expense.type === 1 ? (
                        <>
                          <SettleUpSign />
                          <div>
                            <span className="text-[15px] font-[650]">{expense.debtorName}</span>
                            <span className="text-[13px]">{' paid '}</span>
                            <span className="text-[15px] font-[650]">{expense.payerName}</span>
                          </div>
                          <div className="flex-1" />
                          <div className="flex-col text-end w-[55px]">
                            <div className=" text-gray-500 text-[9px]">settle up</div>
                            <div className="text-[11px] font-extrabold">{expense.totalPaid}</div>
                          </div>
                          {/* <span className="text-[11px] font-extrabold">{expense.totalPaid}</span> */}
                        </>
                      ) : (
                        <>
                          <div className="bg-gray-300 p-[4px] shadow-md rounded-md ">
                            <CgNotes className="text-white w-[16px] h-[16px]" />
                          </div>
                          <span className="font-[650]">{expense.name}</span>
                          <div className="flex-1" />
                          <div className="flex-col text-end">
                            <div className=" text-gray-500 text-[9px]">{`${expense.payerName === '' ? 'multiple people' : expense.payerName === me.user?.username ? 'you' : expense.payerName} paid`}</div>
                            <div className="text-[11px] font-extrabold">{expense.totalPaid}</div>
                          </div>
                          <div className="flex-col text-end w-[55px]">
                            {expense.myDiff === 0 ? (
                              <div className="text-gray-500 text-[9px]">not involved</div>
                            ) : (
                              <>
                                <div className=" text-gray-500 text-[9px]">{`${expense.myDiff < 0 ? 'you owe' : 'you lent'}`}</div>
                                <div
                                  className={`text-[11px] font-extrabold ${expense.myDiff < 0 ? 'text-orange-400' : 'text-green-400'}`}
                                >
                                  {Math.abs(expense.myDiff)}
                                </div>
                              </>
                            )}
                          </div>
                        </>
                      )}
                      <button onClick={() => setExpenseToDelete(expense)} className="pl-1 group hover:fill-slate-800">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M16.1898 2H7.81978C4.17978 2 2.00977 4.17 2.00977 7.81V16.18C2.00977 19.82 4.17978 21.99 7.81978 21.99H16.1898C19.8298 21.99 21.9998 19.82 21.9998 16.18V7.81C21.9998 4.17 19.8298 2 16.1898 2Z"
                            fill="#a0a0a0"
                            className="group-hover:fill-slate-800"
                          />
                          <path
                            d="M16.8598 8.46008C16.0198 8.38008 15.2498 8.33008 14.4998 8.28008L14.4198 7.80008C14.3498 7.32008 14.1998 6.33008 12.6898 6.33008H11.2998C9.80979 6.33008 9.6498 7.28008 9.5698 7.79008L9.4898 8.26007C9.0598 8.29007 8.6398 8.31007 8.2098 8.35007L7.11979 8.46008C6.73979 8.50008 6.46979 8.83008 6.50979 9.21008C6.54979 9.56008 6.83979 9.83008 7.18979 9.83008C7.20979 9.83008 7.23979 9.83008 7.25979 9.83008L8.33979 9.72008C8.93979 9.67008 9.54979 9.62008 10.1498 9.59008C11.3698 9.54008 12.5898 9.56008 13.8198 9.62008C14.7298 9.66008 15.6798 9.73008 16.7198 9.83008C16.7398 9.83008 16.7598 9.83008 16.7798 9.83008C17.1298 9.83008 17.4298 9.56008 17.4598 9.21008C17.5098 8.83008 17.2398 8.49008 16.8598 8.46008Z"
                            fill="white"
                          />
                          <path
                            d="M15.8305 11.1005C15.6605 10.9105 15.4105 10.8105 15.1605 10.8105H8.84049C8.59049 10.8105 8.34049 10.9205 8.17049 11.1005C8.00049 11.2905 7.91048 11.5405 7.93048 11.7905L8.2405 15.7505C8.3005 16.6005 8.37049 17.6605 10.2905 17.6605H13.7105C15.6305 17.6605 15.7005 16.6005 15.7605 15.7505L16.0705 11.7905C16.0905 11.5405 16.0005 11.2905 15.8305 11.1005Z"
                            fill="white"
                          />
                        </svg>
                      </button>
                    </>
                  </button>
                ))}
              </div>
            </div>
            {/* right column */}
            <div className="w-[150px] pt-2">
              <div className="text-[12px] text-gray-500 font-bold">GROUP BALANCES</div>
              <div className="bg-gray-200 px-2 py-2 flex items-center gap-4">
                <div className="text-[11px] font-semibold translate-y-[-1px]">Simplify debts</div>
                <div className="flex translate-y-[1px]">
                  <Toggle isChecked={selectedGroup.type != 0} onClick={checked => void changeGroupType(checked)} />
                </div>
              </div>
              {!balances ? (
                <></>
              ) : (
                <div className="pt-1 space-y-1">
                  {...balances.map(user => (
                    <button
                      key={user.id}
                      className="flex items-center gap-2 p-1 h-[40px] w-full text-left hover:bg-gray-100"
                    >
                      <div className="h-[25px]">
                        <UserImage src={user.imagePath} />
                      </div>
                      <div className="">
                        <div className="text-[12px] font-bold">{user.username}</div>
                        <div className="text-[10px] text-gray-500">{user.balance}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="pt-2">
                <button
                  onClick={() => setDeleteGroupFlag(true)}
                  className="bg-red-200 hover:bg-red-300 text-[11px] font-semibold w-full py-1"
                >
                  delete group
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
