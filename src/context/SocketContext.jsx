import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import { useNotificationStore } from "../lib/notificationStore";

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const fetchNotification = useNotificationStore((state) => state.fetch);
  
//   useEffect(() => {
//   setSocket(io(import.meta.env.VITE_SOCKET_URL));
// }, []);

  useEffect(() => {
  const socketUrl =
    import.meta.env.VITE_SOCKET_URL ??
    "https://real-estate-backend-socket.onrender.com";

  console.log("SOCKET URL:", socketUrl); // debug

  const s = io(socketUrl, {
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  setSocket(s);

  return () => {
    s.disconnect();
  };
}, []);

  useEffect(() => {
    if (currentUser && socket) socket.emit("newUser", currentUser.id);
  }, [currentUser, socket]);

  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleNotification = () => {
      fetchNotification();
    };

    socket.on("getMessage", handleNotification);
    socket.on("notification", handleNotification);
    return () => {
      socket.off("getMessage", handleNotification);
      socket.off("notification", handleNotification);
    };
  }, [socket, currentUser, fetchNotification]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};
