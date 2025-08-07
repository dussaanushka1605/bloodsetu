import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Contexts
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";

// Page components
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Donor pages
import DonorDashboard from "./pages/donor/DonorDashboard";
import DonorProfile from "./pages/donor/DonorProfile";
import DonorRequests from "./pages/donor/DonorRequests";
import FindHospitals from "./pages/donor/FindHospitals";
import DonorBloodCamps from "./pages/donor/DonorBloodCamps";

// Feedback pages
import FeedbackPage from "./pages/feedback/FeedbackPage";

// Hospital pages
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import HospitalProfilePage from "./pages/hospital/HospitalProfilePage";
import NewRequest from "./pages/hospital/NewRequest";
import BloodCamps from "./pages/hospital/BloodCamps";
import FindDonors from "./pages/hospital/FindDonors";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageDonors from "./pages/admin/ManageDonors";
import ManageHospitals from "./pages/admin/ManageHospitals";
import HospitalDetail from "./pages/admin/HospitalDetail";
import AdminFeedback from "./pages/admin/AdminFeedback";
import RequestDetails from "./pages/admin/RequestDetails";
import AdminBloodCamps from "./pages/admin/AdminBloodCamps";

// Route protection
import { ReactNode } from "react";

const queryClient = new QueryClient();

// Protected Route component for role-based access
const ProtectedRoute = ({ 
  children, 
  allowedRole
}: { 
  children: ReactNode;
  allowedRole: 'donor' | 'hospital' | 'admin' | null;
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blood-600"></div>
      </div>
    );
  }
  
  // Check if the current path matches the role we're trying to access
  const path = window.location.pathname;
  const roleFromPath = path.includes('/donor') ? 'donor' : 
                      path.includes('/hospital') ? 'hospital' : 
                      path.includes('/admin') ? 'admin' : null;
  
  // Check if we have a user for the current role path
  const roleSpecificUser = roleFromPath ? 
    JSON.parse(localStorage.getItem(`user_${roleFromPath}`) || 'null') : null;
  
  // If we're on a role-specific path but don't have a matching user, redirect to login
  if (roleFromPath && !roleSpecificUser) {
    return <Navigate to="/login" replace />;
  }
  
  // If we have a role-specific user but it doesn't match the current user in context,
  // update the context with the role-specific user
  if (roleSpecificUser && (!user || user.role !== roleSpecificUser.role)) {
    // This will be handled by the useEffect in AuthContext
    // Just render a loading state until the context updates
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blood-600"></div>
      </div>
    );
  }
  
  // Hospital Verification Check (Simplified)
  // Checks if the route requires 'hospital' role AND the logged-in user IS a hospital AND they are NOT verified.
  if (allowedRole === 'hospital' && roleSpecificUser && roleSpecificUser.role === 'hospital' && !roleSpecificUser.isVerified) {
    // If not verified, only allow access to the main dashboard page.
    if (window.location.pathname !== '/hospital/dashboard') {
      console.log("Redirecting unverified hospital from", window.location.pathname, "to dashboard.");
      // Optional: toast.info("Your account requires verification for full access.");
      return <Navigate to="/hospital/dashboard" replace />;
    }
  }
  
  // If all checks pass, render the requested component
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Donor routes */}
      <Route path="/donor/dashboard" element={
        <ProtectedRoute allowedRole="donor">
          <DonorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/donor/profile" element={
        <ProtectedRoute allowedRole="donor">
          <DonorProfile />
        </ProtectedRoute>
      } />
      <Route path="/donor/requests" element={
        <ProtectedRoute allowedRole="donor">
          <DonorRequests />
        </ProtectedRoute>
      } />
      <Route path="/donor/hospitals" element={
        <ProtectedRoute allowedRole="donor">
          <FindHospitals />
        </ProtectedRoute>
      } />
      <Route path="/donor/camps" element={
        <ProtectedRoute allowedRole="donor">
          <DonorBloodCamps />
        </ProtectedRoute>
      } />
      <Route path="/donor/feedback" element={
        <ProtectedRoute allowedRole="donor">
          <FeedbackPage />
        </ProtectedRoute>
      } />
      
      {/* Hospital routes */}
      <Route path="/hospital/dashboard" element={
        <ProtectedRoute allowedRole="hospital">
          <HospitalDashboard />
        </ProtectedRoute>
      } />
      <Route path="/hospital/profile" element={
        <ProtectedRoute allowedRole="hospital">
          <HospitalProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/hospital/requests/new" element={
        <ProtectedRoute allowedRole="hospital">
          <NewRequest />
        </ProtectedRoute>
      } />

      <Route path="/hospital/camps" element={
        <ProtectedRoute allowedRole="hospital">
          <BloodCamps />
        </ProtectedRoute>
      } />
      <Route path="/hospital/find-donors" element={
        <ProtectedRoute allowedRole="hospital">
          <FindDonors />
        </ProtectedRoute>
      } />
      <Route path="/hospital/feedback" element={
        <ProtectedRoute allowedRole="hospital">
          <FeedbackPage />
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/donors" element={
        <ProtectedRoute allowedRole="admin">
          <ManageDonors />
        </ProtectedRoute>
      } />
      <Route path="/admin/hospitals" element={
        <ProtectedRoute allowedRole="admin">
          <ManageHospitals />
        </ProtectedRoute>
      } />
      <Route path="/admin/hospitals/:id" element={
        <ProtectedRoute allowedRole="admin">
          <HospitalDetail />
        </ProtectedRoute>
      } />
      <Route path="/admin/feedback" element={
        <ProtectedRoute allowedRole="admin">
          <AdminFeedback />
        </ProtectedRoute>
      } />
      <Route path="/admin/camps" element={
        <ProtectedRoute allowedRole="admin">
          <AdminBloodCamps />
        </ProtectedRoute>
      } />
      <Route path="/admin/requests/:id" element={
        <ProtectedRoute allowedRole="admin">
          <RequestDetails />
        </ProtectedRoute>
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
