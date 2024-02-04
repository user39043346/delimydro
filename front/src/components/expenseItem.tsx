import { Expense } from '@/proto/api';
import SettleUpSign from './settleUpSign';
import ExpenseDate from './expenseDate';
import { CgNotes } from 'react-icons/cg';

export default function ExpenseItem({
  expense,
  myName,
  onDelete,
  onClick,
  disabled = false,
}: {
  expense: Expense;
  myName: string;
  onDelete: () => void;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      onClick={() => {
        if (!disabled) {
          onClick();
        }
      }}
      className={`${!disabled ? 'cursor-pointer' : ''} flex gap-2 items-center justify-start px-2 py-1`}
    >
      <ExpenseDate time={expense.time ?? null} />
      {expense.type === 1 ? (
        <>
          <SettleUpSign />
          <div>
            <span className="text-[15px] font-[650]">{expense.debtorName}</span>
            <span className="text-[13px]">{' paid '}</span>
            <span className="text-[15px] font-[650]">{expense.payerName}</span>
          </div>
          <div className="flex-1" />
          <div className="flex-col text-end w-[55px]">
            <div className=" text-gray-500 text-[9px]">settle up</div>
            <div className="text-[11px] font-extrabold">{expense.totalPaid}</div>
          </div>
          {/* <span className="text-[11px] font-extrabold">{expense.totalPaid}</span> */}
        </>
      ) : (
        <>
          <div className="bg-gray-300 p-[4px] shadow-md rounded-md ">
            <CgNotes className="text-white w-[16px] h-[16px]" />
          </div>
          <span className="font-[650]">{expense.name}</span>
          <div className="flex-1" />
          <div className="flex-col text-end">
            <div className=" text-gray-500 text-[9px]">{`${expense.payerName === '' ? 'multiple people' : expense.payerName === myName ? 'you' : expense.payerName} paid`}</div>
            <div className="text-[11px] font-extrabold">{expense.totalPaid}</div>
          </div>
          <div className="flex-col text-end w-[55px]">
            {expense.myDiff === 0 ? (
              <div className="text-gray-500 text-[9px]">not involved</div>
            ) : (
              <>
                <div className=" text-gray-500 text-[9px]">{`${expense.myDiff < 0 ? 'you owe' : 'you lent'}`}</div>
                <div
                  className={`text-[11px] font-extrabold ${expense.myDiff < 0 ? 'text-orange-400' : 'text-green-400'}`}
                >
                  {Math.abs(expense.myDiff)}
                </div>
              </>
            )}
          </div>
        </>
      )}
      <button
        onClick={e => {
          e.stopPropagation();
          onDelete();
        }}
        className="pl-1 group hover:fill-slate-800"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16.1898 2H7.81978C4.17978 2 2.00977 4.17 2.00977 7.81V16.18C2.00977 19.82 4.17978 21.99 7.81978 21.99H16.1898C19.8298 21.99 21.9998 19.82 21.9998 16.18V7.81C21.9998 4.17 19.8298 2 16.1898 2Z"
            fill="#a0a0a0"
            className="group-hover:fill-slate-800"
          />
          <path
            d="M16.8598 8.46008C16.0198 8.38008 15.2498 8.33008 14.4998 8.28008L14.4198 7.80008C14.3498 7.32008 14.1998 6.33008 12.6898 6.33008H11.2998C9.80979 6.33008 9.6498 7.28008 9.5698 7.79008L9.4898 8.26007C9.0598 8.29007 8.6398 8.31007 8.2098 8.35007L7.11979 8.46008C6.73979 8.50008 6.46979 8.83008 6.50979 9.21008C6.54979 9.56008 6.83979 9.83008 7.18979 9.83008C7.20979 9.83008 7.23979 9.83008 7.25979 9.83008L8.33979 9.72008C8.93979 9.67008 9.54979 9.62008 10.1498 9.59008C11.3698 9.54008 12.5898 9.56008 13.8198 9.62008C14.7298 9.66008 15.6798 9.73008 16.7198 9.83008C16.7398 9.83008 16.7598 9.83008 16.7798 9.83008C17.1298 9.83008 17.4298 9.56008 17.4598 9.21008C17.5098 8.83008 17.2398 8.49008 16.8598 8.46008Z"
            fill="white"
          />
          <path
            d="M15.8305 11.1005C15.6605 10.9105 15.4105 10.8105 15.1605 10.8105H8.84049C8.59049 10.8105 8.34049 10.9205 8.17049 11.1005C8.00049 11.2905 7.91048 11.5405 7.93048 11.7905L8.2405 15.7505C8.3005 16.6005 8.37049 17.6605 10.2905 17.6605H13.7105C15.6305 17.6605 15.7005 16.6005 15.7605 15.7505L16.0705 11.7905C16.0905 11.5405 16.0005 11.2905 15.8305 11.1005Z"
            fill="white"
          />
        </svg>
      </button>
    </div>
  );
}
