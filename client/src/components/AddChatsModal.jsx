import { Switch } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import MyComboBox from "./MyComboBox";
import { handleRequest } from "../utils/handleRequest";
import { MdOutlineGroups } from "react-icons/md";

import {
  createGroupChat,
  createOneOnOneChat,
  getAvailableUsers,
} from "../utils/api";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";

const AddChatsModal = ({ isOpen, onClose, onProceed }) => {
  const [users, setUsers] = useState([]);
  const [groupName, setGroupName] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupParticipants, setGroupParticipants] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    onClose();
  };

  const getUsers = async () => {
    handleRequest(
      async () => await getAvailableUsers(),
      setIsLoading,
      (res) => {
        const { data } = res;

        setUsers(data || []);
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
  };

  const createOneOnOneChatHandler = async () => {
    if (!selectedUserId) return toast.error("Please select a user");

    await handleRequest(
      async () => await createOneOnOneChat(selectedUserId),
      setCreatingChat,
      (res) => {
        const { data } = res;

        if (res.statusCode === 200) {
          console.log("already created");
          toast.error("Chat with User already exists");
          return;
        }

        onProceed(data);
        handleClose();
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
  };

  const createNewGroupChat = async () => {
    if (!groupName) return toast.error("Please Enter a Group Name");

    if (!groupParticipants.length || groupParticipants.length < 2)
      return toast.error("There must be at least 2 group participants");

    await handleRequest(
      async () =>
        await createGroupChat({
          name: groupName,
          participants: groupParticipants,
        }),
      setCreatingChat,
      (res) => {
        const { data, message } = res;
        onProceed(data);
        console.log(message);
        toast.success(message);
        handleClose();
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
  };

  useEffect(() => {
    if (!open) return;

    getUsers();
  }, [isOpen]);

  return (
    <div
      className={`z-30 ${
        isOpen ? "block" : "hidden"
      } absolute inset-0 flex justify-center backdrop-blur-sm  items-center p-4 sm:p-7 `}
    >
      <div className="rounded-lg p-4 w-full max-w-lg relative bg-zinc-900 border-white shadow-[0px_0px_5px_5px_#4f4e4e]">
        <div className="flex justify-between">
          <p>Create Chat</p>

          <button onClick={handleClose}>
            <RxCross2 className="text-2xl" />
          </button>
        </div>

        {!isLoading ? (
          <>
            <div>
              <Switch.Group
                as={"div"}
                className={"my-4 flex items-center gap-4"}
              >
                <Switch.Label>
                  <span className={`${isGroupChat ? "" : "opacity-30"}`}>
                    Is it a group chat?
                  </span>
                </Switch.Label>
                <Switch
                  checked={isGroupChat}
                  onChange={setIsGroupChat}
                  as={Fragment}
                >
                  {({ checked }) => (
                    /* Use the `checked` state to conditionally style the button. */
                    <button
                      className={`${
                        checked ? "bg-purple-700" : "bg-zinc-700"
                      } relative inline-flex h-6 w-11 items-center rounded-full`}
                    >
                      <span className="sr-only">Enable notifications</span>
                      <span
                        className={`${
                          checked ? "translate-x-6" : "translate-x-1"
                        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                      />
                    </button>
                  )}
                </Switch>
              </Switch.Group>
            </div>

            {isGroupChat ? (
              <div className="my-4">
                <input
                  type="text"
                  value={groupName}
                  className="block w-full rounded-lg outline-none py-3 px-5 bg-zinc-800 text-white font-light placeholder:text-white/70"
                  placeholder="Enter Group Name ..."
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
            ) : null}

            <div className="my-4">
              <MyComboBox
                placeholder={
                  isGroupChat
                    ? "Select Group Participants"
                    : "Select a user to chat"
                }
                value={isGroupChat ? "" : selectedUserId || ""}
                options={users.map((user) => {
                  return {
                    label: user.username,
                    value: user._id,
                  };
                })}
                onChange={({ value }) => {
                  if (isGroupChat && !groupParticipants.includes(value)) {
                    setGroupParticipants([...groupParticipants, value]);
                  } else {
                    setSelectedUserId(value);
                  }
                }}
              />
            </div>

            {isGroupChat && (
              <div className="my-5">
                <span className="font-light text-[15px] sm:text-base text-white inline-flex items-center gap-2">
                  <MdOutlineGroups className="text-xl" /> Selected Particpants
                </span>

                <div className="flex justify-start items-center flex-wrap gap-2 mt-3">
                  {users
                    .filter((user) => groupParticipants.includes(user._id))
                    ?.map((participant) => (
                      <div
                        className="inline-flex bg-zinc-800 p-2 rounded-full items-center gap-2"
                        key={participant._id}
                      >
                        <img
                          src={participant.avatar.url}
                          alt="avatar"
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        <p className="text-white">{participant.username}</p>
                        <button
                          onClick={() => {
                            setGroupParticipants(
                              groupParticipants.filter(
                                (p) => p !== participant._id
                              )
                            );
                          }}
                        >
                          <RxCross2 className="h-6 w-6 hover:text-purple-600" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
            <div
              className="mt-3"
              onClick={
                isGroupChat ? createNewGroupChat : createOneOnOneChatHandler
              }
            >
              <button
                disabled={creatingChat}
                className="w-full  rounded-md text-sm sm:text-base bg-purple-700 p-3 text-center  text-zinc-100 shadow-[5px_5px_0px_0px_#4f4e4e] transition-all duration-150 ease-in-out active:translate-x-[5px] active:translate-y-[5px] active:shadow-[0px_0px_0px_0px_#4f4e4e]"
              >
                {creatingChat ? (
                  <FaSpinner className="mx-auto sm:text-xl animate-spin" />
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-60 flex flex-col gap-1 items-center justify-center">
            <FaSpinner className="text-4xl animate-spin" />
            Fetching Details...
          </div>
        )}
      </div>
    </div>
  );
};

export default AddChatsModal;
