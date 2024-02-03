import CheckBox from './checkbox';
import UserImage from './userImage';

export default function SearchItem({
  imagePath,
  name,
  rounded,
  onClick,
  disabled = false,
  showChecked = false,
}: {
  imagePath: string;
  name: string;
  rounded: boolean;
  onClick: () => void;
  disabled?: boolean;
  showChecked?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`border-b-[2px] h-[40px] p-2 flex w-full gap-2 items-center hover:bg-gray-100 ${rounded ? 'rounded-b-md' : ''}`}
    >
      <UserImage src={imagePath} />
      <div className=" font-semibold">{name}</div>
      {showChecked === false ? null : (
        <>
          <div className="flex-1" />
          <CheckBox checked={true} />
        </>
      )}
    </button>
  );
}
