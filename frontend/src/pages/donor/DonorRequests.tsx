import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BloodRequestCard from '@/components/BloodRequestCard';
import { AlertTriangle } from 'lucide-react';
import { BloodRequest } from '@/types/bloodTypes';

const DonorRequests: React.FC = () => {
  const { user } = useAuth();
  const { getDonorById, getRequestsByDonor, updateBloodRequestStatus, getBloodRequests } = useData();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('available');
  
  // Fetch blood requests when component mounts
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        await getBloodRequests();
      } catch (error) {
        console.error('Error fetching blood requests:', error);
        toast.error('Failed to fetch blood requests');
      }
    };
    fetchRequests();
  }, [getBloodRequests]);
  
  const donor = getDonorById(user?._id || '');
  
  const pendingRequests = getRequestsByDonor(user?._id || '', 'pending');
  const acceptedRequests = getRequestsByDonor(user?._id || '', 'accepted');
  const completedRequests = getRequestsByDonor(user?._id || '', 'completed');
  
  const handleAcceptRequest = async (requestId: string) => {
    try {
      await updateBloodRequestStatus(requestId, 'accepted');
      toast.success('You have accepted the blood donation request');
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };
  
  const handleCompleteRequest = async (requestId: string) => {
    try {
      await updateBloodRequestStatus(requestId, 'completed');
      toast.success('Thank you for your donation!');
    } catch (error) {
      console.error('Error completing request:', error);
      toast.error('Failed to complete request');
    }
  };
  
  const handleCancelRequest = async (requestId: string) => {
    try {
      await updateBloodRequestStatus(requestId, 'cancelled');
      toast.info('Request has been cancelled');
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error('Failed to cancel request');
    }
  };
  
  const handleViewRequest = (requestId: string) => {
    // Navigate to request details page
    // navigate(`/donor/requests/${requestId}`);
    console.log('View request:', requestId);
  };
  
  if (!donor) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-12">
          <div className="container mx-auto">
            <div className="text-center">
              <p>Loading...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">Blood Requests</h1>
          <p className="text-gray-600 mb-8">View and manage blood donation requests matching your blood type</p>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="available">Available Requests</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="available">
              {pendingRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingRequests.map((request) => (
                    <BloodRequestCard
                      key={request._id}
                      id={request._id}
                      hospitalName={request.hospitalName}
                      bloodType={request.bloodType}
                      urgent={request.urgent}
                      status={request.status}
                      location={`${request.hospitalLocation}`}
                      createdAt={request.createdAt}
                      onAccept={() => handleAcceptRequest(request._id)}
                      onView={() => handleViewRequest(request._id)}
                      isDonorView={true}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center space-y-3">
                      <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
                      <h3 className="text-xl font-semibold">No Matching Requests</h3>
                      <p className="text-gray-500">
                        There are currently no blood donation requests matching your blood type ({donor.bloodGroup}).
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="accepted">
              {acceptedRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {acceptedRequests.map((request) => (
                    <BloodRequestCard
                      key={request._id}
                      id={request._id}
                      hospitalName={request.hospitalName}
                      bloodType={request.bloodType}
                      urgent={request.urgent}
                      status={request.status}
                      location={`${request.hospitalLocation}`}
                      createdAt={request.createdAt}
                      onComplete={() => handleCompleteRequest(request._id)}
                      onCancel={() => handleCancelRequest(request._id)}
                      isDonorView={true}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center">
                      <p className="text-gray-500">
                        You don't have any accepted requests at the moment.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              {completedRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedRequests.map((request) => (
                    <BloodRequestCard
                      key={request._id}
                      id={request._id}
                      hospitalName={request.hospitalName}
                      bloodType={request.bloodType}
                      urgent={request.urgent}
                      status={request.status}
                      location={`${request.hospitalLocation}`}
                      createdAt={request.createdAt}
                      onView={() => handleViewRequest(request._id)}
                      showActionButtons={false}
                      isDonorView={true}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center">
                      <p className="text-gray-500">
                        You haven't completed any donations yet.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DonorRequests;
