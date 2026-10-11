import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authContext } from "../Context/AuthContext/AuthContext";

const GuestRoute = () => {
  const { token } = useContext(authContext);
  return token ? <Navigate to="/feed" replace /> : <Outlet />;
};

export default GuestRoute;
