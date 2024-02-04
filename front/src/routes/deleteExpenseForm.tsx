import AddExpenseForm from '@/components/addExpenseForm';
import FormBackground from '@/components/formBackground';
import FormButton from '@/components/formButton';
import { Expense, ServiceClient } from '@/proto/api';
import { useContext } from 'react';
import { ErrorAlertContext } from './alert';

export default function DeleteExpenseForm({
  groupId,
  expense,
  client,
  save,
  close,
}: {
  groupId: string;
  expense: Expense;
  client: ServiceClient;
  save: () => void;
  close: () => void;
}) {
  const errorContetxt = useContext(ErrorAlertContext);

  const deleteGroup = async () => {
    try {
      await client.deleteGroupExpense({ groupId, expenseId: expense.id });
      save();
      close();
    } catch (e) {
      errorContetxt?.showError(e);
    }
  };

  return (
    <FormBackground>
      <AddExpenseForm title={`Delete ${expense.type === 1 ? 'settle up' : 'expense'}`} close={close}>
        <div className="h-[200px] w-[250px] p-2 pt-12 text-center">
          {expense.type === 1 ? (
            <span>Are you sure want to delete this settle up?</span>
          ) : (
            <>
              <span>{`Are you sure want to delete expense `}</span>
              <span className="font-bold">{expense.name}</span>
              <span>?</span>
            </>
          )}
        </div>
        <FormButton text="Delete" onClick={() => void deleteGroup()} />
      </AddExpenseForm>
    </FormBackground>
  );
}
