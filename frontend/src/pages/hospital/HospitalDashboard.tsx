import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, AlertCircle, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HospitalProfile from '@/components/hospital/HospitalProfile';
import RequestDetailsDialog from '@/components/hospital/RequestDetailsDialog';
import VerificationNotice from '@/components/hospital/VerificationNotice';
import BloodRequestTabs from '@/components/hospital/BloodRequestTabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BloodRequestCard from '@/components/BloodRequestCard';
import { toast } from 'sonner';
import axios from 'axios';
import { BloodRequest, Donor } from '@/types/bloodTypes';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';

interface DonorDetails {
  _id: string;
  name: string;
  bloodGroup: string;
  phone: string;
  city?: string;
  state?: string;
  lastDonation?: string;
}

interface DonorResponse {
  donor: string;
  response: 'accepted' | 'rejected';
  respondedAt: string;
}

interface BloodRequestDetails {
  _id: string;
  hospitalId: string;
  hospitalName: string;
  bloodType: string;
  contactPerson: string;
  contactNumber: string;
  urgent: boolean;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled' | 'rejected';
  createdAt: string;
  updatedAt: string;
  notifiedDonors: DonorDetails[];
  donorResponses: DonorResponse[];
  acceptedBy?: DonorDetails;
}

const HospitalDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isRequestDetailsOpen, setIsRequestDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequestDetails | null>(null);

  
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) {
        console.log('Dashboard useEffect: Waiting for user.');
        setLoading(false);
        return;
      }

      setLoading(true);
      // Get token from localStorage first, then fall back to user object
      const token = localStorage.getItem('token_hospital') || user.token;
      if (!token) {
        console.log('No token found for hospital');
        setLoading(false);
        return;
      }
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

      try {
        console.log(`Fetching blood requests with token: Bearer ${token.substring(0, 10)}...`);
        const response = await axios.get<BloodRequest[]>(`${API_URL}/api/hospital/blood-requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Blood requests response:', response.data);
        setBloodRequests(response.data);
      } catch (error: any) {
        console.error('Error fetching blood requests:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired or invalid (API fetch). Please login again.');
          localStorage.removeItem('token_hospital');
          localStorage.removeItem('user_hospital');
          if (logout) logout();
          navigate('/login');
        } else {
          toast.error(error.response?.data?.message || 'Failed to fetch blood requests');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
        fetchInitialData(); 
    }

  }, [user, navigate, logout]);



  const handleViewDetails = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token_hospital') || user?.token;
      if (!token) {
        toast.error('Please login to continue.');
        navigate('/login');
        return;
      }
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      console.log('Fetching details for request:', requestId);
      
      const response = await axios.get<BloodRequestDetails>(
        `${API_URL}/api/hospital/blood-requests/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Request details response:', response.data);
      setSelectedRequest(response.data);
      setSelectedRequestId(requestId);
      setIsRequestDetailsOpen(true);
    } catch (error: any) {
      console.error('Error fetching request details:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token_hospital');
        localStorage.removeItem('user_hospital');
        if (logout) logout();
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch request details');
      }
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    const token = localStorage.getItem('token_hospital') || user?.token;
    if (!token) {
      toast.error('Please login to continue.');
      navigate('/login');
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
    try {
      await axios.patch(`${API_URL}/api/hospital/blood-requests/${requestId}`, 
        { status: 'cancelled' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setBloodRequests(prev => prev.map(req => 
        req._id === requestId ? { ...req, status: 'cancelled' } : req
      ));
      toast.success('Request cancelled successfully');
    } catch (error: any) {
      console.error('Error updating request:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token_hospital');
        localStorage.removeItem('user_hospital');
        if (logout) logout();
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to cancel request');
      }
    }
  };


  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-12">
          <div className="container mx-auto">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blood-600"></div>
              <span className="ml-3">Loading dashboard...</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
     console.log("User data not available after load. Ensure login state is correct.")
     return (
       <div className="flex flex-col min-h-screen">
         <Header />
         <main className="flex-grow py-12">
           <div className="container mx-auto text-center">
             Authenticating or redirecting...
           </div>
         </main>
         <Footer />
       </div>
     ); 
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-12 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <HospitalProfile hospital={user} />
              <div className="text-center">
                <Button variant="outline" asChild>
                  <Link to="/hospital/profile">
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="lg:col-span-2 space-y-8">
              {!user.isVerified ? (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-yellow-800">Registration Pending Verification</h3>
                        <p className="text-yellow-700 mt-1">
                          Your hospital registration is currently pending admin verification. 
                          You will not be able to access any features until your account is verified.
                          This usually takes 1-2 business days.
                        </p>
                        <div className="mt-4">
                          <p className="text-yellow-700 text-sm">
                            <strong>Disabled Features:</strong>
                          </p>
                          <ul className="text-yellow-700 text-sm mt-1 ml-4 list-disc">
                            <li>Creating blood requests</li>
                            <li>Finding donors</li>
                            <li>Managing blood camps</li>
                            <li>Accessing donor contact information</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Blood Requests Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Blood Requests</CardTitle>
                          <CardDescription>
                            Manage your blood donation requests
                          </CardDescription>
                        </div>
                        <Button asChild>
                          <Link to="/hospital/requests/new">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            New Request
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {bloodRequests.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No blood requests found</p>
                          <Button variant="outline" className="mt-4" asChild>
                            <Link to="/hospital/requests/new">
                              Create your first request
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bloodRequests.map(request => (
                            <BloodRequestCard 
                              key={request._id}
                              id={request._id}
                              hospitalName={request.hospitalName}
                              bloodType={request.bloodType}
                              urgent={request.urgent}
                              status={request.status === 'rejected' ? 'cancelled' : request.status}
                              location={user.location}
                              createdAt={request.createdAt}
                              onView={() => handleViewDetails(request._id)}
                              showActionButtons={true}
                              isDonorView={false}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Request Details Dialog */}
      <Dialog open={isRequestDetailsOpen} onOpenChange={setIsRequestDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Complete information about this blood request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <Badge className={
                    selectedRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedRequest.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    selectedRequest.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {selectedRequest.status ? selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1) : 'Unknown'}
                  </Badge>
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

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="font-medium">
                    {new Date(selectedRequest.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Notified Donors Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Notified Donors</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="font-medium">Total: {selectedRequest.notifiedDonors?.length || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="font-medium">
                        Accepted: {selectedRequest.donorResponses?.filter(r => r.response === 'accepted').length || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedRequest.notifiedDonors && selectedRequest.notifiedDonors.length > 0 ? (
                    <div className="space-y-4">
                      {selectedRequest.notifiedDonors.map((donor) => {
                        const response = selectedRequest.donorResponses?.find(r => r.donor === donor._id);
                        const location = donor.city && donor.state ? `${donor.city}, ${donor.state}` : undefined;
                        
                        return (
                          <div key={donor._id} className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{donor.name}</h4>
                                <p className="text-sm text-gray-500">{donor.bloodGroup}</p>
                              </div>
                              <Badge className={
                                response?.response === 'accepted' ? 'bg-green-100 text-green-800' :
                                response?.response === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {response ? response.response.charAt(0).toUpperCase() + response.response.slice(1) : 'Pending'}
                              </Badge>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              {location && <p>Location: {location}</p>}
                              {donor.lastDonation && (
                                <p>Last Donation: {new Date(donor.lastDonation).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No donors have been notified yet
                    </div>
                  )}
                </div>
              </div>

              {/* Accepted Donor Section */}
              {selectedRequest.acceptedBy && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Accepted Donor</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{selectedRequest.acceptedBy.name}</h4>
                        <p className="text-sm text-gray-500">{selectedRequest.acceptedBy.bloodGroup}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Accepted
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {selectedRequest.acceptedBy.city && selectedRequest.acceptedBy.state && (
                        <p>Location: {`${selectedRequest.acceptedBy.city}, ${selectedRequest.acceptedBy.state}`}</p>
                      )}
                      <p>Contact: {selectedRequest.acceptedBy.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      

      
      <Footer />
    </div>
  );
};

export default HospitalDashboard;
