import { Diff, ServiceClient, User } from '@/proto/api';
import { useContext, useEffect, useState } from 'react';
import UserItem from '../components/userItem';
import { CgNotes } from 'react-icons/cg';
import AddExpenseForm from '@/components/addExpenseForm';
import { PiEqualizerBold, PiEqualsBold } from 'react-icons/pi';
import { Tb123 } from 'react-icons/tb';
import CheckBox from '@/components/checkbox';
import { ErrorAlertContext } from './alert';
import FormBackground from '@/components/formBackground';
import SearchItem from '@/components/searchItem';
import UserImage from '@/components/userImage';
import TextFormButton from '@/components/textFormButton';

enum SplitType {
  EQUALLY = 'equally',
  EXACTLY = 'exactly',
  BY_SHARES = 'by shares',
}

interface EquallyBalances {
  balances: boolean[];
  cnt: number;
}

interface ExactlyBalances {
  balances: number[];
  sum: number;
}

interface SharesBalances {
  balances: number[];
  sum: number;
}

export default function AddExpense({
  groupId,
  users,
  client,
  close,
  save,
}: {
  groupId: string;
  users: User[];
  client: ServiceClient;
  close: () => void;
  save: () => void;
}) {
  const errorContext = useContext(ErrorAlertContext);
  const [selectedUsers, setSelectedUsers] = useState<User[]>(
    users.map(user => {
      const u: User = { id: user.id, username: user.username, imagePath: user.imagePath, code: user.code, balance: 0 };
      return u;
    }),
  );
  const [groupMember, setGroupMember] = useState('');
  const [searchResults, setSearchResults] = useState<User[] | null>(null);
  const [payersWindow, setPayersWindow] = useState(true);
  const [splitWindow, setSplitWindow] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  const [splitType, setSplitType] = useState(SplitType.EQUALLY);
  const [splitErr, setSplitErr] = useState<string | null>(null);
  const [expenseName, setExpenseName] = useState<string>('');

  const [eqBalances, setEqBalances] = useState<EquallyBalances>({ balances: [], cnt: 0 });
  const [exBalances, setExBalances] = useState<ExactlyBalances>({ balances: [], sum: 0 });
  const [shBalances, setShBalances] = useState<SharesBalances>({ balances: [], sum: 0 });

  useEffect(() => {
    const n = selectedUsers.length;
    const b: EquallyBalances = {
      balances: Array<boolean>(n).fill(true),
      cnt: selectedUsers.length,
    };
    setEqBalances(b);

    const x: ExactlyBalances = {
      balances: Array<number>(n).fill(0),
      sum: 0,
    };
    setExBalances(x);

    const sh: SharesBalances = {
      balances: Array<number>(n).fill(0),
      sum: 0,
    };
    setShBalances(sh);

    if (n === 0) {
      setTotalPaid(0);
    }
  }, [selectedUsers.length]);

  const searchGroupMember = (name: string) => {
    setGroupMember(name);
    if (!name) {
      setSearchResults(null);
      return;
    }
    const res = [];
    for (const user of users) {
      if (selectedUsers.includes(user)) {
        continue;
      }
      if (user.username.includes(name)) {
        res.push(user);
      }
    }
    setSearchResults(res);
  };

  const selectUser = (user: User) => {
    setSelectedUsers(selectedUsers.concat(user));
    setGroupMember('');
    setSearchResults(null);
  };

  const deleteSelectedUser = (idx: number) => {
    setTotalPaid(totalPaid - selectedUsers[idx].balance);
    setSelectedUsers(selectedUsers.slice(0, idx).concat(selectedUsers.slice(idx + 1)));
  };

  const updateBalance = (user: User, s: string) => {
    for (const [idx, u] of selectedUsers.entries()) {
      if (u.username == user.username) {
        const n = isNaN(Number(s)) ? 0 : Number(s);
        const newTotalPaid = totalPaid - u.balance + n;
        setTotalPaid(newTotalPaid);
        if (splitType == SplitType.EXACTLY) {
          if (newTotalPaid != exBalances.sum) {
            setSplitErr(`Amounts sum (${exBalances.sum}) is not equal to total paid`);
          } else {
            setSplitErr(null);
          }
        }
        const x = selectedUsers.slice(0, idx).concat({ ...u, balance: n }, selectedUsers.slice(idx + 1));
        setSelectedUsers(x);
        return;
      }
    }
  };

  const updateEqBalances = (checked: boolean, idx: number) => {
    const b: EquallyBalances = { balances: eqBalances.balances, cnt: eqBalances.cnt };
    if (checked) {
      b.balances[idx] = true;
      b.cnt += 1;
    } else {
      b.balances[idx] = false;
      b.cnt -= 1;
    }
    setEqBalances(b);
  };

  const updateExBalances = (s: string, idx: number) => {
    const x = isNaN(Number(s)) ? 0 : Number(s);
    const b: ExactlyBalances = { balances: exBalances.balances, sum: exBalances.sum };
    b.sum = b.sum - b.balances[idx] + x;
    b.balances[idx] = x;
    setExBalances(b);
    if (b.sum != totalPaid) {
      setSplitErr(`Amounts sum (${b.sum}) is not equal to total paid`);
    } else {
      setSplitErr(null);
    }
  };

  const updateShBalances = (s: string, idx: number) => {
    const x = isNaN(Number(s)) ? 0 : Number(s);
    const b: SharesBalances = { balances: shBalances.balances, sum: shBalances.sum };
    b.sum = b.sum - b.balances[idx] + x;
    b.balances[idx] = x;
    setShBalances(b);
  };

  const createExpense = async () => {
    try {
      let diffs: Diff[] = [];
      switch (splitType) {
        case SplitType.EQUALLY:
          diffs = selectedUsers.map<Diff>((user, idx) => {
            const balance = -(Number(eqBalances.balances[idx]) * totalPaid) / eqBalances.cnt;
            return { userId: user.id, diff: balance };
          });
          break;
        case SplitType.EXACTLY:
          diffs = selectedUsers.map<Diff>((user, idx) => {
            const balance = -exBalances.balances[idx];
            return { userId: user.id, diff: balance };
          });
          break;
        case SplitType.BY_SHARES:
          diffs = selectedUsers.map<Diff>((user, idx) => {
            const balance = -(shBalances.balances[idx] * totalPaid) / shBalances.sum;
            return { userId: user.id, diff: balance };
          });
          break;
      }
      const payers: Diff[] = selectedUsers.map<Diff>(user => {
        return { userId: user.id, diff: user.balance };
      });
      await client.createGroupExpense({ groupId: groupId, expenseName, payers, debtors: diffs });
      save();
      close();
    } catch (e) {
      errorContext?.showError(e);
    }
  };

  return (
    <FormBackground>
      <AddExpenseForm title="Add expense" close={close} style="w-[350px] h-[350px]">
        <div className="px-3 py-2 space-y-1">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="text-[14px] font-semibold">With you and</div>
            {selectedUsers.length == users.length ? (
              <UserItem
                key={`key2allusers`}
                user={User.create({ username: 'All users' })}
                deleteCallback={() => {
                  setSelectedUsers([]);
                }}
              />
            ) : (
              <>
                {...selectedUsers.map((user, idx) => {
                  return (
                    <UserItem
                      key={`key2${idx}`}
                      user={user}
                      deleteCallback={() => {
                        deleteSelectedUser(idx);
                      }}
                    />
                  );
                })}
                <input
                  value={groupMember}
                  onChange={e => searchGroupMember(e.target.value)}
                  className="bg-gray-200 rounded-xl py-1 px-3 w-[80px] focus:outline-none"
                />
              </>
            )}
          </div>
          {groupMember == '' ? (
            <></>
          ) : (
            <div className="bg-white rounded-b-md cursor-default">
              {!searchResults
                ? [
                    <div key={'key1-none'} className="h-[40px] flex rounded-b-md">
                      <div className="my-auto px-4 font-semibold">Loading...</div>
                    </div>,
                  ]
                : searchResults.length == 0
                  ? [
                      <div key={'key1-none'} className="h-[40px] flex rounded-b-md">
                        <div className="my-auto px-4 font-semibold">Not found...</div>
                      </div>,
                    ]
                  : searchResults.map((user, idx) => {
                      return (
                        <SearchItem
                          key={`key1${idx}`}
                          onClick={() => {
                            selectUser(user);
                          }}
                          imagePath={user.imagePath}
                          name={user.username}
                          rounded={idx == searchResults.length - 1}
                        />
                      );
                    })}
            </div>
          )}
        </div>
        <div className="border-[1px] border-gray-400/[0.5]" />
        <div className="flex-col w-min m-auto py-2">
          <div className="flex w-min items-center justify-center gap-2">
            <div className="bg-gray-400 p-[7px] shadow-xl rounded-md ">
              <CgNotes className="text-white w-[35px] h-[35px]" />
            </div>
            <div className="flex-col justify-center items-center space-y-1">
              <input
                defaultValue={expenseName}
                placeholder="description"
                onChange={e => setExpenseName(e.target.value)}
                className="border-b-[1px] border-gray-400 bg-transparent outline-none"
              />
              <input
                value={`Total paid: ${totalPaid}`}
                disabled
                onChange={e => setTotalPaid(Number(e.target.value))}
                placeholder="amount"
                className="border-b-[1px] border-gray-400 bg-transparent outline-none"
              />
            </div>
          </div>
          <div className="text-[14px] pt-5 text-center">
            <span>Select </span>
            <TextFormButton
              onClick={() => {
                setSplitWindow(false);
                setPayersWindow(!payersWindow);
              }}
              text="payers"
            />
            <span> and how to </span>
            <TextFormButton
              onClick={() => {
                setPayersWindow(false);
                setSplitWindow(!splitWindow);
              }}
              text="split"
            />
          </div>
        </div>
        <div className="absolute w-full bottom-2 px-2">
          {splitType == SplitType.EXACTLY && splitErr != null ? (
            <span className="text-red-600 text-[11px] pl-1">{splitErr}</span>
          ) : (
            <></>
          )}
          <button
            disabled={splitType == SplitType.EXACTLY && splitErr != null}
            onClick={() => void createExpense()}
            className="disabled:bg-green-200 bg-green-300 w-full rounded-md py-1 hover:bg-green-400"
          >
            Save
          </button>
        </div>
      </AddExpenseForm>
      {payersWindow === false ? (
        <></>
      ) : (
        <AddExpenseForm title="Payers" style="w-[200px]" close={() => setPayersWindow(false)}>
          <div className="px-3">
            {selectedUsers.map(user => (
              <div key={user.id} className="h-[27px] flex py-1 pl-1 items-center hover:bg-gray-200 my-1">
                <UserImage src={user.imagePath} />
                <span className="px-2">{user.username}</span>
                <div className="flex-1" />
                <input
                  defaultValue={user.balance}
                  onChange={e => updateBalance(user, e.target.value)}
                  className="outline-none w-[50px] px-2"
                />
              </div>
            ))}
          </div>
        </AddExpenseForm>
      )}
      {splitWindow === false ? (
        <></>
      ) : (
        <AddExpenseForm title="Split" style="w-[200px]" close={() => setSplitWindow(false)}>
          <div className="px-3 py-2">
            <div className="flex gap-1">
              <button
                onClick={() => setSplitType(SplitType.EQUALLY)}
                disabled={splitType == SplitType.EQUALLY}
                className="disabled:bg-gray-200 bg-white p-1"
              >
                <PiEqualsBold />
              </button>
              <button
                onClick={() => setSplitType(SplitType.EXACTLY)}
                disabled={splitType == SplitType.EXACTLY}
                className="disabled:bg-gray-200 bg-white p-1"
              >
                <Tb123 />
              </button>
              <button
                onClick={() => setSplitType(SplitType.BY_SHARES)}
                disabled={splitType == SplitType.BY_SHARES}
                className="disabled:bg-gray-200 bg-white p-1"
              >
                <PiEqualizerBold />
              </button>
            </div>
            <div className="pt-2">
              <span className="font-semibold">Split {splitType}</span>
              {splitType == SplitType.EQUALLY
                ? selectedUsers.map((user, idx) => (
                    <div
                      key={`equally-${user.username}`}
                      className="h-[27px] gap-2 hover:bg-gray-200 py-1 flex items-center text-center"
                    >
                      <UserImage src={user.imagePath} />
                      <span className="">{user.username}</span>
                      <div className="flex-1" />
                      <input
                        value={eqBalances.balances[idx] ? totalPaid / eqBalances.cnt : ''}
                        disabled
                        className="w-[50px] outline-none px-2"
                      />
                      <CheckBox
                        checked={eqBalances.balances[idx]}
                        onClick={checked => updateEqBalances(checked, idx)}
                      />
                    </div>
                  ))
                : splitType == SplitType.EXACTLY
                  ? selectedUsers.map((user, idx) => (
                      <div
                        key={`exactly-${user.username}`}
                        className="h-[27px] gap-2 hover:bg-gray-200 py-1 flex items-center text-center"
                      >
                        <UserImage src={user.imagePath} />
                        <span className="">{user.username}</span>
                        <div className="flex-1" />
                        <input
                          defaultValue={exBalances.balances[idx]}
                          onChange={e => updateExBalances(e.target.value, idx)}
                          className="w-[50px] outline-none px-2"
                        />
                      </div>
                    ))
                  : selectedUsers.map((user, idx) => (
                      <div
                        key={`shares-${user.username}`}
                        className="h-[27px] hover:bg-gray-200 py-1 flex gap-2 items-center text-center"
                      >
                        <UserImage src={user.imagePath} />
                        <span className="">{user.username}</span>
                        <div className="flex-1" />
                        <div className="max-w-[40px] overflow-hidden z-10">
                          {shBalances.balances[idx] ? (totalPaid * shBalances.balances[idx]) / shBalances.sum : ''}
                        </div>
                        <input
                          defaultValue={shBalances.balances[idx]}
                          onChange={e => updateShBalances(e.target.value, idx)}
                          className="w-[50px] outline-none px-2"
                        />
                      </div>
                    ))}
            </div>
          </div>
        </AddExpenseForm>
      )}
    </FormBackground>
  );
}
