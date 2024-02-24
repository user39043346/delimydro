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
import GroupView from './groupView';

export default function Root() {
  const errorContext = useRef(useContext(ErrorAlertContext));
  const authContext = useContext(AuthContext);
  const client = useServiceAuthorizedClient();

  const [me, setMe] = useState<MyProfileResponse | null>(null);
  const [addFriend, setAddFriend] = useState<boolean>(false);
  const [addGroup, setAddGroup] = useState<boolean>(false);
  const [inviteToGroup, setInviteToGroup] = useState<Group | null>(null);

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [addExpense, setAddExpense] = useState(false);
  const [settleUp, setSettleUp] = useState(false);
  const [deleteGroupFlag, setDeleteGroupFlag] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

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

  const selectGroup = (group: Group) => {
    setSelectedGroup(group);
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
        {!selectedGroup ? null : (
          <GroupView
            me={me}
            openAddExpenseForm={setAddExpense}
            openSettleUpForm={setSettleUp}
            openDeleteExpenseForm={setExpenseToDelete}
            openDeleteGroupForm={setDeleteGroupFlag}
            client={client}
            selectedGroup={selectedGroup}
          />
        )}
      </div>
    </>
  );
}
