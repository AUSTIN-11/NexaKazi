import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useEffect } from "react";

function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  const isTokenExpired = useAuthStore((state) => state.isTokenExpired());
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  useEffect(() => {
    // Check if token is expired on route change
    if (token && isTokenExpired()) {
      logout();
    }
  }, [token, isTokenExpired, logout]);

  if (!token || isTokenExpired()) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ 
          from: location.pathname,
          message: token ? "Your session has expired. Please log in again." : "Please log in first."
        }} 
      />
    );
  }

  return children;
}

export default ProtectedRoute;
