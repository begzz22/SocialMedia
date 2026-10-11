import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authContext } from "../Context/AuthContext/AuthContext";

const ProtectedRoute = () => {
  const { token } = useContext(authContext);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
