import { useState } from "react";
import { FaEllipsisV, FaLeaf, FaPaperclip, FaSpinner } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { generateChatMetaData } from "../../utils/helper";
import { MdDelete } from "react-icons/md";

import { FiInfo } from "react-icons/fi";

import moment from "moment";
import GroupDetailsModal from "./GroupDetailsModal";
import ConfirmBox from "../ConfirmBox";
import { handleRequest } from "../../utils/handleRequest";
import { deleteOneOnOneChat } from "../../utils/api";

const ChatMenuCard = ({
  chat,
  onClick,
  isActive,
  onChatDelete,
  unreadCount,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [isGroupModal, setIsGroupModal] = useState(false);
  const [deletingChatLoading, setDeletingGroupLoading] = useState(false);
  const { user } = useAuth();

  const [promtModal, setPromtModal] = useState({
    isOpen: false,
    onproceed: null,
    text: null,
  });

  const deleteChat = async () => {
    await handleRequest(
      async () => await deleteOneOnOneChat(chat._id),
      setDeletingGroupLoading,
      () => {
        onChatDelete(chat?._id);
      }
    );
  };

  const metaData = generateChatMetaData(chat, user);

  const onPromtModalClose = () => {
    setPromtModal({
      isOpen: false,
      onprocees: null,
      text: null,
    });
  };

  return (
    <>
      <div className={`${promtModal.isOpen ? "block" : "hidden"}`}>
        <ConfirmBox
          onProceed={promtModal.onproceed}
          onClose={onPromtModalClose}
          text={promtModal.text}
        />
      </div>

      <GroupDetailsModal
        isOpen={isGroupModal}
        onClose={() => setIsGroupModal(false)}
        chatId={chat._id}
        onGroupDelete={onChatDelete}
      />

      <div
        role="button"
        onClick={() => onClick(chat)}
        className={` max-w-[100vw] group  cursor-pointer py-3 md:px-2  ${
          isActive && "bg-zinc-800"
        } flex items-center justify-start  hover:bg-zinc-800`}
        onMouseLeave={() => {
          setOpenModal(false);
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenModal(true);
          }}
          className="self-center p-1 relative"
        >
          <FaEllipsisV className="h-5 group-hover:w-6 group-hover:opacity-100 w-0 opacity-0 transition-all ease-in-out duration-100 text-zinc-500" />

          <div
            className={`z-20 absolute bottom-0 translate-y-full text-sm w-max bg-zinc-900 rounded-xl p-2 shadow-md border-[1px] ${
              openModal ? "block" : "hidden"
            } `}
          >
            {chat.isGroupChat ? (
              <>
                <p
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsGroupModal(true);
                    setOpenModal(false);
                  }}
                  className="flex items-center gap-2 hover:bg-zinc-700 py-2 px-1 hover:rounded-md "
                >
                  <FiInfo /> About Group
                </p>
              </>
            ) : (
              <p
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPromtModal({
                    isOpen: true,
                    onproceed: () => deleteChat(),
                    text: "Are you sure you want to delete this chat",
                  });
                }}
                disabled={deletingChatLoading}
                className="flex items-center gap-2 hover:bg-red-700 hover:text-white transition-all text-red-500 py-2 px-1 hover:rounded-md "
              >
                <MdDelete /> Delete Chat
              </p>
            )}
          </div>
        </button>

        <div className=" flex justify-center items-center flex-shrink-0 mr-2">
          {chat.isGroupChat ? (
            <div className=" w-12 h-12 flex items-center justify-start relative ">
              {chat.participants.slice(0, 3).map((participant, i) => (
                <img
                  src={participant.avatar.url}
                  key={participant._id}
                  className={`rounded-full absolute w-11  h-11 ${
                    i === 0
                      ? "left-0 z-[3]"
                      : i === 1
                      ? "left-2 z-[2]"
                      : i === 2
                      ? "left-4 z-[1]"
                      : ""
                  }`}
                />
              ))}
            </div>
          ) : (
            <img src={metaData.avatar} className="w-11 h-11 rounded-full" />
          )}
        </div>

        <div className=" w-full  pl-2">
          <p className="line-clamp-1">{metaData.title}</p>

          <div className="flex gap-2 items-center ">
            {chat.lastMessage && chat.lastMessage?.attachments?.length > 0 ? (
              <FaPaperclip className="text-white/50" />
            ) : null}

            <small className="line-clamp-1  text-white/50">
              {metaData.lastMessage.substring(0, 20)}...
            </small>
          </div>
        </div>

        <div className=" flex flex-col items-center flex-shrink-0 pr-1">
          <small className="text-slate-400 text-sm">
            {moment(chat.updatedAt).add("TIME_ZONE", "hours").fromNow(true)}
          </small>

          {unreadCount > 0 ? (
            <span className="h-5 w-5 text-center flex items-center justify-center text-sm bg-purple-600 rounded-full">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default ChatMenuCard;
