import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { handleRequest } from "../utils/handleRequest";
import { forgetPasswordRequest } from "../utils/api";
import toast from "react-hot-toast";

const ForgetPasswordRequest = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await handleRequest(
      async () => await forgetPasswordRequest(email),
      setLoading,
      (res) => {
        toast.success(res.message);
        setSent(true);
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
  };

  return (
    <div className="w-full h-screen flex">
      <div className=" w-0 sm:w-[30%]  md:w-[30%] h-screen bg-gradient-to-r from-violet-500 to-fuchsia-500" />

      {!sent ? (
        <div className="p-6 w-full md:w-[70%]">
          <div className="">
            <h1 className="text-3xl font-['Poppins']">Request Email</h1>
            <p className="italic text-[12px] text-zinc-400">
              We will send you an email to verify its you requesting to reset
              password. Click the button to receive the email
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="my-14 flex w-full max-w-xl  flex-col items-start justify-start gap-4"
          >
            <div className="flex w-full flex-col items-start justify-start gap-2">
              <label className="text-xs text-slate-200">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                autoComplete="off"
                required
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
                  "Send Email"
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
                onClick={() => navigate("/register")}
                className="cursor-pointer font-semibold hover:text-purple-700 hover:underline"
              >
                {" "}
                Login here
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full flex flexc justify-center items-center">
          <div className="flex flex-col items-center gap-5 w-full">
            <h1 className="text-center text-2xl text-purple-500">Success!</h1>
            <h1 className="text-center text-2xl text-purple-500">
              Email Sent Successfully!
            </h1>

            <h3 className="text-center font-light">
              {" "}
              We have sent an email to your registered email address
            </h3>

            <h5 className="text-center font-light text-sm">
              This email contains a link to reset your password. <br /> Please
              check your inbox and follow the instructions to create a new
              password. <br />
              If you don’t see the email, please check your spam or junk folder.
              <br />
              Remember, for your security, this link will expire in{" "}
              <span className="text-purple-500">30 minutes</span>
            </h5>
          </div>

          <p></p>
        </div>
      )}
    </div>
  );
};

export default ForgetPasswordRequest;
