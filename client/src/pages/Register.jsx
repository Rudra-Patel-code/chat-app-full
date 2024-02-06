import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlinePlus } from "react-icons/ai";
import { FaSpinner } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Register = () => {
    const navigate = useNavigate();
    const { register, loading } = useAuth();

    const [image, setImage] = useState("");
    const [imgPrev, setImgPrev] = useState("");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [confirmPass, setConfirmPass] = useState("");

    const changeImageHandler = (e) => {
        const file = e.target.files[0];

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onloadend = () => {
            setImgPrev(reader.result);
            setImage(file);
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.toString() !== confirmPass.toString()) {
            return toast.error("Password and Confirm Password Does Not Match");
        }

        const myFormData = new FormData();

        myFormData.append("username", username);
        myFormData.append("password", password);
        myFormData.append("confirmPassword", confirmPass);
        myFormData.append("email", email);
        myFormData.append("file", image);

        await register(myFormData);
    };

    return (
        <>
            <div className="w-full h-screen flex">
                <div className=" w-0 sm:w-[30%]  md:w-[30%] h-screen bg-gradient-to-r from-violet-500 to-fuchsia-500" />

                <div className="p-6 w-full md:w-[70%] overflow-y-auto ">
                    <div className="">
                        <h1 className="text-3xl font-['Poppins']">Register</h1>
                        <p className="italic text-[9px] text-zinc-400">
                            Please create your account in order to chat
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        autoComplete="off"
                        className="my-14 flex w-full max-w-xl  flex-col items-start justify-start gap-4"
                    >
                        <div className=" w-full items-center">
                            <label
                                htmlFor="avatar-input"
                                className="flex justify-center"
                            >
                                {imgPrev ? (
                                    <div className="border-[1px] border-purple-500 w-24 h-24 flex rounded-full ">
                                        <img
                                            src={imgPrev}
                                            alt="avatar"
                                            className="w-full h-full rounded-full "
                                        />
                                    </div>
                                ) : (
                                    <div className="border-[1px] border-purple-500 w-20 h-20 flex justify-center items-center rounded-full">
                                        <AiOutlinePlus className="text-xl" />
                                    </div>
                                )}
                            </label>
                            <input
                                onChange={changeImageHandler}
                                accept="image/*"
                                type="file"
                                id="avatar-input"
                                hidden
                            />
                        </div>

                        <div className="flex w-full flex-col items-start justify-start gap-2">
                            <label className="text-xs text-slate-200">
                                Username
                            </label>
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
                            <label className="text-xs text-slate-200">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter a username or email..."
                                autoComplete="off"
                                className="w-full rounded-md text-xs border-[1px] outline-none border-white focus:border-purple-800 bg-black p-4 text-white placeholder:text-gray-500"
                            />
                        </div>
                        <div className="flex w-full flex-col items-start justify-start gap-2">
                            <label className="text-xs text-slate-200">
                                Password
                            </label>
                            <input
                                placeholder="Enter a password..."
                                type="password"
                                value={password}
                                required
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="off"
                                className="w-full rounded-md text-xs border-[1px] outline-none border-white focus:border-purple-800 bg-black p-4 text-white placeholder:text-gray-500"
                            />
                        </div>

                        <div className="flex w-full flex-col items-start justify-start gap-2">
                            <label className="text-xs text-slate-200">
                                Confirm Password
                            </label>
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
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full text-sm bg-purple-500 p-3 text-center font-bold text-zinc-100 shadow-[5px_5px_0px_0px_#4f4e4e] transition-all duration-150 ease-in-out active:translate-x-[5px] active:translate-y-[5px] active:shadow-[0px_0px_0px_0px_#4f4e4e]"
                        >
                            {loading ? (
                                <FaSpinner className="animate-spin mx-auto text-lg" />
                            ) : (
                                "Register"
                            )}
                        </button>
                    </form>

                    <div className="flex justify-center max-w-xl w-full gap-2 items-center text-zinc-400 ">
                        <hr className="w-full border-[1px] border-zinc-400" />
                        <p className="text-xs">OR</p>
                        <hr className="w-full  border-[1px] border-zinc-400" />
                    </div>
                    <div className="mt-5">
                        <p className="text-xs font-light text-white">
                            Already have an account?
                            <span
                                onClick={() => navigate("/login")}
                                className="cursor-pointer font-semibold hover:text-purple-700 hover:underline"
                            >
                                {" "}
                                Login Here
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;
