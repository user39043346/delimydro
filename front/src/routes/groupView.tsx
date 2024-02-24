import UserImage from '@/components/userImage';
import { Debt, Expense, Group, MyProfileResponse, ServiceClient, User } from '@/proto/api';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ErrorAlertContext } from './alert';
import ExpenseItem from '@/components/expenseItem';
import ExpenseInfo from '@/components/expenseInfo';
import Toggle from '@/components/toggle';

export default function GroupView({
  me,
  openAddExpenseForm,
  openSettleUpForm,
  openDeleteExpenseForm,
  openDeleteGroupForm,
  client,
  selectedGroup,
}: {
  me: MyProfileResponse;
  openAddExpenseForm: React.Dispatch<React.SetStateAction<boolean>>;
  openSettleUpForm: React.Dispatch<React.SetStateAction<boolean>>;
  openDeleteExpenseForm: React.Dispatch<React.SetStateAction<Expense | null>>;
  openDeleteGroupForm: React.Dispatch<React.SetStateAction<boolean>>;
  client: ServiceClient;
  selectedGroup: Group;
}) {
  const errorContext = useRef(useContext(ErrorAlertContext));

  const [balances, setBalances] = useState<User[] | null>(null);

  const [groupDebts, setGroupDebts] = useState<Debt[] | null>(null);
  const [groupExpenses, setGroupExpenses] = useState<Expense[] | null>(null);
  const groupUsersMap: Map<string, User> = useMemo(() => {
    if (balances) {
      return new Map<string, User>(balances.map(user => [user.id, user]));
    }
    return new Map<string, User>();
  }, [balances]);

  const [viewExpense, setViewExpense] = useState<Set<string>>();
  const expenseInfoCache = useMemo(() => {
    return new Map<string, Debt[]>();
  }, []);

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

  return (
    <>
      {/* center column */}
      <div className="z-10 shadow-lg w-[calc(59%)] h-[calc(100vh-60px)]">
        {/* group header */}
        <div className="h-[50px] gap-2 p-2 bg-gray-100 flex items-center">
          <UserImage src={selectedGroup.imagePath} />
          <div className="text-[20px] font-bold">{selectedGroup.name}</div>
          <div className="flex-1" />
          <div className="space-x-2">
            <button
              onClick={() => openAddExpenseForm(true)}
              className="text-[12px] px-2 lg:text-[14px] lg:px-3 py-2 rounded-md hover:bg-orange-400 bg-orange-300"
            >
              Add an expense
            </button>
            <button
              onClick={() => openSettleUpForm(true)}
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
                onDelete={() => openDeleteExpenseForm(expense)}
              />
              {!viewExpense?.has(expense.id) ? null : (
                <ExpenseInfo usersMap={groupUsersMap} cache={expenseInfoCache} expense={expense} client={client} />
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
                  className={`user-button relative group h-[40px] flex items-center w-full text-left has-[.user-info:hover]:bg-gray-100 has-[.user-info:hover]:z-10`}
                >
                  <div className="user-info flex items-center w-full gap-2 p-1">
                    <div className="h-[25px]">
                      <UserImage src={user.imagePath} />
                    </div>
                    <div className="">
                      <div className="text-[12px] font-bold">{user.username}</div>
                      <div className="text-[10px] text-gray-500">{user.balance}</div>
                    </div>
                  </div>
                  <div
                    className={`hint-text z-0 px-2 py-1 text-[11px] absolute text-white translate-x-[-100%] group-[:hover:not(:has(.hint-text:hover))]:opacity-100 opacity-0 hover:cursor-default bg-black/[0.7]`}
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
            onClick={() => openDeleteGroupForm(true)}
            className="bg-red-200 hover:bg-red-300 text-[11px] font-semibold w-full py-1"
          >
            delete group
          </button>
        </div>
      </div>
    </>
  );
}
