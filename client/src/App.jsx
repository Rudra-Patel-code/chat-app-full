import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthRoute from "../protectedRoutes/AuthRoute";
import NonAuthRoute from "../protectedRoutes/NonAuthRoute";
import { useAuth } from "./context/AuthContext";
import Chat from "./pages/Chat";
import ForgetPasswordRequest from "./pages/ForgetPasswordRequest";
import ResetPassword from "./pages/ResetPassword";
import Typing from "./components/Typing/Typing";
import Loader from "./components/Loader/Loader";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={"/chat"} />} />
        <Route
          path="/login"
          element={
            <NonAuthRoute>
              <Login />
            </NonAuthRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <AuthRoute>
              <Chat />
            </AuthRoute>
          }
        />

        <Route
          path="/register"
          element={
            <NonAuthRoute>
              <Register />
            </NonAuthRoute>
          }
        />

        <Route
          path="/forget-password/request"
          element={
            <NonAuthRoute>
              <ForgetPasswordRequest />
            </NonAuthRoute>
          }
        />
        <Route
          path="/api/v1/users/reset-password/:resetToken"
          element={
            <NonAuthRoute>
              <ResetPassword />
            </NonAuthRoute>
          }
        />

        <Route path="/*" element={<Navigate to={"/"} />} />
      </Routes>
    </>
  );
};

export default App;
