import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaSpinner } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();

  const { login, loading } = useAuth();

  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await login({ username, password });
  };

  return (
    <>
      <div className="w-full h-screen flex">
        <div className=" w-0 sm:w-[30%]  md:w-[30%] h-screen bg-gradient-to-r from-violet-500 to-fuchsia-500" />

        <div className="p-6 w-full md:w-[70%]">
          <div className="">
            <h1 className="text-3xl font-['Poppins']">Login</h1>
            <p className="italic text-[9px] text-zinc-400">
              Login To Access Your Account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="my-14 flex w-full max-w-xl  flex-col items-start justify-start gap-4"
          >
            <div className="flex w-full flex-col items-start justify-start gap-2">
              <label className="text-xs text-slate-200">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a username or email..."
                autoComplete="off"
                required
                className="w-full rounded-md text-xs border-[1px] outline-none border-white focus:border-purple-800 bg-black p-4 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="flex w-full flex-col items-start justify-start gap-2">
              <label className="text-xs text-slate-200">Password</label>
              <input
                placeholder="Enter a password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  "Log in"
                )}

                <p
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate("/forget-password/request");
                  }}
                  className="absolute -bottom-8 left-1 text-sm font-light text-slate-400 hover:underline"
                >
                  Forget Password?
                </p>
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
              Don&apos;t have an account?
              <span
                onClick={() => navigate("/register")}
                className="cursor-pointer font-semibold hover:text-purple-700 hover:underline"
              >
                {" "}
                Create an account
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
