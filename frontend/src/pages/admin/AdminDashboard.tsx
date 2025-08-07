import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Hospital, 
  UserCheck, 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  User, 
  Calendar,
  Building,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatCard from '@/components/StatCard';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'sonner';
import { DonorDetailsDialog } from '@/components/admin/DonorDetailsDialog';
import { HospitalDetailsDialog } from '@/components/admin/HospitalDetailsDialog';

interface HospitalData {
  _id: string;
  name: string;
  email: string;
  licenseNumber: string;
  phone: string;
  city: string;
  state: string;
  contactPerson: string;
  isVerified: boolean;
  requestsMade: number;
  requestsCompleted: number;
  createdAt: string;
}

interface DonorData {
  _id: string;
  name: string;
  email: string;
  bloodGroup: string;
  phone: string;
  city: string;
  state: string;
  age: number;
  gender: string;
  lastDonation?: string;
  donations: number;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  // State to track active section
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Function to set active section
  const showSection = (section: string) => {
    setActiveSection(section);
  };
  
  // Function to go back to main dashboard
  const goBackToDashboard = () => {
    setActiveSection(null);
  };
  const { user } = useAuth();
  const { donors, hospitals } = useData();
  
  // State for real-time data
  const [hospitalData, setHospitalData] = useState<HospitalData[]>([]);
  const [donorData, setDonorData] = useState<DonorData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [hospitalSearchTerm, setHospitalSearchTerm] = useState('');
  const [donorSearchTerm, setDonorSearchTerm] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('All Types');
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>('All Hospitals');
  
  // Dialog states
  const [selectedDonor, setSelectedDonor] = useState<DonorData | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<HospitalData | null>(null);
  const [donorDialogOpen, setDonorDialogOpen] = useState(false);
  const [hospitalDialogOpen, setHospitalDialogOpen] = useState(false);
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [donorFilter, setDonorFilter] = useState('all');
  
  // Fetch real-time data from MongoDB
  const fetchRealTimeData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      const token = localStorage.getItem('token_admin') || user?.token;
      
      if (!token) {
        console.error('No admin token found');
        toast.error('Authentication required');
        return;
      }
      
      // Fetch hospitals
      const hospitalsResponse = await axios.get(`${API_URL}/api/admin/hospitals`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Fetch donors
      const donorsResponse = await axios.get(`${API_URL}/api/admin/donors`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Fetched hospitals:', hospitalsResponse.data.length);
      console.log('Fetched donors:', donorsResponse.data.length);
      
      setHospitalData(hospitalsResponse.data);
      setDonorData(donorsResponse.data);
    } catch (error: any) {
      console.error('Error fetching real-time data:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else {
        toast.error('Failed to fetch data: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data on component mount and set up real-time updates
  useEffect(() => {
    fetchRealTimeData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchRealTimeData, 30000);
    
    return () => clearInterval(interval);
  }, [user]);
  
  // Update donorFilter when selectedBloodGroup changes
  useEffect(() => {
    if (selectedBloodGroup === 'All Types') {
      setDonorFilter('all');
    } else {
      setDonorFilter(selectedBloodGroup);
    }
    console.log('Blood group filter changed:', selectedBloodGroup, '-> donorFilter:', selectedBloodGroup === 'All Types' ? 'all' : selectedBloodGroup);
    
    // Log the current donor data
    console.log('Current donor data:', donorData);
    
    // Log the filtered donors after filter change
    setTimeout(() => {
      const filtered = donorData.filter(donor => {
        const matchesFilter = 
          selectedBloodGroup === 'All Types' ||
          donor.bloodGroup === selectedBloodGroup;
        return matchesFilter;
      });
      console.log('Filtered donors after blood group change:', filtered);
    }, 100);
  }, [selectedBloodGroup, donorData]);
  
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600">You must be logged in as an admin to view this page.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Calculate statistics
  const totalDonors = donorData.length;
  const totalHospitals = hospitalData.length;
  const pendingVerification = hospitalData.filter(hospital => !hospital.isVerified).length;
  const verifiedHospitals = hospitalData.filter(hospital => hospital.isVerified).length;
  
  // Filter hospitals
  const filteredHospitals = hospitalData.filter(hospital => {
    const matchesSearch = 
      hospital.name.toLowerCase().includes(hospitalSearchTerm.toLowerCase()) ||
      hospital.city.toLowerCase().includes(hospitalSearchTerm.toLowerCase()) ||
      hospital.contactPerson.toLowerCase().includes(hospitalSearchTerm.toLowerCase());
    
    const matchesFilter = 
      hospitalFilter === 'all' ||
      (hospitalFilter === 'verified' && hospital.isVerified) ||
      (hospitalFilter === 'unverified' && !hospital.isVerified);
    
    return matchesSearch && matchesFilter;
  });
  
  // Filter donors based on search term and blood group filter
  const filteredDonors = donorData.filter(donor => {
    const matchesSearch = 
      donor.name.toLowerCase().includes(donorSearchTerm.toLowerCase()) ||
      donor.city.toLowerCase().includes(donorSearchTerm.toLowerCase()) ||
      donor.email.toLowerCase().includes(donorSearchTerm.toLowerCase());
    
    const matchesFilter = 
      donorFilter === 'all' ||
      donor.bloodGroup === donorFilter;
    
    console.log(`Filtering donor: ${donor.name}, bloodGroup: ${donor.bloodGroup}, donorFilter: ${donorFilter}, matches: ${matchesFilter}`);
    
    return matchesSearch && matchesFilter;
  });
  
  // Handle hospital verification/unverification
  const handleHospitalVerification = (hospital: HospitalData, action: 'verify' | 'unverify') => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
    const token = localStorage.getItem('token_admin') || localStorage.getItem('token') || user?.token;
    
    axios.post(`${API_URL}/api/admin/verify-hospital/${hospital._id}`, {
      isVerified: action === 'verify' ? true : false
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      toast.success(`Hospital ${action === 'verify' ? 'verified' : 'unverified'} successfully`);
      // Update hospital data
      setHospitalData(prevData => 
        prevData.map(h => 
          h._id === hospital._id ? { ...h, isVerified: !h.isVerified } : h
        )
      );
      // Close dialog if open
      if (hospitalDialogOpen) {
        setHospitalDialogOpen(false);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      toast.error(`Failed to ${action} hospital`);
    });
  };

    return (
    <div className="flex flex-col min-h-screen">
      {/* Donor Details Dialog */}
      <DonorDetailsDialog 
        open={donorDialogOpen} 
        onClose={() => setDonorDialogOpen(false)} 
        donor={selectedDonor} 
      />
      
      {/* Hospital Details Dialog */}
      <HospitalDetailsDialog 
        open={hospitalDialogOpen} 
        onClose={() => setHospitalDialogOpen(false)} 
        hospital={selectedHospital}
        onUnverify={() => selectedHospital && handleHospitalVerification(selectedHospital, 'unverify')}
        onVerify={() => selectedHospital && handleHospitalVerification(selectedHospital, 'verify')}
      />
      
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <StatCard
              title="Total Donors"
              value={totalDonors}
              icon={<UserCheck className="h-5 w-5 text-blood-600" />}
              description="Registered donors"
            />
            
            <StatCard
              title="Total Hospitals"
              value={totalHospitals}
              icon={<Hospital className="h-5 w-5 text-blood-600" />}
              description={`${verifiedHospitals} verified, ${pendingVerification} pending`}
            />
          </div>
          
          {/* Navigation Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card 
              className={`hover:shadow-md transition-all hover:border-yellow-500 border-2 ${activeSection === 'hospitals-pending' ? 'border-yellow-500' : 'border-transparent'} cursor-pointer`}
              onClick={() => showSection('hospitals-pending')}
            >
              <CardContent className="flex items-center p-6">
                <AlertCircle className="h-6 w-6 mr-3 text-yellow-600" />
                <span className="text-lg font-medium">Hospitals Pending Verification</span>
              </CardContent>
            </Card>
            
            <Card 
              className={`hover:shadow-md transition-all hover:border-blue-500 border-2 ${activeSection === 'manage-hospitals' ? 'border-blue-500' : 'border-transparent'} cursor-pointer`}
              onClick={() => showSection('manage-hospitals')}
            >
              <CardContent className="flex items-center p-6">
                <Building className="h-6 w-6 mr-3 text-blue-600" />
                <span className="text-lg font-medium">Manage Hospitals</span>
              </CardContent>
            </Card>
            
            <Card 
              className={`hover:shadow-md transition-all hover:border-green-500 border-2 ${activeSection === 'manage-donors' ? 'border-green-500' : 'border-transparent'} cursor-pointer`}
              onClick={() => showSection('manage-donors')}
            >
              <CardContent className="flex items-center p-6">
                <UserCheck className="h-6 w-6 mr-3 text-green-600" />
                <span className="text-lg font-medium">Manage Donors</span>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content Area - Conditionally rendered based on activeSection */}
          {activeSection === null ? (
            /* Empty dashboard state - No sections shown when no section is active */
            <div className="text-center py-12">
              <p className="text-gray-500 mb-6">Select a section from the navigation buttons above to view content.</p>
            </div>
          ) : (
            /* Full Page Views */
            <div>
              {/* Hospitals Pending Verification Full Page */}
              {activeSection === 'hospitals-pending' && (
                <Card className="w-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
                        Hospitals Pending Verification
                      </CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={goBackToDashboard}
                        className="flex items-center"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blood-600 mx-auto"></div>
                      </div>
                    ) : pendingVerification > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hospitalData
                          .filter(h => !h.isVerified)
                          .map((hospital) => (
                            <Card key={hospital._id} className="hover:shadow-lg transition-shadow duration-200 border-yellow-200">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{hospital.name}</h3>
                                    <div className="flex items-center text-sm text-gray-500 mb-2">
                                      <MapPin className="h-4 w-4 mr-2" />
                                      {hospital.city}, {hospital.state}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 mb-2">
                                      <User className="h-4 w-4 mr-2" />
                                      {hospital.contactPerson}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-2">
                                      Pending
                                    </span>
                                    <div className="bg-yellow-100 rounded-full w-8 h-8 flex items-center justify-center">
                                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    </div>
                                  </div>
                                </div>
                                

                                
                                <div className="flex flex-col gap-2">
                                  <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => {
                                      setSelectedHospital(hospital);
                                      setHospitalDialogOpen(true);
                                    }}
                                  >
                                    View Details
                                  </Button>
                                  <Button 
                                    variant="default" 
                                    className="w-full"
                                    onClick={() => handleHospitalVerification(hospital, 'verify')}
                                  >
                                    Verify Hospital
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No hospitals pending verification</p>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Manage Hospitals Full Page */}
              {activeSection === 'manage-hospitals' && (
                <Card className="w-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center">
                        <Building className="h-5 w-5 mr-2 text-blood-600" />
                        Manage Hospitals
                      </CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={goBackToDashboard}
                        className="flex items-center"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">View and manage all registered hospitals</p>
                  </CardHeader>
                  <CardContent>
                    {/* Search and Filter */}
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input 
                            placeholder="Search by name, location or contact person..." 
                            className="pl-9"
                            value={hospitalSearchTerm}
                            onChange={(e) => setHospitalSearchTerm(e.target.value)}
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <div className="w-40">
                            <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
                              <SelectTrigger>
                                <div className="flex items-center">
                                  <Filter className="mr-2 h-4 w-4" />
                                  <SelectValue placeholder="All Hospitals" />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Hospitals</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="unverified">Unverified</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hospitals List */}
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blood-600 mx-auto"></div>
                      </div>
                    ) : filteredHospitals.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredHospitals.map((hospital) => (
                          <Card key={hospital._id} className="hover:shadow-lg transition-shadow duration-200">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{hospital.name}</h3>
                                  <div className="flex items-center text-sm text-gray-500 mb-2">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    {hospital.city}, {hospital.state}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500 mb-2">
                                    <User className="h-4 w-4 mr-2" />
                                    {hospital.contactPerson}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                                    hospital.isVerified 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {hospital.isVerified ? 'Verified' : 'Unverified'}
                                  </span>
                                  <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">
                                    <Building className="h-4 w-4 text-blue-600" />
                                  </div>
                                </div>
                              </div>
                              

                              
                              <div className="flex flex-col gap-2">
                                <Button 
                                  variant="outline" 
                                  className="w-full"
                                  onClick={() => {
                                    setSelectedHospital(hospital);
                                    setHospitalDialogOpen(true);
                                  }}
                                >
                                  View Details
                                </Button>
                                
                                {!hospital.isVerified && (
                                  <Button 
                                    variant="default" 
                                    className="w-full"
                                    onClick={() => handleHospitalVerification(hospital, 'verify')}
                                  >
                                    Verify Hospital
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No hospitals found</p>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Manage Donors Full Page */}
              {activeSection === 'manage-donors' && (
                <Card className="w-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center">
                        <UserCheck className="h-5 w-5 mr-2 text-blood-600" />
                        Manage Donors
                      </CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={goBackToDashboard}
                        className="flex items-center"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">View and manage all registered donors</p>
                  </CardHeader>
                  <CardContent>
                    {/* Search and Filter */}
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input 
                            placeholder="Search by name, location or blood group..." 
                            className="pl-9"
                            value={donorSearchTerm}
                            onChange={(e) => setDonorSearchTerm(e.target.value)}
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <div className="w-40">
                            <Select 
                              value={selectedBloodGroup} 
                              onValueChange={(value) => {
                                console.log('Blood type selected:', value);
                                setSelectedBloodGroup(value);
                                // Directly update donorFilter here as well
                                if (value === 'All Types') {
                                  setDonorFilter('all');
                                } else {
                                  setDonorFilter(value);
                                }
                              }}
                            >
                              <SelectTrigger>
                                <div className="flex items-center">
                                  <Filter className="mr-2 h-4 w-4" />
                                  <SelectValue placeholder="All Blood Types" />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="All Types">All Types</SelectItem>
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
                        </div>
                      </div>
                    </div>
                    
                    {/* Donors List */}
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blood-600 mx-auto"></div>
                      </div>
                    ) : filteredDonors.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDonors.map((donor) => (
                          <Card key={donor._id} className="hover:shadow-lg transition-shadow duration-200">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{donor.name}</h3>
                                  <div className="flex items-center text-sm text-gray-500 mb-2">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    {donor.city}, {donor.state}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500 mb-2">
                                    <User className="h-4 w-4 mr-2" />
                                    {donor.age}, {donor.gender}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blood-100 text-blood-800 mb-2">
                                    {donor.bloodGroup}
                                  </span>
                                  <div className="bg-blood-100 rounded-full w-8 h-8 flex items-center justify-center">
                                    <UserCheck className="h-4 w-4 text-blood-600" />
                                  </div>
                                </div>
                              </div>
                              

                              
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => {
                                  setSelectedDonor(donor);
                                  setDonorDialogOpen(true);
                                }}
                              >
                                View Details
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No donors found</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
