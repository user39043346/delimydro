import { useState } from 'react';

export default function Toggle({ isChecked, onClick }: { isChecked: boolean; onClick: (checked: boolean) => void }) {
  const [checked, setChecked] = useState(isChecked);

  const callback = () => {
    setChecked(!checked);
    onClick(!checked);
  };

  return (
    <label className="relative inline-block w-[26px] h-[15px]">
      <input type="checkbox" defaultChecked={checked} onClick={callback} className="w-0 h-0 opacity-0 peer" />
      <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#2c3e50] rounded-[15px] peer-checked:bg-[#00c853] before:content-[''] before:absolute before:h-[10px] before:w-[10px] before:left-[2px] before:bottom-[2.6px] before:bg-white before:rounded-[50%] peer-checked:before:translate-x-[12px]" />
    </label>
  );
}
