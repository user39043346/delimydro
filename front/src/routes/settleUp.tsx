import AddExpenseForm from '@/components/addExpenseForm';
import CheckBox from '@/components/checkbox';
import FormBackground from '@/components/formBackground';
import TextFormButton from '@/components/textFormButton';
import UserImage from '@/components/userImage';
import { ServiceClient, User } from '@/proto/api';
import { useContext, useState } from 'react';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { ErrorAlertContext } from './alert';

export default function SettleUp({
  close,
  save,
  groupId,
  client,
  me,
  users,
}: {
  groupId: string;
  client: ServiceClient;
  me: User | null;
  users: User[];
  save: () => void;
  close: () => void;
}) {
  const errorContext = useContext(ErrorAlertContext);
  const [payer, setPayer] = useState(me);
  const [payee, setPayee] = useState(me);
  const [payerScreen, setPayerScreen] = useState(false);
  const [payeeScreen, setPayeeScreen] = useState(true);
  const [amount, setAmount] = useState(0);

  const createSettleUp = async () => {
    try {
      await client.groupSettleUp({ groupId, debt: { payerId: payee?.id, debtorId: payer?.id, amount } });
      save();
      close();
    } catch (e) {
      errorContext?.showError(e);
    }
  };

  const updateAmount = (s: string) => {
    const n = isNaN(Number(s)) ? 0 : Number(s);
    setAmount(n);
  };

  if (!payer || !payee) {
    return <></>;
  }

  return (
    <FormBackground>
      <AddExpenseForm title="Settle up" style="w-[300px] h-[300px]" close={close}>
        <div className="flex-col p-2 h-full">
          <div className="justify-center h-[60px] p-2 items-center gap-2 flex">
            <UserImage src={payer.imagePath} />
            <FaLongArrowAltRight className="text-[27px] text-gray-500" />
            <UserImage src={payee.imagePath} />
          </div>
          <div className="w-min flex m-auto gap-2">
            <TextFormButton
              onClick={() => {
                setPayerScreen(!payerScreen);
                setPayeeScreen(false);
              }}
              text={payer.username === me?.username ? 'You' : payer.username}
            />
            <span>paid</span>
            <TextFormButton
              onClick={() => {
                setPayerScreen(false);
                setPayeeScreen(!payeeScreen);
              }}
              text={payee.username === me?.username ? 'You' : payee.username}
            />
          </div>
          <div className="m-auto w-min pb-10">
            <input
              placeholder="0.00"
              defaultValue={amount}
              onChange={e => updateAmount(e.target.value)}
              className="text-[30px] w-[80px] text-center bg-transparent border-dashed border-b-[2px] outline-none border-gray-400"
            />
          </div>
          <button
            onClick={() => void createSettleUp()}
            className="disabled:bg-green-200 absolute bottom-2 left-2 py-1 bg-green-300 w-[calc(100%-16px)] rounded-md hover:bg-green-400"
          >
            Save
          </button>
        </div>
      </AddExpenseForm>
      {payerScreen === false ? (
        <></>
      ) : (
        <AddExpenseForm title="Select payer" style="w-[150px]" close={() => setPayerScreen(false)}>
          {users.map(user => (
            <button
              onClick={() => setPayer(user)}
              key={user.id}
              className="h-[27px] w-full flex py-1 pl-1 items-center hover:bg-gray-200 my-1"
            >
              <UserImage src={user.imagePath} />
              <span className="px-2">{user.username}</span>
              <div className="flex-1" />
              {payer.id === user.id ? <CheckBox checked={true} /> : null}
            </button>
          ))}
        </AddExpenseForm>
      )}
      {payeeScreen === false ? (
        <></>
      ) : (
        <AddExpenseForm title="Select payee" style="w-[150px]" close={() => setPayeeScreen(false)}>
          {users.map(user => (
            <button
              onClick={() => setPayee(user)}
              key={user.id}
              className="h-[27px] w-full flex py-1 px-1 items-center hover:bg-gray-200 my-1"
            >
              <UserImage src={user.imagePath} />
              <span className="px-2">{user.username}</span>
              <div className="flex-1" />
              {payee.id === user.id ? <CheckBox checked={true} /> : null}
            </button>
          ))}
        </AddExpenseForm>
      )}
    </FormBackground>
  );
}
