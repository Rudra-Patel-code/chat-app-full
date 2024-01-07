import { createContext, useContext, useState } from "react";
import { handleRequest } from "../utils/handleRequest";
import { getUserChats } from "../utils/api";
import toast from "react-hot-toast";

const chatContext = createContext({
  chats: [],
  loading: false,
  loadChats: async () => {},
});

export const useChats = () => useContext(chatContext);

export const ChatsProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadChats = async () => {
    handleRequest(
      async () => await getUserChats(),
      setLoading,
      (res) => {
        const { data } = res;

        setChats(data || []);
      },
      (errorMessage) => {
        console.log(errorMessage);
        toast.error(errorMessage);
      }
    );
  };

  return (
    <chatContext.Provider value={{ chats, loadChats, loading }}>
      {children}
    </chatContext.Provider>
  );
};
