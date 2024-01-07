import moment from "moment";
import axios from "axios";
import { FaRegArrowAltCircleDown } from "react-icons/fa";

const MessageCard = ({ isUserMessage, isGroupChatMessage, message }) => {
  return (
    <>
      <div className={`relative`}>
        <div
          className={`flex min-w-[150px] max-w-[80%] items-start justify-start gap-2 text-white md:max-w-[70%] ${
            isUserMessage ? "ml-auto flex-row-reverse " : "mr-auto"
          }`}
        >
          <img
            className="flex aspect-square  h-7 w-7 flex-shrink-0 rounded-full object-cover md:h-10 md:w-10"
            src={message.sender?.avatar?.url}
            alt="avatar"
          />
          <div
            className={`flex w-full flex-col gap-1 md:gap-2 ${
              isUserMessage && "items-end justify-end "
            }`}
          >
            <p
              className={`text-[10px] md:text-xs flex ${
                isUserMessage && "flex-row-reverse gap-3"
              } `}
            >
              {message.sender?.username}
              <span className="ml-2 text-gray-400">
                {" "}
                {moment(message?.updatedAt)
                  .add("TIME_ZONE", "hours")
                  .fromNow(true)}{" "}
                ago
              </span>
            </p>
            <div
              className={`relative max-w-full p-3 text-xs after:absolute after:top-0 after:border-t-[15px] after:border-t-[#121212]  md:text-sm ${
                isUserMessage ? "bg-purple-600" : "bg-zinc-600"
              } after:left-0 after:border-r-[15px] after:border-r-transparent whitespace-normal break-words`}
            >
              {message?.content}
            </div>
          </div>
        </div>

        {message.attachments.length > 0 ? (
          <div
            className={`max-w-[85%] w-fit ${isUserMessage && "ml-auto"} mt-2 `}
          >
            <div className="grid grid-cols-2 gap-2">
              {message.attachments.slice(0, 3).map((file) => (
                <div
                  key={file._id}
                  className="border-[1px] relative rounded-md max-w-[200px] min-h-[100px] flex items-center box-content"
                >
                  <img
                    src={file.url}
                    alt="attachment"
                    className="w-full object-contain rounded-md max-w-[200px]"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default MessageCard;
