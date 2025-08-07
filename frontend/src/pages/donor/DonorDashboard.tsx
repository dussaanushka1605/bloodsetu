import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Droplets, AlertCircle, Clock, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DonorEligibility from '@/components/DonorEligibility';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { BloodRequest } from '@/types/bloodTypes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getRequestsByDonor } = useData();
  const [donor, setDonor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchDonorProfile = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
        const response = await axios.get(`${API_URL}/api/donor/profile`, {
          headers: {
          Authorization: `Bearer ${localStorage.getItem('token_donor') || user?.token}`,
          'Content-Type': 'application/json'
        }
        });
        setDonor(response.data);
      } catch (error) {
        console.error('Error fetching donor profile:', error);
        toast.error('Failed to fetch donor profile');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchDonorProfile();
    }
  }, [user]);

  useEffect(() => {
    const fetchBloodRequests = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
        const response = await axios.get<BloodRequest[]>(`${API_URL}/api/donor/blood-requests`, {
          headers: {
          Authorization: `Bearer ${localStorage.getItem('token_donor') || user?.token}`,
          'Content-Type': 'application/json'
        }
        });
        console.log('Fetched blood requests:', response.data);
        setBloodRequests(response.data);
      } catch (error) {
        console.error('Error fetching blood requests:', error);
        toast.error('Failed to fetch blood requests');
      }
    };

    if (user?.token) {
      fetchBloodRequests();
    }
  }, [user]);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      await axios.post(
        `${API_URL}/api/donor/blood-requests/${requestId}/respond`,
        { response: 'accepted' },
        {
          headers: {
          Authorization: `Bearer ${localStorage.getItem('token_donor') || user?.token}`,
          'Content-Type': 'application/json'
        }
        }
      );
      
      // Update local state to reflect the change
      setBloodRequests(prev => 
        prev.map(req => 
          req._id === requestId 
            ? { ...req, status: 'accepted' } 
            : req
        )
      );
      
      toast.success('Blood request accepted successfully');
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleViewDetails = (request: BloodRequest) => {
    setSelectedRequest(request);
    setIsDetailsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8 px-4 bg-gray-50">
          <div className="container mx-auto">
            <p>Loading donor profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!donor) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8 px-4 bg-gray-50">
          <div className="container mx-auto">
            <p>Error loading donor profile. Please try again later.</p>
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
          <div className="grid grid-cols-1 gap-8">
            {/* Main Content */}
            <div>
              <h1 className="text-3xl font-bold mb-2">Donor Dashboard</h1>
              <p className="text-gray-600 mb-8">Welcome, {donor.name}</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Name</h3>
                        <p className="font-medium">{donor.name}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Age</h3>
                        <p>{donor.age} years</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                        <p>{donor.gender}</p>
                      </div>
                      
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Location</h3>
                          <p>{donor.city}, {donor.state}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Droplets className="h-5 w-5 mr-2 text-blood-600" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Blood Type</h3>
                          <div className="flex items-center">
                            <Badge className="bg-blood-100 text-blood-800 hover:bg-blood-200">
                              {donor.bloodGroup}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Phone className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Contact</h3>
                          <p>{donor.phone}</p>
                        </div>
                      </div>
                      

                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Blood Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {bloodRequests.length > 0 ? (
                    <div className="space-y-4">
                      {bloodRequests.map((request) => (
                        <div key={request._id} className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium text-lg">{request.hospitalName}</h3>
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{request.hospitalLocation}</span>
                              </div>
                            </div>
                            <Badge variant="outline" className={
                              request.urgent ? 'bg-red-100 text-red-800 border-red-200' : 'bg-gray-100 text-gray-800 border-gray-200'
                            }>
                              {request.urgent ? 'Urgent' : 'Regular'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="outline" className="bg-blood-50 text-blood-700 border-blood-200">
                              {request.bloodType}
                            </Badge>
                            <Badge variant="outline" className={
                              request.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              request.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                              request.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="flex justify-between items-center mt-3 pt-3 border-t">
                            <div className="text-sm text-gray-500">
                              {format(parseISO(request.createdAt), "MMM d, yyyy")}
                            </div>
                            <div className="flex gap-2">
                              {request.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  variant="default"
                                  onClick={() => handleAcceptRequest(request._id)}
                                >
                                  Accept Request
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewDetails(request)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {bloodRequests.length > 3 && (
                        <div className="text-center pt-4">
                          <Button variant="link" asChild>
                            <a href="/donor/requests">View All Requests</a>
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Blood Requests</h3>
                      <p className="text-gray-500">
                        There are currently no blood requests matching your blood type.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <DonorEligibility />
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Donation Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 border-l-4 border-green-500 p-3">
                    <h3 className="font-medium text-green-800">Before Donation</h3>
                    <ul className="mt-2 space-y-1 text-sm text-green-700">
                      <li>Get a good night's sleep</li>
                      <li>Drink plenty of water</li>
                      <li>Eat a healthy meal</li>
                      <li>Avoid fatty foods</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3">
                    <h3 className="font-medium text-blue-800">After Donation</h3>
                    <ul className="mt-2 space-y-1 text-sm text-blue-700">
                      <li>Rest for at least 15 minutes</li>
                      <li>Drink extra fluids</li>
                      <li>Avoid strenuous activities for 24 hours</li>
                      <li>Keep the bandage on for a few hours</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blood Request Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Blood Request Details</DialogTitle>
              <DialogDescription>
                Complete information about this blood request
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-6">
                {/* Hospital Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Hospital Information</h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Hospital Name</p>
                      <p className="font-medium">{selectedRequest.hospitalName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{selectedRequest.hospitalLocation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-medium">{selectedRequest.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Number</p>
                      <p className="font-medium">{selectedRequest.contactNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Request Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Request Details</h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Blood Type</p>
                      <Badge variant="outline" className="mt-1 bg-blood-50 text-blood-700 border-blood-200">
                        {selectedRequest.bloodType}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Urgency</p>
                      <Badge variant="outline" className={`mt-1 ${
                        selectedRequest.urgent 
                          ? 'bg-red-50 text-red-700 border-red-200' 
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {selectedRequest.urgent ? 'Urgent' : 'Regular'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge variant="outline" className={`mt-1 ${
                        selectedRequest.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        selectedRequest.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                        selectedRequest.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created On</p>
                      <p className="font-medium">
                        {format(parseISO(selectedRequest.createdAt), "PPP")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  {selectedRequest.status === 'pending' && (
                    <Button 
                      onClick={() => {
                        handleAcceptRequest(selectedRequest._id);
                        setIsDetailsDialogOpen(false);
                      }}
                      variant="default"
                    >
                      Accept Request
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDetailsDialogOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
};

export default DonorDashboard;
