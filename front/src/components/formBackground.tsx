import React from 'react';

export default function FormBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="z-10 fixed w-full h-full bg-gray-100/[0.4] flex">
      <div className="flex m-auto gap-4">{children}</div>
    </div>
  );
}
