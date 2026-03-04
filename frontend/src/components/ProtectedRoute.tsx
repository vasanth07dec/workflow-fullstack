import { Navigate, Outlet } from "react-router-dom";

/**
 * Component - ProtectedRoute
 * centralized file that check user info exist or not and protect
 * 
 * @returns ProtectedRoute logic
 */
const ProtectedRoute = () => {
  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;