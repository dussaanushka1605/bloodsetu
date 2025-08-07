import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, User, FileText, Mail, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Hospital } from '@/types/index';
import { toast } from 'sonner';
import axios from 'axios';

const HospitalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { verifyHospital } = useData();
  const { user } = useAuth();
  
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchHospitalDetail = async () => {
      try {
        setIsLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
        const token = localStorage.getItem('token_admin') || user?.token;
        
        if (!token) {
          console.error('No admin token found');
          toast.error('Authentication error. Please login again.');
          return;
        }
        
        const response = await axios.get<Hospital>(`${API_URL}/api/admin/hospitals/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        setHospital(response.data);
      } catch (error: any) {
        console.error('Error fetching hospital details:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
        } else if (error.response?.status === 404) {
          toast.error('Hospital not found');
          navigate('/admin/hospitals');
        } else {
          toast.error(error.response?.data?.message || 'Failed to fetch hospital details');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchHospitalDetail();
    }
  }, [id, user, navigate]);
  
  const handleVerifyHospital = async () => {
    if (!hospital) return;
    
    try {
      await verifyHospital(hospital._id, true);
      toast.success(`${hospital.name} has been verified successfully`);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error verifying hospital:', error);
      toast.error('Failed to verify hospital');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8 px-4 bg-gray-50">
          <div className="container mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">Loading Hospital Details...</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Please wait while we fetch the hospital data.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!hospital) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8 px-4 bg-gray-50">
          <div className="container mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Hospital Not Found</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                The hospital you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button 
                className="mt-6" 
                onClick={() => navigate('/admin/hospitals')}
              >
                Back to Hospitals
              </Button>
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Hospital Details</h1>
              <p className="text-gray-600">
                Review and verify hospital information
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/hospitals')}
            >
              Back to Hospitals
            </Button>
          </div>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-semibold">{hospital.name}</h2>
                <div className="flex items-center">
                  {hospital.isVerified ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-1" />
                      <span className="font-medium">Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600">
                      <AlertCircle className="h-5 w-5 mr-1" />
                      <span className="font-medium">Not Verified</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium">{hospital.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">License Number</p>
                      <p className="font-medium">{hospital.licenseNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{hospital.city}, {hospital.state}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <User className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-medium">{hospital.contactPerson}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Number</p>
                      <p className="font-medium">{hospital.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Registered On</p>
                      <p className="font-medium">
                        {new Date(hospital.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {!hospital.isVerified && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Verification Required</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            This hospital account is pending verification. Please review all the information 
                            carefully before verifying this account. Once verified, the hospital will have 
                            full access to the platform's features.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    size="lg"
                    className="w-full md:w-auto"
                    onClick={handleVerifyHospital}
                  >
                    Verify Hospital Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HospitalDetail;