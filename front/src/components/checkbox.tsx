import { useState } from 'react';
import { BsCheckCircleFill } from 'react-icons/bs';

export default function CheckBox({ checked, onClick }: { checked: boolean; onClick?: (checked: boolean) => void }) {
  const [_checked, setChecked] = useState(checked);

  return (
    <label className="flex translate-y-[1px]">
      <input
        type="checkbox"
        disabled={!onClick}
        checked={_checked}
        onChange={() => {
          setChecked(!_checked);
          if (onClick) {
            onClick(!_checked);
          }
        }}
        className="w-0 h-0 opacity-0 peer"
      />
      <BsCheckCircleFill className="cursor-pointer w-[15px] h-[15px] opacity-70 text-white peer-checked:text-green-700 peer-checked:opacity-100" />
    </label>
  );
}
