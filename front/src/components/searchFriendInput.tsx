import { RiSearch2Line } from 'react-icons/ri';

export default function SearchFriendInput({
  placeholder = '',
  value,
  onChange,
}: {
  placeholder?: string;
  value: string;
  onChange: (str: string) => void;
}) {
  return (
    <div className="relative flex justify-start items-center">
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-[15px] pr-[26px] w-full pl-1 pb-[2px] border-black border-b-2 bg-transparent focus:outline-none inline-block"
      />
      <span className="absolute right-1 top-0">
        <RiSearch2Line className="w-5 h-5" />
      </span>
    </div>
  );
}
