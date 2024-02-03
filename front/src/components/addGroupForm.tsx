import { useContext, useState } from 'react';
import SearchFriendInput from './searchFriendInput';
import SearchItem from './searchItem';
import UserItem from './userItem';
import { ServiceClient, User } from '@/proto/api';
import { getRandImage } from '@/utils/utils';
import { ErrorAlertContext } from '@/routes/alert';
import FormButton from './formButton';

export default function AddGroupForm({
  friends,
  client,
  save,
  close,
}: {
  friends: User[];
  client: ServiceClient;
  save: () => void;
  close: () => void;
}) {
  const errorContext = useContext(ErrorAlertContext);
  const [name, setName] = useState('');
  const [newMember, setNewMember] = useState('');
  const [searchResults, setSearchResults] = useState<User[] | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const addGroup = async () => {
    try {
      const imagePath = getRandImage();
      await client.createGroup({ name: name, imagePath, type: 0, usersIds: selectedUsers.map(user => user.id) });
      save();
      close();
    } catch (e: unknown) {
      errorContext?.showError(e);
    }
  };

  const searchFriend = (name: string) => {
    setNewMember(name);
    if (!name) {
      setSearchResults([]);
      return;
    }
    const res = [];
    for (const user of friends) {
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
    selectedUsers.push(user);
    setNewMember('');
    setSearchResults(null);
  };

  const deleteSelectedUser = (idx: number) => {
    setSelectedUsers(selectedUsers.slice(0, idx).concat(selectedUsers.slice(idx + 1)));
  };

  return (
    <div className="px-2 h-full space-y-3">
      <div className="flex gap-3">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Group name"
          className="w-full rounded-xl focus:outline-[1px] focus:outline-gray-900 outline-none p-3"
        />
      </div>
      <div className="relative z-30 px-1">
        <SearchFriendInput placeholder="Add friend" value={newMember} onChange={searchFriend} />
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
                      />
                    );
                  })}
          </div>
        )}
      </div>
      <div className="content-start gap-3 absolute bottom-[70px] h-[40%] w-[calc(100%-4rem)] flex flex-wrap">
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
      <FormButton text="Save" onClick={() => void addGroup()} />
    </div>
  );
}
