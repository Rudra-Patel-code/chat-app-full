import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import LocalStorage from "../utils/LocalStorage";

const SocketContext = createContext({
  socket: null,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = LocalStorage.get("accessToken");
    setSocket(
      io(import.meta.env.VITE_SOCKET_URL, {
        withCredentials: true,
        auth: { token },
      })
    );
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
