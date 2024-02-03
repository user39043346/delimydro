import { ServiceClient, User } from '@/proto/api';
import { useState } from 'react';
import FormBackground from '@/components/formBackground';
import { IoClose } from 'react-icons/io5';
import AddGroupForm from '@/components/addGroupForm';
import JoinGroupForm from '@/components/joinGroupForm';

export default function AddGroup({
  friends,
  client,
  close,
  save,
}: {
  friends: User[];
  client: ServiceClient;
  close: () => void;
  save: () => void;
}) {
  const [flag, setFlag] = useState(false);

  return (
    <FormBackground>
      <div className="shadow-lg relative overflow-hidden space-y-3 w-[350px] h-[350px] m-auto rounded-xl bg-gray-100">
        <div className="h-[35px] bg-purple-300 flex font-bold text-[15px]">
          <button
            onClick={() => setFlag(false)}
            className={`px-3 text-gray-900 ${flag === false ? 'bg-purple-200 rounded-t-xl' : ''}`}
          >
            Create group
          </button>
          <button
            onClick={() => setFlag(true)}
            className={`px-3 text-gray-900 ${flag === true ? 'bg-purple-200 rounded-t-xl' : ''}`}
          >
            Join group
          </button>
          <div className="flex-1" />
          <button onClick={close} className="pr-3">
            <IoClose />
          </button>
        </div>
        {flag === false ? (
          <AddGroupForm friends={friends} client={client} close={close} save={save} />
        ) : (
          <JoinGroupForm client={client} close={close} save={save} />
        )}
      </div>
    </FormBackground>
  );
}
