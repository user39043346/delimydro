import { Group, ServiceClient } from '@/proto/api';
import { useContext, useState } from 'react';
import FormButton from './formButton';
import { ErrorAlertContext } from '@/routes/alert';
import UserImage from './userImage';

export default function JoinGroupForm({
  client,
  save,
  close,
}: {
  client: ServiceClient;
  save: () => void;
  close: () => void;
}) {
  const errorContext = useContext(ErrorAlertContext);
  const [code, setCode] = useState('');
  const [group, setGroup] = useState<Group | null>(null);

  const searchGroup = async () => {
    try {
      const resp = await client.searchGroup({ inviteCode: code });
      if (resp.group) {
        setGroup(resp.group);
      }
    } catch (e) {
      errorContext?.showError(e);
    }
  };

  const joinGroup = async () => {
    try {
      await client.joinGroup({ inviteCode: group?.inviteCode });
      save();
      close();
    } catch (e) {
      errorContext?.showError(e);
      setGroup(null);
    }
  };
  return (
    <div className="px-2 h-full space-y-3">
      <input
        defaultValue={code}
        onChange={e => setCode(e.target.value)}
        placeholder="Invite code"
        className="w-full rounded-xl focus:outline focus:outline-gray-900 p-3"
      />
      <div className="rounded-lg pt-16 mx-20 text-center">
        {group === null ? (
          'Enter invite code to preview group'
        ) : (
          <div className="justify-center p-2 h-[40px] gap-2 flex">
            <UserImage src={group.imagePath} />
            {group.name}
          </div>
        )}
      </div>
      {group === null ? (
        <FormButton onClick={() => void searchGroup()} text="Search" />
      ) : (
        <FormButton onClick={() => void joinGroup()} text="Join" />
      )}
    </div>
  );
}
