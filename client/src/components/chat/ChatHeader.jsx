import { useAuth } from "../../context/AuthContext";
import { CiBellOn } from "react-icons/ci";
import { IoAddCircleOutline } from "react-icons/io5";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaArrowLeft } from "react-icons/fa";
import { useState } from "react";
import AddChatsModal from "../AddChatsModal";

const ChatHeader = ({ isSideBar, toggleSideBar, unreadCount, loadChats }) => {
    const { user } = useAuth();

    const [addingChat, setAddingChat] = useState(false);

    return (
        <>
            <AddChatsModal
                isOpen={addingChat}
                onClose={() => setAddingChat(false)}
                onProceed={loadChats}
            />

            <div className="sticky top-0 z-10 w-full max-w-full flex items-center justify-between border-b-[1px] border-white p-4 text-white h-[80px] ">
                <div className="flex items-center gap-2">
                    <span
                        className=" inline md:hidden cursor-pointer"
                        onClick={toggleSideBar}
                    >
                        {isSideBar ? <FaArrowLeft /> : <RxHamburgerMenu />}
                    </span>

                    <h1>Inbox</h1>
                </div>

                <div className="flex gap-5 md:gap-7 items-center justify-end w-max">
                    <span className="relative">
                        <CiBellOn className="font-bold text-2xl " />
                        {unreadCount > 0 ? (
                            <span className="absolute -top-1 md:-top-2 -right-1 md:-right-2 w-3 h-3  md:h-5 md:w-5 flex items-center justify-center text-sm bg-red-700 p-2 rounded-full">
                                {unreadCount <= 9 ? unreadCount : "9+"}
                            </span>
                        ) : null}
                    </span>
                    <div className=" cursor-pointer border-[1.8px] border-white h-11 w-11 rounded-full">
                        <img
                            src={user?.avatar?.url}
                            alt="avatar"
                            className="h-10 w-10 rounded-full object-cover"
                        />
                    </div>

                    <button
                        onClick={() => setAddingChat(true)}
                        className=" flex items-center gap-1 md:border-[1px] md:border-white md:p-2"
                    >
                        <IoAddCircleOutline className="text-3xl md:text-2xl" />

                        <span className="hidden md:inline">Create</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default ChatHeader;
