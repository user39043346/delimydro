import { serviceUnauthorizedClient } from '@/service/service';
import { useContext, useState } from 'react';
import { ErrorAlertContext } from './alert';
import { getRandImage } from '@/utils/utils';

export default function Login({ callback }: { callback: (token: string) => void }) {
  const errorContext = useContext(ErrorAlertContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const register = async () => {
    try {
      const imagePath = getRandImage();
      const resp = await serviceUnauthorizedClient.register({ username: username, password: password, imagePath });
      callback(resp.token);
    } catch (e: unknown) {
      errorContext?.showError(e);
    }
  };

  const login = async () => {
    try {
      const resp = await serviceUnauthorizedClient.login({ username: username, password: password });
      callback(resp.token);
    } catch (e: unknown) {
      errorContext?.showError(e);
    }
  };

  return (
    <>
      {/* <div className='bg-gradient-to-br from-[#151515] to-[#440857] from-20% items-center flex h-screen'> */}
      <div className="flex h-screen bg-white/[0.8]">
        <div className="px-10 pt-5 pb-8 m-auto space-y-4 bg-[#ac8bcc] rounded-[30px] drop-shadow-[5px_5px_10px_rgba(0,0,0,0.5)]">
          <div className="text-white font-[710] text-[28px] text-center pb-2">delimydro</div>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            className="flex w-[343px] h-14 py-2 px-[20px] focus:px-[19px] focus:border-[1px] focus:border-zinc-900/[0.4] outline-none bg-gray-300/[0.3] rounded-2xl text-[16px] placeholder:text-zinc-600"
          ></input>
          <input
            value={password}
            type="password"
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="flex w-[343px] h-14 py-2 px-[20px] focus:px-[19px] focus:border-[1px] focus:border-zinc-900/[0.4] outline-none bg-gray-300/[0.3] rounded-2xl text-[16px] placeholder:text-zinc-600"
          ></input>
          {/* <div className='m-auto caret-white text-white w-[343px] h-14 px-6 py-2 bg-zinc-900/[0.4] rounded-2xl justify-start items-center gap-3 flex'>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type='password' className='flex-auto bg-transparent outline-none rounded-lg text-[16px] placeholder:text-gray-400' placeholder='Password'></input>
          </div> */}
          <div className="flex gap-2 pt-3">
            <button
              onClick={() => void login()}
              className="flex-1 rounded-3xl text-white bg-[#23072e] py-2.5 font-bold"
            >
              Login
            </button>
            <button
              onClick={() => void register()}
              className="flex-1 rounded-3xl text-white py-2.5 bg-black/[0.5] font-bold"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
