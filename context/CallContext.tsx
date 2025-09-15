import React, { createContext, useState, useEffect, useContext } from "react";
import io from "socket.io-client";

// Cambia la URL por la de tu backend
const SIGNALING_SERVER_URL = "http://192.168.1.98:3000";

const CallContext = createContext<CallContextType | null>(null);


type IncomingCall = { from: string; roomId: string } | null;
export type CallContextType = {
  incomingCall: IncomingCall;
  setIncomingCall: React.Dispatch<React.SetStateAction<IncomingCall>>;
  socket: ReturnType<typeof io>;
};

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [incomingCall, setIncomingCall] = useState<IncomingCall>(null);
  const [socket] = useState(() => io(SIGNALING_SERVER_URL));

  useEffect(() => {
    const handler = ({ from, roomId }: { from: string; roomId: string }) => {
      setIncomingCall({ from, roomId });
    };
    socket.on("incoming-call", handler);
    return () => { socket.off("incoming-call", handler); };
  }, [socket]);

  return (
    <CallContext.Provider value={{ incomingCall, setIncomingCall, socket }}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  return useContext(CallContext);
}
