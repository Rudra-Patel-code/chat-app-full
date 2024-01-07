const ConfirmBox = ({ onProceed, onClose, text }) => {
  return (
    <div className="absolute inset-0 z-30 flex justify-center items-center backdrop-blur-sm p-7">
      <div className="w-full justify-center items-center shadow-lg max-w-md p-4 rounded-xl bg-zinc-900 border-[1.5px] flex flex-col gap-4 ">
        <p>{text}</p>

        <div className="flex justify-around w-full">
          <button
            onClick={() => {
              onClose();
              onProceed();
            }}
            className="rounded-md inline-flex items-center self-end bg-purple-600 py-2 px-4  text-white shadow-[5px_5px_0px_0px_#4f4e4e] transition-all duration-150 ease-in-out active:translate-x-[5px] active:translate-y-[5px] active:shadow-[0px_0px_0px_0px_#4f4e4e] text-sm"
          >
            OK
          </button>

          <button
            onClick={onClose}
            className=" rounded-md inline-flex items-center self-end bg-red-500 py-2 px-4  text-black shadow-[5px_5px_0px_0px_#4f4e4e] transition-all duration-150 ease-in-out active:translate-x-[5px] active:translate-y-[5px] active:shadow-[0px_0px_0px_0px_#4f4e4e] text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBox;
