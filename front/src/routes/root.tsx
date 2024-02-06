import { Debt, Expense, Group, MyProfileResponse, User } from '@/proto/api';
import { useServiceAuthorizedClient } from '@/service/service';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ErrorAlertContext } from './alert';
import AddFriend from './addFriend';
import AddGroup from './addGroup';
import AddExpense from './addExpense';
import { RiLogoutBoxRLine } from 'react-icons/ri';
import { AuthContext } from './auth';
import Toggle from '@/components/toggle';
import SettleUp from './settleUp';
import UserImage from '@/components/userImage';
import { FaPlus } from 'react-icons/fa';
import InviteToGroup from './inviteToGroup';
import DeleteGroupForm from './deleteGroupForm';
import DeleteExpenseForm from './deleteExpenseForm';
import ExpenseItem from '@/components/expenseItem';
import ExpenseInfo from '@/components/expenseInfo';

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
  const [groupDebts, setGroupDebts] = useState<Debt[] | null>(null);
  const groupUsersMap: Map<string, User> = useMemo(() => {
    if (balances) {
      return new Map<string, User>(balances.map(user => [user.id, user]));
    }
    return new Map<string, User>();
  }, [balances]);

  const [addExpense, setAddExpense] = useState(false);
  const [settleUp, setSettleUp] = useState(false);
  const [deleteGroupFlag, setDeleteGroupFlag] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [viewExpense, setViewExpense] = useState<Set<string>>();
  const expenseInfoCache = useMemo(() => {
    return new Map<string, Debt[]>();
  }, [selectedGroup?.id]);

  const fetchMyProfile = useCallback(async () => {
    try {
      const me = await client.myProfile({});
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

  const fetchGroupDebts = useCallback(async () => {
    try {
      const resp = await client.getGroupDebts({ groupId: selectedGroup?.id });
      return resp;
    } catch (e) {
      errorContext.current?.showError(e);
      return null;
    }
  }, [client, selectedGroup?.id]);

  const updateGroupDebts = useCallback(() => {
    void fetchGroupDebts().then(resp => {
      setGroupDebts(resp?.debts ?? []);
    });
  }, [fetchGroupDebts]);

  useEffect(() => {
    if (selectedGroup) {
      updateGroupDebts();
    }
  }, [selectedGroup, updateGroupDebts]);

  const selectGroup = (group: Group) => {
    setSelectedGroup(group);
    setGroupExpenses(null);
    setBalances(null);
  };

  const changeGroupType = async (checked: boolean) => {
    try {
      await client.changeGroupType({ groupId: selectedGroup?.id, newType: Number(checked) });
      updateGroupDebts();
    } catch (e) {
      errorContext.current?.showError(e);
    }
  };

  const updateGroup = () => {
    updateGroupBalances();
    updateGroupExpenses();
    updateGroupDebts();
  };

  if (!me) {
    return <></>;
  }

  return (
    <>
      {addFriend === false ? null : (
        <AddFriend save={updateMe} close={() => setAddFriend(false)} client={client} myCode={me.user?.code ?? ''} />
      )}
      {addGroup === false ? null : (
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
          save={updateGroup}
          close={() => setAddExpense(false)}
          client={client}
        />
      )}
      {settleUp === false ? null : (
        <SettleUp
          groupId={selectedGroup?.id ?? ''}
          users={balances ?? []}
          me={me?.user ?? null}
          save={updateGroup}
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
          save={updateGroup}
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
                  <div key={`expense${expense.id}`}>
                    <ExpenseItem
                      expense={expense}
                      myName={me.user?.username ?? ''}
                      disabled={expense.type === 1}
                      onClick={() => {
                        if (viewExpense?.has(expense.id)) {
                          const copy = new Set([...viewExpense.values()]);
                          copy.delete(expense.id);
                          setViewExpense(copy);
                        } else {
                          setViewExpense(new Set([expense.id, ...(viewExpense?.values() ?? [])]));
                        }
                      }}
                      onDelete={() => setExpenseToDelete(expense)}
                    />
                    {!viewExpense?.has(expense.id) ? null : (
                      <ExpenseInfo
                        usersMap={groupUsersMap}
                        cache={expenseInfoCache}
                        expense={expense}
                        client={client}
                      />
                    )}
                  </div>
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
                    <>
                      <button
                        key={user.id}
                        className={`relative group flex items-center gap-2 p-1 h-[40px] w-full text-left hover:bg-gray-100`}
                      >
                        <div className="h-[25px]">
                          <UserImage src={user.imagePath} />
                        </div>
                        <div className="">
                          <div className="text-[12px] font-bold">{user.username}</div>
                          <div className="text-[10px] text-gray-500">{user.balance}</div>
                        </div>
                        <div
                          className={`z-10 px-2 py-1 text-[11px] absolute text-white translate-x-[-105%] group-hover:opacity-100 opacity-0 bg-black/[0.7]`}
                        >
                          {groupDebts?.map((debt, idx) => {
                            if (debt.payerId !== user.id) return null;
                            return (
                              <div key={`hover-debtors-${user.id}-${idx}`}>
                                lent <span className="text-green-400 font-bold">{debt.amount}</span> to{' '}
                                <span>{groupUsersMap.get(debt.debtorId)?.username ?? ''}</span>
                              </div>
                            );
                          })}
                          {groupDebts?.map((debt, idx) => {
                            if (debt.debtorId !== user.id) return null;
                            return (
                              <div key={`hover-payers-${user.id}-${idx}`}>
                                owes <span className="text-orange-400 font-bold">{debt.amount}</span> to{' '}
                                <span>{groupUsersMap.get(debt.payerId)?.username ?? ''}</span>
                              </div>
                            );
                          })}
                          {groupDebts?.some(debt => debt.payerId === user.id || debt.debtorId === user.id) ? null : (
                            <div>settled up</div>
                          )}
                        </div>
                      </button>
                    </>
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
