import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { IoMdSend } from "react-icons/io";
import { FaCross, FaLess, FaPaperclip, FaSpinner } from "react-icons/fa";

import { useSocket } from "../context/SocketContext";
import { EventEnums } from "../utils/index";
import { BiMessageSquareDetail } from "react-icons/bi";

import ChatHeader from "../components/chat/ChatHeader";
import LocalStorage from "../utils/LocalStorage";
import toast from "react-hot-toast";
import { handleRequest } from "../utils/handleRequest";
import { getChatMessages, getUserChats, sendMessage } from "../utils/api";
import { AiOutlineSearch } from "react-icons/ai";
import ChatMenuCard from "../components/chat/ChatMenuCard";
import { generateChatMetaData } from "../utils/helper";
import { RxCross2 } from "react-icons/rx";
import Typing from "../components/Typing/Typing";
import Loader from "../components/Loader/Loader";
import MessageCard from "../components/MessageCard";
import LoaderTwo from "../components/Loader/LoaderTwo";

const Chat = () => {
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  const { logout, user } = useAuth();
  const { socket } = useSocket();
  const [msgLoading, setMsgLoading] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMessageHeaderModal, setIsMessageHeaderModal] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const [sendingImages, setSendingImages] = useState(false);

  const typingTimeRef = useRef();
  const [selfTyping, setSelfTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // const currentChatref = useRef();
  const [currentChat, setCurrentChat] = useState();
  const [isSideBar, setIsSidebar] = useState(false);
  const [searchChat, setSearchChat] = useState("");

  const toggleSideBar = () => setIsSidebar(!isSideBar);

  const updateLastMessage = (updatedChatId, _message) => {
    const chatToUpdate = chats.find((chat) => chat._id === updatedChatId);

    chatToUpdate.lastMessage = _message;

    setChats([
      chatToUpdate,
      ...chats.filter((chat) => chat._id !== updatedChatId),
    ]);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      if (e.target.files.length > 4)
        return toast.error("Maximum 4 Images are Allowed");
      setAttachedFiles([...e.target.files]);
    }
  };

  const handleMessageSent = async (e) => {
    e.preventDefault();
    if (!currentChat._id || !socket) return;

    const myFormData = new FormData();

    if (message) myFormData.append("content", message);

    attachedFiles?.map((file) => {
      myFormData.append("images", file);
    });

    await handleRequest(
      async () => await sendMessage(currentChat._id, myFormData),
      attachedFiles.length > 0 ? setSendingImages : null,
      (res) => {
        setMessage("");
        setAttachedFiles([]);
        setMessages((prev) => [res.data, ...prev]);
        updateLastMessage(currentChat._id || "", res.data);
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
  };

  const handleMessageTyping = (e) => {
    setMessage(e.target.value);

    if (!socket || !connected) return;

    if (!selfTyping) {
      setSelfTyping(true);
      socket.emit(EventEnums.TYPING, { chatId: currentChat._id });
    }

    if (typingTimeRef.current) {
      clearTimeout(typingTimeRef.current);
    }

    const timoutLength = 1000;

    typingTimeRef.current = setTimeout(() => {
      socket.emit(EventEnums.STOP_TYPING, { chatId: currentChat._id });
      setSelfTyping(false);
    }, timoutLength);
  };

  const onSocketTyping = (payload) => {
    console.log("got in on typing function");
    if (payload.chatId !== currentChat._id) return;
    console.log("typing");
    setIsTyping(true);
  };

  const onSocketTypingStop = (payload) => {
    console.log("got in on typing function");
    if (payload.chatId !== currentChat._id) return;
    console.log("stoptyping");
    setIsTyping(false);
  };

  const onCardClick = (chat) => {
    toggleSideBar();
    if (currentChat?._id && currentChat?._id === chat._id) return;

    LocalStorage.set("currentChat", chat);
    setCurrentChat(chat);
    setMessage("");
    setMessages([]);
    setUnreadMessages((prev) => prev.filter((msg) => msg.partof !== chat._id));
  };

  const onChatNameChange = (data) => {
    const { payload } = data;

    if (payload._id === currentChat?._id) {
      setCurrentChat(payload);
      LocalStorage.set("currentChat", payload);
    }

    setChats((prev) => [
      ...prev.map((c) => {
        if (c._id === payload._id) {
          return payload;
        }

        return c;
      }),
    ]);
  };

  const onMessageReceived = ({ receivedMessage }) => {
    console.log(receivedMessage);

    if (receivedMessage?.partof !== currentChat._id) {
      setUnreadMessages((prev) => [receivedMessage, ...prev]);
    } else {
      setMessages((prev) => [receivedMessage, ...prev]);
    }

    updateLastMessage(receivedMessage?.partof || "", receivedMessage);
  };

  const onDeleteChat = (chatId) => {
    setChats((prev) => prev.filter((chat) => chat._id !== chatId));

    if (currentChat?._id === chatId) {
      setCurrentChat(null);
      LocalStorage.remove("currentChat");
    }
  };

  const onConnect = () => {
    setConnected(true);
  };

  const onDisconnect = () => {
    setConnected(false);
  };

  const getMessages = (_currentChat = null) => {
    console.log("getting messages");
    let localcurrentChat = _currentChat;

    if (!localcurrentChat) {
      localcurrentChat = currentChat;
    }

    if (!localcurrentChat?._id) return;

    console.log(socket ? true : false);
    if (!socket) return toast.error("Socket not available");

    socket.emit(EventEnums.JOINED_CHAT, {
      chatId: localcurrentChat?._id,
    });

    // removing msg from current chat as those will be read
    setUnreadMessages(
      unreadMessages.filter((msg) => msg.partof !== localcurrentChat?._id)
    );

    handleRequest(
      async () => await getChatMessages(localcurrentChat?._id),
      setMsgLoading,
      (res) => {
        const { data } = res;
        setMessages(data || []);
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
  };

  const loadChats = async () => {
    handleRequest(
      async () => await getUserChats(),
      setLoading,
      (res) => {
        const { data } = res;

        setChats(data || []);
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
  };

  const onNewChat = ({ payload }) => {
    console.log("new chat");
    setChats((prev) => [payload, ...prev]);
  };

  const onLeaveChat = ({ payload }) => {
    if (payload._id === currentChat?._id) {
      setCurrentChat(null);
      LocalStorage.remove("currentChat");
    }

    setChats((prev) => prev.filter((ch) => ch._id !== payload._id));
  };

  useEffect(() => {
    loadChats();

    const _currentChat = LocalStorage.get("currentChat");

    if (_currentChat) {
      setCurrentChat(_currentChat);

      socket?.emit(EventEnums.JOINED_CHAT, {
        chatId: _currentChat?._id,
      });

      getMessages(_currentChat);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on(EventEnums.CONNECTED, onConnect);
    socket.on(EventEnums.UPDATE_GROUP_NAME, onChatNameChange);
    socket.on(EventEnums.NEW_CHAT, onNewChat);
    socket.on(EventEnums.LEAVE_CHAT, onLeaveChat);
    socket.on(EventEnums.DISCONNECTED, onDisconnect);
    socket.on(EventEnums.TYPING, onSocketTyping);
    socket.on(EventEnums.STOP_TYPING, onSocketTypingStop);
    socket.on(EventEnums.MESSAGE_RECEIVED, onMessageReceived);

    return () => {
      socket.off(EventEnums.CONNECTED, onConnect);
      socket.off(EventEnums.UPDATE_GROUP_NAME, onChatNameChange);
      socket.off(EventEnums.NEW_CHAT, onNewChat);
      socket.off(EventEnums.LEAVE_CHAT, onLeaveChat);
      socket.off(EventEnums.DISCONNECTED, onDisconnect);
      socket.off(EventEnums.TYPING, onSocketTyping);
      socket.off(EventEnums.STOP_TYPING, onSocketTypingStop);
      socket.off(EventEnums.MESSAGE_RECEIVED, onMessageReceived);
    };
  }, [socket, chats]);

  return (
    <>
      <ChatHeader
        isSideBar={isSideBar}
        toggleSideBar={toggleSideBar}
        unreadCount={unreadMessages.length}
        loadChats={loadChats}
      />

      <div className="flex ">
        <div
          className={`w-full md:w-1/3 h-[calc(100vh-80px)] border-[2px] border-zinc-400 relative  ${
            isSideBar ? "block" : "md:block hidden"
          }  `}
        >
          <div className="flex bg-zinc-900 items-center">
            <input
              placeholder="Search chat..."
              value={searchChat}
              onChange={(e) => setSearchChat(e.target.value.toLowerCase())}
              className="w-full py-4 bg-transparent px-2 text-white !outline-none placeholder:text-gray-500 md:px-4 md:text-base text-sm "
            />
            <AiOutlineSearch className="mx-2 mr-3 text-2xl" />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-[50%]">
              <FaSpinner className="animate-spin text-3xl" />
            </div>
          ) : (
            <ul className="overflow-y-auto h-[calc(100vh-170px)]">
              {chats
                .filter((chat) =>
                  searchChat
                    ? generateChatMetaData(chat, user)
                        .title?.toLocaleLowerCase()
                        ?.includes(searchChat)
                    : true
                )
                .map((chat, i) => (
                  <li key={i} className="">
                    <ChatMenuCard
                      chat={chat}
                      onClick={onCardClick}
                      isActive={chat._id === currentChat?._id}
                      unreadCount={
                        unreadMessages.filter((msg) => msg.partof === chat._id)
                          .length
                      }
                      onChatDelete={onDeleteChat}
                    />
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div
          className={`w-full md:w-2/3 h-[calc(100vh-80px)]  ${
            !isSideBar ? "block" : "md:block hidden"
          }  `}
        >
          {currentChat?._id ? (
            <>
              <div className="border-b-2 py-2 px-2 h-[70px] flex justify-between items-center">
                <div
                  className={`flex items-center ${
                    currentChat.isGroupChat ? "gap-3" : "gap-2"
                  }`}
                >
                  {currentChat.isGroupChat ? (
                    <div>
                      <div className="relative flex ml-8">
                        {currentChat.participants
                          ?.slice(0, 3)
                          .map((participant, i) => (
                            <img
                              className={`w-11 h-11 rounded-full border-2 border-white -ml-7 top-0 left-0
                                     ${
                                       i === 0
                                         ? "z-30"
                                         : i === 1
                                         ? "z-20"
                                         : i === 2
                                         ? "z-10"
                                         : ""
                                     }
                                  }`}
                              src={participant.avatar.url}
                              key={participant._id}
                            />
                          ))}
                      </div>
                    </div>
                  ) : (
                    <img
                      className="w-12 h-12 rounded-full"
                      src={generateChatMetaData(currentChat, user).avatar}
                      alt="avatar"
                    />
                  )}

                  <p>{generateChatMetaData(currentChat, user).title}</p>
                </div>
              </div>

              {/* Chats */}

              <div className=" relative overflow-y-auto  h-[calc(100vh-220px)] py-3 px-4 flex flex-col-reverse w-full gap-4">
                {msgLoading ? (
                  <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
                    <Typing />
                  </div>
                ) : (
                  <>
                    {isTyping ? <Typing /> : null}
                    {messages?.map((msg) => {
                      return (
                        <MessageCard
                          key={msg._id}
                          isUserMessage={msg?.sender?._id === user?._id}
                          message={msg}
                        />
                      );
                    })}
                  </>
                )}
              </div>

              <div className="w-full p-2 h-[70px] flex items-center justify-center sticky top-full   ">
                <form
                  className="w-full flex items-center gap-1 relative"
                  onSubmit={handleMessageSent}
                >
                  <textarea
                    value={message}
                    onChange={handleMessageTyping}
                    className="resize-none py-3 px-4 outline-none bg-transparent rounded-full w-full scrollbar-hide  text-sm h-12 border-[1.7px] border-zinc-500 focus:border-zinc-300 "
                  />
                  <button type="submit" className=" pl-1 sm:p-2">
                    <IoMdSend className="text-purple-600 text-2xl sm:text-3xl" />
                  </button>
                  <label className=" pl-1 sm:p-2 cursor-pointer">
                    <FaPaperclip className="text-zinc-400 text-xl sm:text-2xl" />

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      max={4}
                      multiple
                      onChange={handleFileChange}
                    />
                  </label>

                  {attachedFiles.length > 0 && (
                    <div className="absolute -top-2 -translate-y-full  bg-zinc-800 p-2 rounded-lg">
                      <div className="grid grid-cols-2 gap-2">
                        {attachedFiles.map((file, i) => (
                          <div key={i} className="relative  rounded-md ">
                            <img
                              src={URL.createObjectURL(file)}
                              className="object-contain w-40 h-40 rounded-md shadow-[0px_0px_1px_1px_#4f4e4e] "
                              alt="attachment"
                            />
                            <button
                              onClick={() => {
                                setAttachedFiles(
                                  attachedFiles.filter((_file, _i) => _i !== i)
                                );
                              }}
                              className=" absolute top-0 right-0 text-xl p-[5px] bg-zinc-800 bg-opacity-60"
                            >
                              <RxCross2 />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </form>
              </div>
              {sendingImages && (
                <div className="absolute top-0 left-0 z-50 w-full p-4 h-[100vh] flex items-center justify-center backdrop-blur-[3px]">
                  <div className="max-w-[300px]  w-full border-2 h-[220px] border-zinc-600 rounded-lg items-center justify-center flex flex-col relative bg-zinc-900 ">
                    <p className="text-center mt-7">
                      Please Wait ... <br /> While we process images
                    </p>
                    <div className="mt-5">
                      <Loader />
                    </div>
                    <div className="">
                      <LoaderTwo />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center px-4 text-center">
              <div className="flex flex-col items-center justify-center gap-4 text-white">
                <div>
                  <BiMessageSquareDetail className="text-5xl" />
                </div>
                <h1 className=" text-2xl sm:text-4xl font-extrabold md:text-4xl">
                  No chats Selected
                </h1>
                <p className="max-w-sm text-xs text-gray-200 md:text-sm">
                  Please Select A Chat
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Chat;
