import AddExpenseForm from '@/components/addExpenseForm';
import FormBackground from '@/components/formBackground';
import FormButton from '@/components/formButton';
import { Group, ServiceClient } from '@/proto/api';
import { useContext } from 'react';
import { ErrorAlertContext } from './alert';

export default function DeleteGroupForm({
  group,
  client,
  save,
  close,
}: {
  group: Group | null;
  client: ServiceClient;
  save: () => void;
  close: () => void;
}) {
  const errorContetxt = useContext(ErrorAlertContext);

  const deleteGroup = async () => {
    try {
      await client.deleteGroup({ groupId: group?.id });
      save();
      close();
    } catch (e) {
      errorContetxt?.showError(e);
    }
  };

  if (group === null) return <></>;

  return (
    <FormBackground>
      <AddExpenseForm title="Delete group" close={close}>
        <div className="h-[200px] w-[250px] p-2 pt-12 text-center">
          <span>{`Are you sure want to delete group `}</span>
          <span className="font-bold">{group.name}</span>
          <span>?</span>
        </div>
        <FormButton text="Delete" onClick={() => void deleteGroup()} />
      </AddExpenseForm>
    </FormBackground>
  );
}
