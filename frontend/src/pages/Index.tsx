
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on user role
      if (user?.role === 'donor') {
        navigate("/donor/dashboard");
      } else if (user?.role === 'hospital') {
        navigate("/hospital/dashboard");
      } else if (user?.role === 'admin') {
        navigate("/admin/dashboard");
      }
    } else {
      // Redirect to landing page if not authenticated
      navigate("/");
    }
  }, [navigate, user, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Redirecting...</h1>
        <p className="text-xl text-gray-600">Please wait while we redirect you to the appropriate page.</p>
      </div>
    </div>
  );
};

export default Index;
