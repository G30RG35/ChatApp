import React, { createContext, useState, useContext, Dispatch, SetStateAction } from "react";

type UserContextType = {
  user: any;
  setUser: Dispatch<SetStateAction<any>>;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: React.PropsWithChildren<{}>) {
  const [user, setUser] = useState<any>(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}