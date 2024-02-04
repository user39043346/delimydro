import { Debt, Expense, ServiceClient, User } from '@/proto/api';
import { ErrorAlertContext } from '@/routes/alert';
import { useContext, useEffect, useMemo, useState } from 'react';
import UserImage from './userImage';

export default function ExpenseInfo({
  expense,
  cache,
  client,
  usersMap,
}: {
  expense: Expense;
  cache: Map<string, Debt[]>;
  client: ServiceClient;
  usersMap: Map<string, User>;
}) {
  const errorContext = useContext(ErrorAlertContext);
  const [info, setInfo] = useState<Debt[] | null>(null);
  const diffs = useMemo(() => {
    const diffs = new Map<string, number[]>();
    if (info === null) return diffs;

    for (const debt of info) {
      const p = diffs.get(debt.payerId) ?? [0, 0];
      diffs.set(debt.payerId, [p[0] + debt.amount, p[1]]);
      const d = diffs.get(debt.debtorId) ?? [0, 0];
      diffs.set(debt.debtorId, [d[0], d[1] + debt.amount]);
    }
    return diffs;
  }, [info]);

  useEffect(() => {
    const fetchExpenseInfo = async () => {
      try {
        const resp = await client.expenseInfo({ expenseId: expense.id });
        return resp.usersDistribution;
      } catch (e) {
        errorContext?.showError(e);
        return null;
      }
    };

    if (cache.has(expense.id)) {
      setInfo(cache.get(expense.id) ?? null);
    } else {
      void fetchExpenseInfo().then(resp => {
        if (resp !== null) {
          cache.set(expense.id, resp);
          setInfo(resp);
        }
      });
    }
  }, [client, cache, errorContext, expense.id]);

  if (info === null) return <></>;

  return (
    <div>
      {[...diffs.entries()].map(([id, diff], idx) => {
        const user = usersMap.get(id);
        return (
          <div key={`expense_item${idx}`}>
            <div className="h-[27px] gap-1 items-center px-2 py-1 flex">
              <UserImage src={user?.imagePath ?? ''} />
              <div className="">
                <span className="text-[13px] font-bold">{user?.username ?? ''}</span>
                {diff[0] == 0 ? null : (
                  <>
                    <span className="text-[13px]">{' paid '}</span>
                    <span className="text-[13px] font-bold">{diff[0]}</span>
                  </>
                )}
                {diff[0] == 0 || diff[1] == 0 ? null : <span className="text-[13px]">{' and '}</span>}
                {diff[1] == 0 ? null : (
                  <>
                    <span className="text-[13px]">{' owes '}</span>
                    <span className="text-[13px] font-bold">{diff[1]}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
