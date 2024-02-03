import { createContext, useEffect, useState } from 'react';
import { serviceUnauthorizedClient } from '@/service/service';
import { Metadata } from 'nice-grpc-web';
import Login from './login';

interface TokenInfo {
  token: string;
  correct: boolean;
}

function TokenStorage() {
  const [tokenInfo, setToken] = useState<TokenInfo | null>(null);

  useEffect(() => {
    if (tokenInfo?.correct) {
      window.localStorage.setItem('token', tokenInfo.token);
    }
  }, [tokenInfo]);

  useEffect(() => {
    const renewToken = async () => {
      const toCheck = window.localStorage.getItem('token') ?? '';
      try {
        await serviceUnauthorizedClient.renewToken({}, { metadata: new Metadata({ authorization: toCheck }) });
        setToken({
          token: toCheck,
          correct: true,
        });
      } catch (e) {
        setToken({
          token: toCheck,
          correct: false,
        });
      }
    };
    void renewToken();
  }, []);

  return [tokenInfo, setToken] as const;
}

interface AuthContextType {
  metadata: Metadata;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokenInfo, setTokenInfo] = TokenStorage();

  const logout = () => {
    setTokenInfo({ token: '', correct: true });
  };

  if (!tokenInfo) {
    return <></>;
  }

  if (!tokenInfo.correct || tokenInfo.token == '') {
    return <Login callback={(token: string) => setTokenInfo({ token, correct: true })} />;
  }

  return (
    <AuthContext.Provider value={{ metadata: new Metadata({ authorization: tokenInfo.token }), logout }}>
      {children}
    </AuthContext.Provider>
  );
}
