
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Calendar, FileText, Filter, MapPin, Phone, PlusCircle, Search, User } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BloodRequestCard from '@/components/BloodRequestCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

const HospitalRequests: React.FC = () => {
  const { user } = useAuth();
  const { 
    getRequestsByHospital,
    updateBloodRequestStatus,
    getRequestById,
    getDonorById,
  } = useData();
  
  const allRequests = getRequestsByHospital(user?.id || '');
  const pendingRequests = allRequests.filter(req => req.status === 'pending');
  const acceptedRequests = allRequests.filter(req => req.status === 'accepted');
  const completedRequests = allRequests.filter(req => req.status === 'completed');
  const cancelledRequests = allRequests.filter(req => req.status === 'cancelled');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isRequestDetailsOpen, setIsRequestDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter requests based on search, filters, and active tab
  const getFilteredRequests = (requests: any[]) => {
    return requests.filter((request) => {
      const matchesSearch = 
        (request.hospitalName ? request.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (request.location ? request.location.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (request.bloodType ? request.bloodType.toLowerCase().includes(searchTerm.toLowerCase()) : false);
      
      const matchesBloodType = 
        selectedBloodType === 'all' || 
        (request.bloodType && request.bloodType === selectedBloodType);
      
      const matchesUrgency = 
        selectedUrgency === 'all' || 
        (selectedUrgency === 'urgent' && request.urgent) || 
        (selectedUrgency === 'regular' && !request.urgent);
      
      return matchesSearch && matchesBloodType && matchesUrgency;
    });
  };
  
  const filteredAllRequests = getFilteredRequests(allRequests);
  const filteredPendingRequests = getFilteredRequests(pendingRequests);
  const filteredAcceptedRequests = getFilteredRequests(acceptedRequests);
  const filteredCompletedRequests = getFilteredRequests(completedRequests);
  const filteredCancelledRequests = getFilteredRequests(cancelledRequests);
  
  const handleCancelRequest = (requestId: string) => {
    updateBloodRequestStatus(requestId, 'cancelled');
  };
  
  const handleViewDetails = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsRequestDetailsOpen(true);
  };
  
  const selectedRequest = selectedRequestId ? getRequestById(selectedRequestId) : null;
  const donor = selectedRequest?.acceptedBy ? getDonorById(selectedRequest.acceptedBy) : null;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Blood Requests</h1>
              <p className="text-gray-600">
                Manage all your blood donation requests
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Button asChild disabled={!user?.isVerified}>
                <Link to="/hospital/requests/new">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Request
                </Link>
              </Button>
            </div>
          </div>
          
          {!user?.isVerified && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Your hospital account needs to be verified before you can create blood requests.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search by blood type or location..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <div className="w-40">
                  <Select value={selectedBloodType} onValueChange={setSelectedBloodType}>
                    <SelectTrigger>
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Blood Type" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-40">
                  <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                    <SelectTrigger>
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Urgency" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Requests</SelectItem>
                      <SelectItem value="urgent">Urgent Only</SelectItem>
                      <SelectItem value="regular">Regular Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                All
                <span className="ml-2 bg-gray-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {filteredAllRequests.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                <span className="ml-2 bg-yellow-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {filteredPendingRequests.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="accepted">
                Accepted
                <span className="ml-2 bg-blue-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {filteredAcceptedRequests.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                <span className="ml-2 bg-green-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {filteredCompletedRequests.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled
                <span className="ml-2 bg-gray-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {filteredCancelledRequests.length}
                </span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {filteredAllRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAllRequests.map((request) => (
                    <BloodRequestCard
                      key={request.id}
                      id={request.id}
                      hospitalName={request.hospitalName}
                      bloodType={request.bloodType}
                      urgent={request.urgent}
                      status={request.status}
                      location={request.location}
                      createdAt={request.createdAt}
                      onCancel={() => handleCancelRequest(request.id)}
                      onView={() => handleViewDetails(request.id)}
                      showActionButtons={request.status === 'pending'}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Requests Found</h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    No blood requests match your search criteria. Try adjusting your filters or create a new request.
                  </p>
                  <Button className="mt-6" asChild>
                    <Link to="/hospital/requests/new">Create New Request</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending">
              {filteredPendingRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPendingRequests.map((request) => (
                    <BloodRequestCard
                      key={request.id}
                      id={request.id}
                      hospitalName={request.hospitalName}
                      bloodType={request.bloodType}
                      urgent={request.urgent}
                      status={request.status}
                      location={request.location}
                      createdAt={request.createdAt}
                      onCancel={() => handleCancelRequest(request.id)}
                      onView={() => handleViewDetails(request.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Pending Requests</h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    You don't have any pending blood requests that match your filters.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="accepted">
              {filteredAcceptedRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAcceptedRequests.map((request) => (
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
                      showActionButtons={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Accepted Requests</h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    None of your requests have been accepted by donors yet. Keep waiting or create more requests.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              {filteredCompletedRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCompletedRequests.map((request) => (
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
                      showActionButtons={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Completed Requests</h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    You don't have any completed blood donation requests.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="cancelled">
              {filteredCancelledRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCancelledRequests.map((request) => (
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
                      showActionButtons={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Cancelled Requests</h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    You don't have any cancelled blood donation requests.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Request Details Dialog */}
          <Dialog open={isRequestDetailsOpen} onOpenChange={setIsRequestDetailsOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Request Details</DialogTitle>
                <DialogDescription>
                  Complete information about this blood donation request
                </DialogDescription>
              </DialogHeader>
              
              {selectedRequest && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p className="font-medium capitalize">{selectedRequest.status}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Blood Type</h3>
                    <p className="font-medium">{selectedRequest.bloodType}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Urgency</h3>
                    <p className="font-medium">
                      {selectedRequest.urgent ? 'Urgent (Emergency)' : 'Regular'}
                    </p>
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
                  
                  {selectedRequest.acceptedBy && donor && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h3 className="font-medium mb-2">Donor Information</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Name</h3>
                          <p>{donor.name}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Blood Type</h3>
                          <p>{donor.bloodType}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Contact</h3>
                          <p>{donor.contactNumber}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Location</h3>
                          <p>{donor.location}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <DialogFooter className="flex sm:justify-between">
                <Button variant="outline" onClick={() => setIsRequestDetailsOpen(false)}>
                  Close
                </Button>
                
                {selectedRequest && selectedRequest.status === 'pending' && (
                  <Button variant="destructive" onClick={() => {
                    if (selectedRequestId) {
                      handleCancelRequest(selectedRequestId);
                      setIsRequestDetailsOpen(false);
                    }
                  }}>
                    Cancel Request
                  </Button>
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

export default HospitalRequests;
