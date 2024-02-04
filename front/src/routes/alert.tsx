import { ClientError } from 'nice-grpc-web';
import React, { createContext, useState } from 'react';

interface ErrorAlertContextType {
  showError: React.Dispatch<React.SetStateAction<unknown>>;
}

export const ErrorAlertContext = createContext<ErrorAlertContextType | null>(null);

export default function ErrorAlertProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<unknown>(null);

  if (error instanceof ClientError) {
    setTimeout(() => setError(null), 3000);
  }

  return (
    <ErrorAlertContext.Provider value={{ showError: setError }}>
      {!(error instanceof ClientError) ? null : (
        <div className="z-50 rounded-xl absolute top-14 overflow-hidden right-10 w-[250px] shadow-[7px_7px_15px_rgba(0,0,0,0.55)]">
          <div className="bg-purple-300 py-2 pr-4 pl-6 flex">
            <div className="text-black font-[670]">Error</div>
            <div className="flex-1" />
            {/* <img onClick={()=>setError('')} className='cursor-pointer h-[25px]' src={CloseIcon} /> */}
          </div>
          <div className="py-3 px-5 bg-gray-100 font-[400] text-[14px]">
            {error.details.startsWith('Transport error: ') ? 'Connection error' : error.details}
          </div>
        </div>
      )}
      {children}
    </ErrorAlertContext.Provider>
  );
}
