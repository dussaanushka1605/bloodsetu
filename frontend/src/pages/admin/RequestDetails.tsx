import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, CalendarClock, CheckCircle, Droplets, Hospital, Map, Phone, User, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const RequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRequestById, getDonorById, getHospitalById } = useData();
  
  const request = getRequestById(id || '');
  const donor = request?.acceptedBy ? getDonorById(request.acceptedBy) : undefined;
  const hospital = request ? getHospitalById(request.hospitalId) : undefined;
  
  if (!request) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8 px-4 bg-gray-50">
          <div className="container mx-auto max-w-4xl">
            <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Request Not Found</h2>
                  <p className="text-gray-600">
                    The blood request you're looking for doesn't exist or has been removed.
                  </p>
                  <Button className="mt-6" asChild>
                    <Link to="/admin/dashboard">Return to Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const getStatusIcon = () => {
    switch (request.status) {
      case 'pending':
        return <CalendarClock className="h-5 w-5" />;
      case 'accepted':
        return <Droplets className="h-5 w-5" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };
  
  const getStatusColor = () => {
    switch (request.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>Blood Request Details</CardTitle>
                    <Badge className={getStatusColor()}>
                      <span className="flex items-center">
                        {getStatusIcon()}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Request Information</h3>
                    <div>
                      <p className="text-sm text-gray-500">Blood Type</p>
                      <div className="flex items-center mt-1">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blood-100 mr-2">
                          <span className="text-blood-800 font-semibold">{request.bloodType}</span>
                        </span>
                        <span className="font-medium">{request.bloodType}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Request Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Created On</p>
                        <p className="font-medium">{format(new Date(request.createdAt), 'MMM d, yyyy')}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Priority</p>
                        <p className={`font-medium ${request.urgent ? 'text-red-600' : 'text-gray-900'}`}>
                          {request.urgent ? 'Urgent' : 'Normal'}
                        </p>
                      </div>
                      
                      {request.status === 'completed' && request.completedAt && (
                        <div>
                          <p className="text-sm text-gray-500">Completed On</p>
                          <p className="font-medium">{format(new Date(request.completedAt), 'MMM d, yyyy')}</p>
                        </div>
                      )}
                      
                      {request.status === 'cancelled' && request.cancelReason && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Cancellation Reason</p>
                          <p className="font-medium">{request.cancelReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {request.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Additional Notes</h3>
                      <p className="bg-gray-50 p-3 rounded text-gray-700">{request.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Hospital className="mr-2 h-5 w-5" />
                    Hospital Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hospital ? (
                    <>
                      <div className="flex items-start">
                        <div className="ml-2 flex-grow">
                          <h3 className="font-medium text-lg">{hospital.name}</h3>
                          <div className="flex items-center text-gray-500 mt-1">
                            <Map className="h-4 w-4 mr-1" />
                            <span>{hospital.location}</span>
                          </div>
                        </div>
                        <Badge variant={hospital.isVerified ? "default" : "outline"}>
                          {hospital.isVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-500">Contact Person</p>
                          <p className="font-medium">{request.contactPerson}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Contact Number</p>
                          <div className="font-medium flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {request.contactNumber}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/hospitals/${hospital.id}`}>
                            View Hospital Profile
                          </Link>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">Hospital information unavailable</p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Donor Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {donor && request.acceptedBy ? (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="ml-2">
                          <h3 className="font-medium">{donor.name}</h3>
                          <p className="text-sm text-gray-500">{donor.bloodType} • {donor.age}, {donor.gender}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{donor.location}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Contact</p>
                        <div className="font-medium flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {donor.contactNumber}
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/donors/${donor.id}`}>
                            View Donor Profile
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">
                        {request.status === 'pending' 
                          ? 'No donor has accepted this request yet'
                          : 'Donor information unavailable'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" asChild>
                    <Link to={`/admin/requests/${request.id}/edit`}>
                      Edit Request
                    </Link>
                  </Button>
                  
                  {request.status === 'pending' && (
                    <Button variant="outline" className="w-full">
                      Cancel Request
                    </Button>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="link" className="w-full" asChild>
                    <Link to="/admin/requests">
                      View All Requests
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RequestDetails;
