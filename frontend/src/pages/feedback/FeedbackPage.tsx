import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import FeedbackHistory from '@/components/feedback/FeedbackHistory';
import FeedbackResponses from '@/components/feedback/FeedbackResponses';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const FeedbackPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('submit');
  const { user, isAuthenticated } = useAuth();
  
  console.log('FeedbackPage rendered with user:', user ? {
    _id: user._id,
    role: user.role,
    token: user.token ? `${user.token.substring(0, 10)}...` : 'missing',
    isVerified: user.isVerified
  } : 'no user');

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  // Redirect if admin tries to access this page
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" />;
  }

  const handleFeedbackSubmitted = () => {
    // Switch to history tab after successful submission
    setActiveTab('history');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-2xl">Feedback Center</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
                    <TabsTrigger value="history">View History</TabsTrigger>
                    <TabsTrigger value="responses">View Responses</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="submit">
                    <FeedbackForm onSubmitSuccess={handleFeedbackSubmitted} />
                  </TabsContent>
                  
                  <TabsContent value="history">
                    <FeedbackHistory />
                  </TabsContent>
                  
                  <TabsContent value="responses">
                    <FeedbackResponses />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FeedbackPage;