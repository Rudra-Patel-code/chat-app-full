import { createContext, useContext, useEffect, useState } from "react";
import LocalStorage from "../utils/LocalStorage";
import { handleRequest } from "../utils/handleRequest";
import { loginUser, logoutUser, registerUser } from "../utils/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext({
  user: null,
  token: null,
  loading: false,
  fullLoading: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [fullLoading, setFullLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const navigate = useNavigate();

  const login = async ({ username, password }) => {
    handleRequest(
      async () => await loginUser({ username, password }),
      setLoading,
      (res) => {
        const { data } = res;
        setUser(data.user);
        setToken(data.accessToken);
        LocalStorage.set("user", data.user);
        
        LocalStorage.set("accessToken", data.accessToken);
        toast.success(res.message);

        navigate("/chat");
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
  };

  const register = async (formData) => {
    handleRequest(
      async () => await registerUser(formData),
      setLoading,
      (res) => {
        const { data } = res;
        setUser(data.user);
        setToken(data.accessToken);
        LocalStorage.set("user", data.user);
        LocalStorage.set("accessToken", data.accessToken);
        toast.success(res.message);
        navigate("/chat");
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
  };

  const logout = async () => {
    handleRequest(
      async () => await logoutUser(),
      setLoading,
      (res) => {
        setUser(null);
        setToken(null);
        LocalStorage.clear();
        toast.success(res.message);
        navigate("/login");
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
  };

  useEffect(() => {
    setFullLoading(true);
    const _token = LocalStorage.get("accessToken");
    const _user = LocalStorage.get("user");
    if (_token && _user?._id) {
      setUser(_user);
      setToken(_token);
    }
    setFullLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, token, loading }}
    >
      {!fullLoading ? (
        children
      ) : (
        <div>
          <h1>Loading .. </h1>
        </div>
      )}
    </AuthContext.Provider>
  );
};
