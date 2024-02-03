import AddExpenseForm from '@/components/addExpenseForm';
import FormBackground from '@/components/formBackground';
import SearchItem from '@/components/searchItem';
import UserItem from '@/components/userItem';
import { Group, ServiceClient, User } from '@/proto/api';
import { useContext, useEffect, useRef, useState } from 'react';
import { ErrorAlertContext } from './alert';
import SearchFriendInput from '@/components/searchFriendInput';

export default function InviteToGroup({
  group,
  friends,
  close,
  save,
  client,
}: {
  group: Group;
  friends: User[];
  close: () => void;
  save: () => void;
  client: ServiceClient;
}) {
  const errorContext = useRef(useContext(ErrorAlertContext));
  const [newMember, setNewMember] = useState('');
  const [searchResults, setSearchResults] = useState<User[] | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupUsers, setGroupUsers] = useState<string[]>([]);

  useEffect(() => {
    const fetchGroupUsers = async () => {
      try {
        const resp = await client.getGroupUsers({ groupId: group.id });
        setGroupUsers(resp.users.map(user => user.id));
      } catch (e) {
        errorContext.current?.showError(e);
      }
    };
    void fetchGroupUsers();
  }, [client, group.id]);

  const addUsersToGroup = async () => {
    try {
      const usersIds = selectedUsers.map(user => user.id);
      await client.addUsersToGroup({ groupId: group.id, usersIds });
      save();
      close();
    } catch (e) {
      errorContext.current?.showError(e);
    }
  };

  const searchFriend = (substr: string) => {
    setNewMember(substr);
    if (!substr) {
      setSearchResults([]);
      return;
    }
    const res = [];
    for (const user of friends) {
      if (selectedUsers.includes(user)) {
        continue;
      }
      if (user.username.includes(substr)) {
        res.push(user);
      }
    }
    setSearchResults(res);
  };

  const selectUser = (user: User) => {
    setSelectedUsers(selectedUsers.concat(user));
    setNewMember('');
    setSearchResults(null);
  };

  const deleteSelectedUser = (idx: number) => {
    setSelectedUsers(selectedUsers.slice(0, idx).concat(selectedUsers.slice(idx + 1)));
  };

  return (
    <FormBackground>
      <AddExpenseForm title={`Add users to ${group.name}`} close={close}>
        <div className="px-3 py-1 h-[300px] w-[280px] space-y-3">
          <div className="flex">
            <div className="text-[13px]">{'Via invite code: '}</div>
            <div className="m-auto text-[14px] font-bold">{group.inviteCode}</div>
          </div>
          <div className="relative z-30">
            <SearchFriendInput placeholder="Or add friends manually" value={newMember} onChange={searchFriend} />
            {newMember == '' ? (
              <></>
            ) : (
              <div className="bg-white rounded-b-xl cursor-default">
                {!searchResults
                  ? [
                      <div key={'key1-none'} className="h-[40px] flex rounded-b-xl">
                        <div className="my-auto px-4 font-semibold">Loading...</div>
                      </div>,
                    ]
                  : searchResults.length == 0
                    ? [
                        <div key={'key1-none'} className="h-[40px] flex rounded-b-xl">
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
                            disabled={groupUsers.includes(user.id)}
                            showChecked={groupUsers.includes(user.id)}
                          />
                        );
                      })}
              </div>
            )}
          </div>
          <div className="content-start gap-3 absolute top-[100px] h-[40%] w-[calc(100%-4rem)] flex flex-wrap">
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
          </div>
          <button
            onClick={() => void addUsersToGroup()}
            className="disabled:bg-green-200 absolute bottom-2 left-2 py-1 bg-green-300 w-[calc(100%-16px)] rounded-md hover:bg-green-400"
          >
            Save
          </button>
        </div>
      </AddExpenseForm>
    </FormBackground>
  );
}
