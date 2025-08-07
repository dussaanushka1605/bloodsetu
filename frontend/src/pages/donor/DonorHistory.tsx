
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Calendar, Clock, FileText, MapPin, Phone, User } from 'lucide-react';
import { format } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BloodRequestCard from '@/components/BloodRequestCard';

const DonorHistory: React.FC = () => {
  const { user } = useAuth();
  const { 
    getRequestsByDonor, 
    updateBloodRequestStatus,
    getRequestById,
    getHospitalById
  } = useData();
  
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isRequestDetailsOpen, setIsRequestDetailsOpen] = useState(false);
  
  // Get all requests by status
  const acceptedRequests = getRequestsByDonor(user?.id || '', 'accepted');
  const completedRequests = getRequestsByDonor(user?.id || '', 'completed');
  const cancelledRequests = getRequestsByDonor(user?.id || '', 'cancelled');
  
  const handleViewDetails = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsRequestDetailsOpen(true);
  };
  
  const handleCompleteRequest = (requestId: string) => {
    updateBloodRequestStatus(requestId, 'completed', user?.id);
  };
  
  const handleCancelRequest = (requestId: string) => {
    updateBloodRequestStatus(requestId, 'cancelled');
  };
  
  const selectedRequest = selectedRequestId ? getRequestById(selectedRequestId) : null;
  const hospital = selectedRequest ? getHospitalById(selectedRequest.hospitalId) : null;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">Donation History</h1>
          <p className="text-gray-600 mb-8">
            View and manage your blood donation history
          </p>
          
          <Tabs defaultValue="active">
            <TabsList className="mb-6">
              <TabsTrigger value="active">
                Active Donations
                {acceptedRequests.length > 0 && (
                  <span className="ml-2 bg-blood-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {acceptedRequests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                {completedRequests.length > 0 && (
                  <span className="ml-2 bg-green-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {completedRequests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled
                {cancelledRequests.length > 0 && (
                  <span className="ml-2 bg-gray-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {cancelledRequests.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              {acceptedRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {acceptedRequests.map((request) => (
                    <BloodRequestCard
                      key={request.id}
                      id={request.id}
                      hospitalName={request.hospitalName}
                      bloodType={request.bloodType}
                      urgent={request.urgent}
                      status={request.status}
                      location={request.location}
                      createdAt={request.createdAt}
                      onComplete={() => handleCompleteRequest(request.id)}
                      onCancel={() => handleCancelRequest(request.id)}
                      onView={() => handleViewDetails(request.id)}
                      isDonorView={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Active Donations</h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    You don't have any active donation requests at the moment.
                    Accept new requests to see them here.
                  </p>
                  <Button className="mt-6" asChild>
                    <a href="/donor/requests">View Available Requests</a>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              {completedRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedRequests.map((request) => (
                    <BloodRequestCard
                      key={request.id}
                      id={request.id}
                      hospitalName={request.hospitalName}
                      bloodType={request.bloodType}
                      urgent={request.urgent}
                      status={request.status}
                      location={request.location}
                      createdAt={request.createdAt}
                      onView={() => handleViewDetails(request.id)}
                      isDonorView={true}
                      showActionButtons={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Completed Donations</h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    You haven't completed any blood donations yet.
                    Once you complete a donation, it will appear here.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="cancelled">
              {cancelledRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cancelledRequests.map((request) => (
                    <BloodRequestCard
                      key={request.id}
                      id={request.id}
                      hospitalName={request.hospitalName}
                      bloodType={request.bloodType}
                      urgent={request.urgent}
                      status={request.status}
                      location={request.location}
                      createdAt={request.createdAt}
                      onView={() => handleViewDetails(request.id)}
                      isDonorView={true}
                      showActionButtons={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Cancelled Donations</h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    You don't have any cancelled donation requests.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Request Details Dialog */}
          <Dialog open={isRequestDetailsOpen} onOpenChange={setIsRequestDetailsOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Donation Details</DialogTitle>
                <DialogDescription>
                  Complete information about this blood donation
                </DialogDescription>
              </DialogHeader>
              
              {selectedRequest && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Hospital</h3>
                    <p className="font-medium">{selectedRequest.hospitalName}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Blood Type</h3>
                    <p className="font-medium">{selectedRequest.bloodType}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <p className="font-medium capitalize">{selectedRequest.status}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Urgency</h3>
                      <p className="font-medium">
                        {selectedRequest.urgent ? 'Urgent (Emergency)' : 'Regular'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Location</h3>
                        <p>{selectedRequest.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Request Date</h3>
                        <p>{format(new Date(selectedRequest.createdAt), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <User className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Contact Person</h3>
                      <p>{selectedRequest.contactPerson}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                      <p>{selectedRequest.contactNumber}</p>
                    </div>
                  </div>
                  
                  {selectedRequest.notes && (
                    <div className="flex items-start">
                      <FileText className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Additional Notes</h3>
                        <p>{selectedRequest.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <DialogFooter className="flex sm:justify-between">
                <Button variant="outline" onClick={() => setIsRequestDetailsOpen(false)}>
                  Close
                </Button>
                
                {selectedRequest && selectedRequest.status === 'accepted' && (
                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={() => {
                      if (selectedRequestId) {
                        handleCancelRequest(selectedRequestId);
                        setIsRequestDetailsOpen(false);
                      }
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      if (selectedRequestId) {
                        handleCompleteRequest(selectedRequestId);
                        setIsRequestDetailsOpen(false);
                      }
                    }}>
                      Mark as Completed
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DonorHistory;
