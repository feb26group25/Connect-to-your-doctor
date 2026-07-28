import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}