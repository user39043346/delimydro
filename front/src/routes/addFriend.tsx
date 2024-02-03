import { ServiceClient, User } from '@/proto/api';
import { useContext, useState } from 'react';
import { ErrorAlertContext } from './alert';
import FormBackground from '@/components/formBackground';
import UserImage from '@/components/userImage';
import AddExpenseForm from '@/components/addExpenseForm';
import FormButton from '@/components/formButton';

export default function AddFriend({
  client,
  myCode,
  close,
  save,
}: {
  client: ServiceClient;
  myCode: string;
  close: () => void;
  save: () => void;
}) {
  const errorContext = useContext(ErrorAlertContext);
  const [code, setCode] = useState('');
  const [user, setUser] = useState<User | null>(null);

  const searchFriend = async () => {
    try {
      const res = await client.searchUser({ code: code });
      if (res.user) {
        setUser(res.user);
      }
    } catch (e) {
      errorContext?.showError(e);
      setUser(null);
    }
  };

  const addFriend = async () => {
    try {
      await client.addFriend({ code: user?.code });
      setUser(null);
      save();
      close();
    } catch (e) {
      errorContext?.showError(e);
      setUser(null);
    }
  };

  return (
    <FormBackground>
      <AddExpenseForm title="Add friend" style="w-[300px] h-[280px]" close={close}>
        <div className="p-2 h-full">
          <div className="flex gap-3">
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Enter code"
              className="w-[50%] focus:outline rounded-md focus:border-1 p-2"
            />
            <div className=" text-center text-wrap">
              Your code: <span className="font-black">{myCode}</span>
            </div>
          </div>
          {/* buttons */}
          <div className="flex h-[50%] text-center items-center">
            {!user ? (
              `Enter your friend's code or share your code with others`
            ) : (
              <div className="flex m-auto h-[30px] gap-2">
                <UserImage src={user?.imagePath ?? 'img1.png'} />
                <div className="m-auto">{user.username}</div>
              </div>
            )}
          </div>
          {!user ? (
            <FormButton text="Search" onClick={() => void searchFriend()} />
          ) : (
            <FormButton text="Add" onClick={() => void addFriend()} />
          )}
        </div>
      </AddExpenseForm>
    </FormBackground>
  );
}
