import { useAuth } from "../src/context/AuthContext";
import { Navigate } from "react-router-dom";

const AuthRoute = ({ children }) => {
  const { user, token } = useAuth();

  if (user?._id && token) return children;

  return <Navigate to={"/login"} />;
};

export default AuthRoute;
