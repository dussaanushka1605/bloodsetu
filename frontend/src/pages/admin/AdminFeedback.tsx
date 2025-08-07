import React from 'react';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminFeedbackDashboard from '@/components/admin/AdminFeedbackDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminFeedback: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  // Redirect if non-admin tries to access this page
  if (user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Feedback Management</h1>
          <AdminFeedbackDashboard />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminFeedback;