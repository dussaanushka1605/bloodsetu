import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Calendar, Building2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Hospital {
  _id: string;
  name: string;
  email: string;
  licenseNumber: string;
  location: string;
  city: string;
  state: string;
  contactPerson: string;
  createdAt: string;
  requestsMade: number;
  requestsCompleted: number;
}

const FindHospitals: React.FC = () => {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
        const response = await axios.get<Hospital[]>(`${API_URL}/api/donor/hospitals`, {
          headers: {
          Authorization: `Bearer ${localStorage.getItem('token_donor') || user?.token}`,
          'Content-Type': 'application/json'
        }
        });
        setHospitals(response.data);
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        toast.error('Failed to fetch hospitals');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchHospitals();
    }
  }, [user]);

  const handleViewDetails = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setIsDetailsDialogOpen(true);
  };

  const filteredHospitals = hospitals.filter(hospital => {
    return (
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8 px-4 bg-gray-50">
          <div className="container mx-auto">
            <p>Loading hospitals...</p>
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
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Find a Hospital</h1>
                <p className="text-gray-600 mb-4">Search for registered hospitals in your area</p>
                
                <div className="relative mb-6">
                  <Input
                    type="text"
                    placeholder="Search by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                
                {filteredHospitals.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-gray-500">No hospitals found matching your search criteria.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHospitals.map((hospital) => (
                      <Card key={hospital._id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg flex items-center">
                                {hospital.name}
                              </CardTitle>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{hospital.location}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end">
                              <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-blue-800" />
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pb-3">
                          {/* Registration date removed as requested */}
                        </CardContent>
                        
                        <CardFooter className="bg-gray-50 px-6 py-3 flex justify-between">
                          <Button 
                            onClick={() => handleViewDetails(hospital)}
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                          >
                            View Details
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hospital Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Hospital Details</DialogTitle>
              <DialogDescription>
                Information about this hospital
              </DialogDescription>
            </DialogHeader>

            {selectedHospital && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-blood-600" />
                    {selectedHospital.name}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm text-gray-500">Location:</span>
                    <span className="ml-1 font-medium">{selectedHospital.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <div className="h-4 w-4 mr-2 flex items-center justify-center">
                      <span className="text-xs">📧</span>
                    </div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <span className="ml-1 font-medium">{selectedHospital.email}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <div className="h-4 w-4 mr-2 flex items-center justify-center">
                      <span className="text-xs">📄</span>
                    </div>
                    <span className="text-sm text-gray-500">License Number:</span>
                    <span className="ml-1 font-medium">{selectedHospital.licenseNumber}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <div className="h-4 w-4 mr-2 flex items-center justify-center">
                      <span className="text-xs">👤</span>
                    </div>
                    <span className="text-sm text-gray-500">Contact Person:</span>
                    <span className="ml-1 font-medium">{selectedHospital.contactPerson}</span>
                  </div>
                  
                  {/* Registration date removed from dialog as requested */}
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

export default FindHospitals;