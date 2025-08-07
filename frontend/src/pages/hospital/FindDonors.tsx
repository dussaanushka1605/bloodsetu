import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// import { useData } from '@/contexts/DataContext'; // REMOVED
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Calendar, Filter, MapPin, Phone, Search, UserCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DonorCard from '@/components/DonorCard';
import { format } from 'date-fns';
import { BLOOD_TYPES, Donor } from '@/types/bloodTypes'; // Import Donor type
import VerificationNotice from '@/components/hospital/VerificationNotice';
import { toast } from 'sonner';
import axios from 'axios'; // Needed for direct API calls if DataContext is fully removed

interface RequestDetails {
  unitsRequired: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  notes: string;
}

const FindDonors: React.FC = () => {
  const { user, logout } = useAuth(); // Added logout for potential 401 handling
  // const { donors, getHospitalById, createBloodRequest } = useData(); // REMOVED DataContext usage
  const [isLoading, setIsLoading] = useState(true);
  const [donors, setDonors] = useState<Donor[]>([]); // Local state for donors
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState<string>('all');
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [isDonorDetailsOpen, setIsDonorDetailsOpen] = useState(false);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [requestDetails, setRequestDetails] = useState<RequestDetails>({
    unitsRequired: 1,
    urgency: 'medium',
    notes: ''
  });
  
  console.log('Current user in FindDonors:', user);
  
  // REMOVED hospital lookup via DataContext
  // const hospital = user?.role === 'hospital' && user?._id 
  //   ? getHospitalById(user._id) 
  //   : null;
  // console.log('Found hospital (lookup removed):', hospital);
  
  useEffect(() => {
    // Fetch donors directly if user is a verified hospital
    const fetchDonorsData = async () => {
        if (user && user.role === 'hospital' && user.isVerified) {
            setIsLoading(true);
            try {
                // Get token from localStorage first, then fall back to user object
                // Always prioritize token from localStorage for API calls
                const token = localStorage.getItem('token_hospital') || user.token;
                if (!token) {
                    console.log('No token found for hospital');
                    setIsLoading(false);
                    return;
                }
                
                console.log('Fetching donors for verified hospital...');
                const params: any = {};
                
                // Only add bloodGroup filter if a specific type is selected
                if (selectedBloodType !== 'all') {
                    params.bloodGroup = selectedBloodType;
                }
                
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
                const response = await axios.get<Donor[]>(`${API_URL}/api/hospital/search-donors`, {
                    params,
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('Fetched donors:', response.data);
                setDonors(response.data);
            } catch (error: any) {
                console.error('Error fetching donors:', error);
                if (error.response?.status === 401) {
                  toast.error('Session expired. Please login again.');
                  // Don't call logout() here as it would redirect to login page
                  // Just show an error message and let the user try again
                  toast.error('Please try refreshing the page or logging in again');
                } else {
                    toast.error(error.response?.data?.message || 'Failed to fetch donors');
                }
            } finally {
                setIsLoading(false);
            }
        } else {
            // If user is not a verified hospital, stop loading
            setIsLoading(false); 
        }
    };

    fetchDonorsData();

  }, [user, logout, selectedBloodType]); // Added selectedBloodType to dependencies
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8 px-4 bg-gray-50">
          <div className="container mx-auto">
            <div className="text-center">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-blood-200 border-t-blood-500 rounded-full mb-4"></div>
              <p className="text-gray-600">Loading donors...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Access Control: Check if user is logged in and is a hospital
  if (!user || user.role !== 'hospital') {
    console.log('Access denied - not a hospital user:', { 
      userExists: Boolean(user),
      role: user?.role 
    });
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8 px-4 bg-gray-50">
          <div className="container mx-auto">
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <h2 className="text-red-800 text-lg font-semibold mb-2">Access Denied</h2>
              <p className="text-red-600">
                {!user 
                  ? 'Please log in to access this feature.'
                  : 'Only registered hospitals can access this feature.'}
              </p>
              <p className="text-red-500 mt-2 text-sm">
                Debug info: Role: {user?.role || 'none'}
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Verification Check: Use user.isVerified directly
  if (!user.isVerified) {
    console.log('Access denied - hospital not verified');
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8 px-4 bg-gray-50">
          <div className="container mx-auto">
            <VerificationNotice isVerified={false} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Filter donors based on search and filters
  const filteredDonors = donors.filter((donor) => {
    const nameMatch = donor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const locationMatch = (donor.city + ', ' + donor.state)?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const bloodTypeMatch = donor.bloodGroup?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const matchesSearch = nameMatch || locationMatch || bloodTypeMatch;
    
    const matchesBloodType = 
      selectedBloodType === 'all' || 
      donor.bloodGroup === selectedBloodType;
    
    return matchesSearch && matchesBloodType;
  });
  

  
  const handleViewDetails = (donorId: string) => {
    setSelectedDonorId(donorId);
    setIsDonorDetailsOpen(true);
  };
  
  const selectedDonor = selectedDonorId ? donors.find(donor => donor._id === selectedDonorId) : null;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">Find Blood Donors</h1>
          <p className="text-gray-600 mb-8">
            Search for available blood donors in your area.
          </p>
          
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search by name, location or blood type..." 
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
                      {BLOOD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonors.length > 0 ? (
              filteredDonors.map((donor) => (
                <DonorCard 
                  key={donor._id}
                  id={donor._id}
                  name={donor.name}
                  bloodGroup={donor.bloodGroup}
                  age={donor.age}
                  gender={donor.gender}
                  city={donor.city || ''}
                  state={donor.state || ''}
                  phone={donor.phone}
                  onView={() => handleViewDetails(donor._id)}
                  showContactInfo={true}
                />
              ))
            ) : (
              <p className="text-gray-500 md:col-span-2 lg:col-span-3 text-center py-8">
                No donors found matching your criteria.
              </p>
            )}
          </div>
        </div>
      </main>
      
      {/* Donor Details Dialog */}
      {selectedDonor && (
        <Dialog open={isDonorDetailsOpen} onOpenChange={setIsDonorDetailsOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Donor Details</DialogTitle>
              <DialogDescription>
                Contact information and details for {selectedDonor.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center">
                <UserCheck className="mr-2 h-4 w-4 text-gray-500" /> 
                <span>{selectedDonor.name} ({selectedDonor.gender}, {selectedDonor.age} yrs)</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                <span>{selectedDonor.city}, {selectedDonor.state}</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-blood-100 border border-blood-200 flex items-center justify-center mr-2">
                  <span className="text-blood-800 text-xs font-semibold">{selectedDonor.bloodGroup}</span>
                </div>
                <span>Blood Type: {selectedDonor.bloodGroup}</span>
              </div>
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-gray-500" />
                <div className="flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Contact number will be available once the donor accepts your request</span>
                </div>
              </div>


            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDonorDetailsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      <Footer />
    </div>
  );
};

export default FindDonors;
