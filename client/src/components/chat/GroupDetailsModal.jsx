import { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { MdOutlineExitToApp } from "react-icons/md";

import { handleRequest } from "../../utils/handleRequest";
import { useAuth } from "../../context/AuthContext";

import { MdDeleteForever, MdGroupAdd, MdOutlineGroups } from "react-icons/md";
import { IoPersonRemove } from "react-icons/io5";

import {
  addParticipantInGroup,
  getAvailableUsers,
  getGroupDetails,
  removeParticipantFromGroup,
  renameGroup,
  groupChatDelete,
  leaveFromGroup,
} from "../../utils/api";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";
import MyComboBox from "../MyComboBox";
import ConfirmBox from "../ConfirmBox";

const GroupDetailsModal = ({ isOpen, onClose, chatId, onGroupDelete }) => {
  const { user } = useAuth();

  const [promtModal, setPromtModal] = useState({
    isOpen: false,
    onproceed: null,
    text: null,
  });

  const [isfetchingDetails, setIsFetchingDetails] = useState(false);
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [isAddingParticipantLoading, setIsAddingParticipantLoading] =
    useState(false);
  const [removingLoading, setRemovingLoading] = useState(false);

  const [isRenamingGroup, setIsRemainingGroup] = useState(false);
  const [changingNameLoading, setChangingNameLoading] = useState(false);
  const [deleteGroupLoading, setDeleteGroupLoading] = useState(false);

  const [participantAdded, setParticipantAdded] = useState("");

  const [newGroupName, setNewGroupName] = useState("");

  const [groupDetails, setGroupDetails] = useState(null);

  const [users, setUsers] = useState([]);

  const disableButton =
    isAddingParticipantLoading || removingLoading || deleteGroupLoading;

  const handleNameChange = async () => {
    if (!newGroupName) return alert("Group name is required");

    handleRequest(
      async () => await renameGroup(chatId, newGroupName),
      setChangingNameLoading,
      (res) => {
        const { data, message } = res;
        setGroupDetails(data);
        setNewGroupName(data.name);
        setIsRemainingGroup(false);
        toast.success(message);
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
  };

  const onPromtModalClose = () => {
    setPromtModal({
      isOpen: false,
      onprocees: null,
      text: null,
    });
  };

  const leaveGroup = (chatId) => {
    handleRequest(
      async () => await leaveFromGroup(chatId),
      setDeleteGroupLoading,
      (res) => {
        toast.success(res.message);
        onGroupDelete(chatId);
        onClose();
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
  };

  const loadDetails = async () => {
    await handleRequest(
      async () => await getGroupDetails(chatId),
      setIsFetchingDetails,
      (res) => {
        const { data } = res;
        setGroupDetails(data);
        setNewGroupName(data?.name || "");
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );

    await handleRequest(
      async () => await getAvailableUsers(),
      setIsFetchingDetails,
      (res) => {
        const { data } = res;
        setUsers(data || []);
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
  };

  const addParticipant = async () => {
    if (!setParticipantAdded)
      return toast.error("Please Select a Participant to Add");

    handleRequest(
      async () => await addParticipantInGroup(chatId, participantAdded),
      setIsAddingParticipantLoading,
      (res) => {
        const { data, message } = res;

        const newGroupDetails = {
          ...groupDetails,
          participants: data?.participants || [],
        };

        setGroupDetails(newGroupDetails);

        toast.success(message);
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
  };

  const removeParticipant = async (participantId) => {
    handleRequest(
      async () => await removeParticipantFromGroup(chatId, participantId),
      setRemovingLoading,
      (res) => {
        const { message } = res;
        const newGroupDetails = {
          ...groupDetails,
          participants:
            (groupDetails?.participants &&
              groupDetails?.participants.filter(
                (p) => p._id !== participantId
              )) ||
            [],
        };

        setGroupDetails(newGroupDetails);
        toast.success(message);
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
  };

  const deleteGroupChat = async () => {
    if (groupDetails?.admin !== user?._id)
      return toast.error("You are not the admin of this group");

    handleRequest(
      async () => await groupChatDelete(chatId),
      setDeleteGroupLoading,
      () => {
        onGroupDelete(chatId);
        onClose();
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
  };

  useEffect(() => {
    if (!isOpen) return;

    loadDetails();
  }, [isOpen]);

  return (
    <>
      <div className={`${promtModal.isOpen ? "block" : "hidden"}`}>
        <ConfirmBox
          onProceed={promtModal.onproceed}
          onClose={onPromtModalClose}
          text={promtModal.text}
        />
      </div>

      <div
        className={` z-20 fixed top-0 right-0 bottom-0 left-0 md:w-3/4 bg-opacity-50 ${
          isOpen ? "bg-black" : "hidden"
        } transition-opacity duration-1000 ease-in-out`}
        onClick={onClose}
      >
        <div
          className={`fixed top-0 right-0 bottom-0 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          } transform sm:w-3/4 sm:max-w-[1000px] w-full bg-[#161616] overflow-y-auto transition-all  duration-1000 ease-in-out`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <p className="absolute top-4 left-4">About Group</p>

            <button
              className="absolute text-xl top-4 right-4 hover:text-gray-700 cursor-pointer"
              onClick={onClose}
            >
              <RxCross2 />
            </button>
          </div>

          {isfetchingDetails ? (
            <div className="w-full h-[100%] flex flex-col gap-1 items-center justify-center">
              <FaSpinner className="text-4xl animate-spin" />
              Fetching Details...
            </div>
          ) : (
            <div className="mt-5 p-4">
              <div className="flex justify-center items-center ml-10">
                {groupDetails?.participants.slice(0, 3).map((participant) => (
                  <div key={participant._id} className="w-20 -ml-10 ">
                    <img
                      className="rounded-full"
                      src={participant.avatar.url}
                      alt="avatar"
                    />
                  </div>
                ))}
              </div>

              <div className=" w-full flex flex-col justify-center items-center text-center">
                {isRenamingGroup ? (
                  <div className="w-full flex-wrap flex justify-center items-center mt-5 gap-2">
                    <input
                      type="text"
                      placeholder="Enter New Group Name ..."
                      className="w-full rounded-lg outline-none  border-0 py-3 px-5 bg-zinc-800 text-white font-light placeholder:text-white/70"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                    <div className="flex justify-center gap-5 my-4">
                      <button
                        onClick={handleNameChange}
                        className="w-full text-sm rounded-md bg-purple-600 p-3 text-center font-bold text-zinc-100 shadow-[5px_5px_0px_0px_#4f4e4e] transition-all duration-150 ease-in-out active:translate-x-[5px] active:translate-y-[5px] active:shadow-[0px_0px_0px_0px_#4f4e4e]"
                        disabled={changingNameLoading}
                      >
                        {changingNameLoading ? (
                          <FaSpinner className="animate-spin  " />
                        ) : (
                          "Save"
                        )}
                      </button>

                      <button
                        onClick={() => setIsRemainingGroup(false)}
                        className="w-full rounded-md relative text-sm bg-red-700 p-3 text-center font-bold text-zinc-100 shadow-[5px_5px_0px_0px_#4f4e4e] transition-all duration-150 ease-in-out active:translate-x-[5px] active:translate-y-[5px] active:shadow-[0px_0px_0px_0px_#4f4e4e]"
                        disabled={changingNameLoading}
                      >
                        cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full inline-flex justify-center items-center text-center mt-5">
                    <h1 className=" text-xl sm:text-3xl line-clamp-1">
                      {groupDetails?.name}
                    </h1>
                    {groupDetails?.admin === user?._id ? (
                      <button
                        onClick={() => setIsRemainingGroup(true)}
                        className="p-3 text-lg text-purple-600"
                      >
                        <HiOutlinePencilAlt />
                      </button>
                    ) : null}
                  </div>
                )}

                <div className="w-full flex flex-col justify-center items-center my-4">
                  <div className="w-full flex justify-center items-center border-b-2 py-3 border-dashed border-slate-400 ">
                    <p className="text-sm text-slate-500">
                      {groupDetails?.participants?.length} participants
                    </p>
                  </div>
                  <div className="flex gap-3 items-center justify-center w-full my-3 textsla text-sm">
                    <MdOutlineGroups className="text-xl" /> Group Participants
                  </div>
                </div>
              </div>

              <ul className="max-h-[100vh]  flex flex-col w-full mb-4 overflow-y-auto">
                {groupDetails?.participants?.map((participant) => (
                  <li
                    key={participant._id}
                    className="flex w-full mx-auto max-w-xl items-center justify-start gap-2 py-4 pr-4 border-b-2
                "
                  >
                    <img
                      className="flex h-10 w-10 flex-shrink-0 rounded-full object-cover md:h-14 md:w-14"
                      src={participant.avatar.url}
                      alt="avatar"
                    />
                    <div className="flex flex-col items-start justify-start text-left text-white">
                      <p className="inline-flex items-center text-sm font-semibold md:text-base">
                        {participant.username}
                        <span className="mx-2 text-xs text-purple-600 ">
                          {participant._id === groupDetails.admin && "admin"}
                        </span>
                      </p>
                      <span className="text-xs text-gray-500 md:text-sm">
                        {participant.email}
                      </span>
                    </div>

                    {groupDetails.admin === user._id && (
                      <button
                        onClick={() => {
                          setPromtModal({
                            isOpen: true,
                            onproceed: () =>
                              removeParticipant(participant._id || ""),
                            text: `Are you sure you want to remove ${participant.username} ?`,
                          });
                        }}
                        disabled={disableButton}
                        className="ml-auto rounded-md inline-flex aspect-square items-center self-end bg-red-500 p-3 text-black shadow-[5px_5px_0px_0px_#4f4e4e] transition-all duration-150 ease-in-out active:translate-x-[5px] active:translate-y-[5px] active:shadow-[0px_0px_0px_0px_#4f4e4e]"
                      >
                        {disableButton ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <IoPersonRemove />
                        )}
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              <div className="max-w-md mx-auto flex flex-col gap-4">
                {groupDetails?.admin === user?._id ? (
                  <>
                    {!isAddingParticipant ? (
                      <button
                        onClick={() => setIsAddingParticipant(true)}
                        disabled={disableButton}
                        className="w-full  flex items-center gap-2 rounded-md text-sm bg-purple-600 p-3 text-center  text-zinc-100 shadow-[5px_5px_0px_0px_#4f4e4e] transition-all duration-150 ease-in-out active:translate-x-[5px] active:translate-y-[5px] active:shadow-[0px_0px_0px_0px_#4f4e4e]"
                      >
                        {isAddingParticipantLoading ? (
                          <FaSpinner className="animate-spin mx-auto " />
                        ) : (
                          <>
                            <MdGroupAdd className="text-xl" /> Add Participants
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="w-full flex flex-col justify-start items-center gap-2">
                        <MyComboBox
                          placeholder="Select User to add..."
                          value={participantAdded}
                          options={users.map((user) => ({
                            label: user.username,
                            value: user._id,
                          }))}
                          onChange={({ value }) => {
                            setParticipantAdded(value);
                          }}
                        />

                        <div className="flex gap-5">
                          <button
                            onClick={() => addParticipant()}
                            disabled={disableButton}
                            className="w-20  flex items-center gap-2 rounded-md text-sm bg-purple-700 p-3 text-center  text-zinc-100 shadow-[5px_5px_0px_0px_#4f4e4e] transition-all duration-150 ease-in-out active:translate-x-[5px] active:translate-y-[5px] active:shadow-[0px_0px_0px_0px_#4f4e4e]"
                          >
                            {isAddingParticipantLoading ? (
                              <FaSpinner className="mx-auto animate-spin" />
                            ) : (
                              "+ Add"
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingParticipant(false);
                              setParticipantAdded("");
                            }}
                            disabled={disableButton}
                            className="w-20  flex items-center gap-2 rounded-md text-sm bg-red-700 p-3 text-center  text-zinc-100 shadow-[5px_5px_0px_0px_#4f4e4e] transition-all duration-150 ease-in-out active:translate-x-[5px] active:translate-y-[5px] active:shadow-[0px_0px_0px_0px_#4f4e4e]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setPromtModal({
                        isOpen: true,
                        onproceed: () => leaveGroup(chatId),
                        text: "Confirm to Leave the Group",
                      });
                    }}
                    disabled={disableButton}
                    className="w-full  flex items-center gap-2 rounded-md text-sm bg-red-700 p-3 text-center  text-white-100 shadow-[5px_5px_0px_0px_#4f4e4e] transition-all duration-150 ease-in-out active:translate-x-[5px] active:translate-y-[5px] active:shadow-[0px_0px_0px_0px_#4f4e4e]"
                  >
                    {deleteGroupLoading ? (
                      <FaSpinner className="animate-spin mx-auto" />
                    ) : (
                      <>
                        <MdOutlineExitToApp className="text-xl" /> Leave Group
                      </>
                    )}
                  </button>
                )}

                {groupDetails?.admin === user._id && (
                  <button
                    onClick={() => {
                      setPromtModal({
                        isOpen: true,
                        onproceed: () => deleteGroupChat(),
                        text: "Are you sure you want to delete this group",
                      });
                    }}
                    disabled={disableButton}
                    className="w-full flex items-center gap-2 rounded-md text-sm bg-red-700 p-3 text-center  text-zinc-100 shadow-[5px_5px_0px_0px_#4f4e4e] transition-all duration-150 ease-in-out active:translate-x-[5px] active:translate-y-[5px] active:shadow-[0px_0px_0px_0px_#4f4e4e]"
                  >
                    {deleteGroupLoading ? (
                      <FaSpinner className="animate-spin mx-auto" />
                    ) : (
                      <>
                        <MdDeleteForever className="text-xl" /> Delete Group
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GroupDetailsModal;
