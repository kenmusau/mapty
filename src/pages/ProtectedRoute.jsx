import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/FakeAuthContex";
import { useEffect } from "react";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    !isAuthenticated && navigate("/");
  }, [isAuthenticated, navigate]);
  return isAuthenticated ? children : null;
}

export default ProtectedRoute;
