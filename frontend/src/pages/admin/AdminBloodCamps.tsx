import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building2,
  Phone,
  Mail,
  Search,
  X,
} from 'lucide-react';

// Types
interface Hospital {
  _id: string;
  name: string;
  location: string;
  email: string;
  phone: string;
}

interface Donor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: string;
  city?: string;
  state?: string;
}

interface InterestedDonor {
  donor: Donor;
  status: 'registered' | 'attended' | 'no-show';
  registeredAt: string;
}

interface BloodCamp {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  contactInfo: string;
  createdBy: Hospital;
  interestedDonors: InterestedDonor[];
  createdAt: string;
  updatedAt: string;
}

interface HospitalWithCamps {
  hospital: Hospital;
  camps: BloodCamp[];
}

const AdminBloodCamps: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bloodCamps, setBloodCamps] = useState<BloodCamp[]>([]);
  const [hospitalWithCamps, setHospitalWithCamps] = useState<HospitalWithCamps[]>([]);
  const [selectedCamp, setSelectedCamp] = useState<BloodCamp | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all blood camps
  useEffect(() => {
    const fetchBloodCamps = async () => {
      try {
        // Only show loading indicator on initial load, not during refreshes
        if (bloodCamps.length === 0) {
          setLoading(true);
        }
        
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
        const response = await axios.get(`${API_URL}/api/bloodcamp/admin`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token_admin') || user?.token}`
          },
          // Add cache control to prevent caching
          params: {
            _t: new Date().getTime() // Add timestamp to prevent caching
          }
        });
        
        if (response.status === 200) {
          setBloodCamps(response.data);
          
          // Group camps by hospital
          const hospitalMap = new Map<string, HospitalWithCamps>();
          
          response.data.forEach((camp: BloodCamp) => {
            if (!camp.createdBy || !camp.createdBy._id) {
              console.error('Invalid camp data:', camp);
              return;
            }
            
            const hospitalId = camp.createdBy._id;
            
            if (!hospitalMap.has(hospitalId)) {
              hospitalMap.set(hospitalId, {
                hospital: camp.createdBy,
                camps: [camp]
              });
            } else {
              const hospitalData = hospitalMap.get(hospitalId);
              if (hospitalData) {
                hospitalData.camps.push(camp);
                hospitalMap.set(hospitalId, hospitalData);
              }
            }
          });
          
          setHospitalWithCamps(Array.from(hospitalMap.values()));
        } else {
          throw new Error(`Server responded with status: ${response.status}`);
        }
      } catch (error: any) {
        console.error('Error fetching blood camps:', error);
        // Only show toast on initial load or if there's a new error
        if (bloodCamps.length === 0 || error.message !== 'Failed to load blood camps') {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.response?.data?.message || "Failed to load blood camps"
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      // Initial fetch
      fetchBloodCamps();
      
      // Set up interval to refresh data every 15 seconds for more responsive real-time updates
      const intervalId = setInterval(() => {
        fetchBloodCamps();
      }, 15000);
      
      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [user, toast]);

  // Handle view details
  const handleViewDetails = (camp: BloodCamp) => {
    setSelectedCamp(camp);
    setDetailsDialogOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPP');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Filter hospitals and camps based on search query
  const filteredHospitals = hospitalWithCamps.filter(item => {
    const hospital = item.hospital;
    const hospitalMatches = 
      (hospital?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (hospital?.city?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (hospital?.state?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (hospital?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (hospital?.phone?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    if (hospitalMatches) return true;
    
    // Check if any camps match the search query
    const campMatches = item.camps.some(camp => 
      (camp?.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (camp?.location?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (camp?.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (camp?.date?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (camp?.time?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );
    
    return campMatches;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Blood Camps</h1>
            
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search hospitals or camps"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute right-2 top-2.5"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blood-600"></div>
            </div>
          ) : filteredHospitals.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-10">
                <p className="text-gray-500">No blood camps found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {filteredHospitals.flatMap(item => 
                item.camps.map(camp => (
                  <Card 
                    key={camp?._id || `camp-${Math.random()}`} 
                    className="overflow-hidden hover:shadow-md transition-shadow border-gray-200 aspect-square flex flex-col"
                  >
                    <div className="bg-blood-50 p-3 border-b border-blood-100">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-blood-800 truncate">{camp?.title || 'Untitled Camp'}</h3>
                        <Badge className="bg-blood-100 text-blood-800 hover:bg-blood-100 ml-1 flex-shrink-0 text-xs">
                          {camp?.interestedDonors?.length || 0}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{camp?.description || 'No description'}</p>
                    </div>
                    
                    <div className="p-3 flex-grow flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Building2 className="h-4 w-4 mr-2 text-blood-500 flex-shrink-0" />
                          <span className="truncate font-medium text-blood-700">{camp?.createdBy?.name || 'Unknown Hospital'}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{camp?.location || 'Location not specified'}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                          <span>{camp?.date ? formatDate(camp.date) : 'Date not specified'}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                          <span>{camp?.time || 'Time not specified'}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{camp?.createdBy?.email || 'Email not available'}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{camp?.createdBy?.phone || 'Phone not available'}</span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-3 bg-blood-50 hover:bg-blood-100 text-blood-800 border-blood-200 hover:border-blood-300" 
                        onClick={() => handleViewDetails(camp)}
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Camp Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl">
          {selectedCamp && (
            <>
              <DialogHeader className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <DialogTitle className="text-2xl text-blood-800">{selectedCamp?.title || 'Untitled Camp'}</DialogTitle>
                  <Badge className="bg-blood-100 text-blood-800 hover:bg-blood-100">
                    {selectedCamp?.interestedDonors?.length || 0} Registered Donors
                  </Badge>
                </div>
                <DialogDescription className="mt-2">{selectedCamp?.description || 'No description available'}</DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 text-blood-800 border-b pb-2">Camp Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 mr-3 text-blood-600" />
                      <div>
                        <p className="font-medium text-gray-700">Hospital</p>
                        <p className="text-gray-900">{selectedCamp?.createdBy?.name || 'Unknown Hospital'}</p>
                        <div className="flex flex-col sm:flex-row sm:space-x-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Mail className="h-4 w-4 mr-1 text-gray-500 flex-shrink-0" />
                            <span className="truncate">{selectedCamp?.createdBy?.email || 'Email not available'}</span>
                          </span>
                          <span className="flex items-center mt-1 sm:mt-0">
                            <Phone className="h-4 w-4 mr-1 text-gray-500 flex-shrink-0" />
                            <span className="truncate">{selectedCamp?.createdBy?.phone || 'Phone not available'}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-3 text-blood-600" />
                      <div>
                        <p className="font-medium text-gray-700">Date</p>
                        <p className="text-gray-900">{selectedCamp?.date ? formatDate(selectedCamp.date) : 'Date not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-3 text-blood-600" />
                      <div>
                        <p className="font-medium text-gray-700">Time</p>
                        <p className="text-gray-900">{selectedCamp?.time || 'Time not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-3 text-blood-600" />
                      <div>
                        <p className="font-medium text-gray-700">Location</p>
                        <p className="text-gray-900">{selectedCamp?.location || 'Location not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 mr-3 text-blood-600" />
                      <div>
                        <p className="font-medium text-gray-700">Contact</p>
                        <p className="text-gray-900">{selectedCamp?.contactInfo || 'Contact information not available'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4 text-blood-800 border-b pb-2 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blood-600" />
                    Registered Donors ({selectedCamp?.interestedDonors?.length || 0})
                  </h3>
                  
                  {!selectedCamp?.interestedDonors?.length ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Users className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">No donors have registered yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedCamp?.interestedDonors?.map((item) => (
                        <Card key={item?.donor?._id || `donor-${Math.random()}`} className="border-gray-200 hover:shadow-sm transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <div className={`h-4 w-4 rounded-full mr-2 ${item?.donor?.bloodGroup?.includes('O') ? 'bg-red-600' : 
                                    item?.donor?.bloodGroup?.includes('A') ? 'bg-green-600' : 
                                    item?.donor?.bloodGroup?.includes('B') ? 'bg-blue-600' : 'bg-purple-600'}`}></div>
                                  <h4 className="font-medium">{item?.donor?.name || 'Unknown Donor'}</h4>
                                  <span className="text-sm font-medium ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                                    {item?.donor?.bloodGroup || 'Unknown'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{item?.donor?.email || 'Email not available'}</p>
                                <p className="text-sm text-gray-500">{item?.donor?.phone || 'Phone not available'}</p>
                                <p className="text-sm text-gray-500">
                                  {item?.donor?.city && item?.donor?.state ? 
                                    `${item.donor.city}, ${item.donor.state}` : 
                                    'Location not provided'}
                                </p>
                              </div>
                              
                              <div className="text-right ml-4">
                                <Badge className={
                                  item?.status === 'registered' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                  item?.status === 'attended' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                  'bg-red-100 text-red-800 hover:bg-red-100'
                                }>
                                  {item?.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Unknown'}
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">
                                  Registered on {item?.registeredAt ? formatDate(item.registeredAt) : 'Unknown date'}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter className="border-t pt-4 mt-2">
                <Button 
                  variant="outline" 
                  className="bg-blood-50 hover:bg-blood-100 text-blood-800 border-blood-200 hover:border-blood-300"
                  onClick={() => setDetailsDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default AdminBloodCamps;