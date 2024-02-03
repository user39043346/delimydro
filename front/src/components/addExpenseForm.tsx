import { IoClose } from 'react-icons/io5';

export default function AddExpenseForm({
  title,
  close,
  children,
  style,
}: {
  title: string;
  style?: string;
  close: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`${style} relative shadow-lg overflow-hidden rounded-xl bg-gray-100`}>
      <div className="text-gray-700 items-center bg-purple-300 px-3 h-[35px] flex">
        <div className="font-bold text-[15px]">{title}</div>
        <div className="flex-1" />
        <button onClick={close} className="">
          <IoClose />
        </button>
      </div>
      {children}
    </div>
  );
}
