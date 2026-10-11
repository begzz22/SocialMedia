import { createContext, useState, type ReactNode } from "react";

type AuthContextType = {
  token: string | null;
  insertUserToken: (tkn: string) => void;
  logoutContext: () => void;
};

export const authContext = createContext<AuthContextType>({
  token: null,
  insertUserToken: () => {},
  logoutContext: () => {},
});

const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );

  function insertUserToken(tkn: string) {
    setToken(tkn);
    localStorage.setItem("token", tkn);
  }

  function logoutContext() {
    setToken(null);
    localStorage.removeItem("token");
  }

  return (
    <authContext.Provider value={{ token, insertUserToken, logoutContext }}>
      {children}
    </authContext.Provider>
  );
};

export default AuthContextProvider;
