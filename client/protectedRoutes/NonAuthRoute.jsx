import { useAuth } from "../src/context/AuthContext";
import { Navigate } from "react-router-dom";

const NonAuthRoute = ({ children }) => {
  const { user, token } = useAuth();

  if (!user?._id || !token) return children;

  return <Navigate to={"/"} />;
};

export default NonAuthRoute;
