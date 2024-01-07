import { useState } from "react";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { handleRequest } from "../utils/handleRequest";
import { resetPassword } from "../utils/api";

const ResetPassword = () => {
  const { resetToken } = useParams();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPass)
      return toast.success("Password and Confirm Password do not match");

    await handleRequest(
      async () => await resetPassword(resetToken, password),
      setLoading,
      (res) => {
        toast.success(res.message);
        navigate("/login");
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
  };

  return (
    <>
      <div className="w-full h-screen flex">
        <div className=" w-0 sm:w-[30%]  md:w-[30%] h-screen bg-gradient-to-r from-violet-500 to-fuchsia-500" />

        <div className="p-6 w-full md:w-[70%]">
          <div className="">
            <h1 className="text-3xl font-['Poppins']">Reset Password</h1>
            <p className="italic text-[12px] text-zinc-400">
              Please Enter New Password. And Do remember it this time
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="my-14 flex w-full max-w-xl  flex-col items-start justify-start gap-4"
          >
            <div className="flex w-full flex-col items-start justify-start gap-2">
              <label className="text-xs text-slate-200">New Password</label>
              <input
                placeholder="Enter new password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                autoComplete="off"
                className="w-full rounded-md text-xs border-[1px] outline-none border-white focus:border-purple-800 bg-black p-4 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="flex w-full flex-col items-start justify-start gap-2">
              <label className="text-xs text-slate-200">Confirm Password</label>
              <input
                placeholder="Confirm Password..."
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                type="password"
                required
                autoComplete="off"
                className="w-full rounded-md text-xs border-[1px] outline-none border-white focus:border-purple-800 bg-black p-4 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="w-full">
              <button
                type="submit"
                disabled={loading}
                className="w-full relative text-sm bg-purple-500 p-3 text-center font-bold text-zinc-100 shadow-[5px_5px_0px_0px_#4f4e4e] transition-all duration-150 ease-in-out active:translate-x-[5px] active:translate-y-[5px] active:shadow-[0px_0px_0px_0px_#4f4e4e]"
              >
                {loading ? (
                  <FaSpinner className="animate-spin mx-auto text-lg" />
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </form>

          <div className="flex justify-center max-w-xl w-full gap-2 items-center text-zinc-400 ">
            <hr className="w-full border-[1px] border-zinc-400" />
            <p className="text-xs">OR</p>
            <hr className="w-full  border-[1px] border-zinc-400" />
          </div>
          <div className="mt-5">
            <p className="text-xs font-light text-white">
              Already Registered ?
              <span
                onClick={() => navigate("/login")}
                className="cursor-pointer font-semibold hover:text-purple-700 hover:underline"
              >
                {" "}
                Login here
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
