import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

// Components
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Phone, User, Calendar as CalendarIcon, Building2, Users } from 'lucide-react';

// Types
interface BloodCamp {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  contactInfo: string;
  hospital: {
    _id: string;
    name: string;
    location: string;
  };
  isInterested: boolean;
  interestedDonorsCount: number;
  createdAt: string;
  updatedAt: string;
}

const DonorBloodCamps: React.FC = () => {
  const { user } = useAuth();
  const [bloodCamps, setBloodCamps] = useState<BloodCamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCamp, setSelectedCamp] = useState<BloodCamp | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Fetch blood camps
  useEffect(() => {
    const fetchBloodCamps = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
        const response = await axios.get(`${API_URL}/api/bloodcamp/donor`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token_donor') || user?.token}`
          },
          params: {
            interested: activeTab === 'interested' ? 'true' : undefined
          }
        });
        setBloodCamps(response.data);
      } catch (error) {
        console.error('Error fetching blood camps:', error);
        toast.error('Failed to load blood camps');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchBloodCamps();
      
      // Set up interval to refresh data every 15 seconds for real-time updates
      const intervalId = setInterval(() => {
        fetchBloodCamps();
      }, 15000);
      
      return () => clearInterval(intervalId);
    }
  }, [activeTab, user]);

  // Handle showing camp details
  const handleViewDetails = (camp: BloodCamp) => {
    setSelectedCamp(camp);
    setDetailsDialogOpen(true);
  };

  // Handle registering interest
  const handleRegisterInterest = async (campId: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      const response = await axios.post(`${API_URL}/api/bloodcamp/${campId}/interest`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token_donor') || user?.token}`
        }
      });
      
      toast.success('Successfully registered interest in blood camp');
      
      // Update local state with the returned count from the backend
      const { bloodCamp } = response.data;
      
      setBloodCamps(prev => 
        prev.map(camp => 
          camp._id === campId 
            ? { ...camp, isInterested: true, interestedDonorsCount: bloodCamp.interestedDonorsCount } 
            : camp
        )
      );

      // Update selected camp if open
      if (selectedCamp && selectedCamp._id === campId) {
        setSelectedCamp({
          ...selectedCamp,
          isInterested: true,
          interestedDonorsCount: bloodCamp.interestedDonorsCount
        });
      }
      
      // Immediately fetch updated data for the interested tab to ensure real-time updates
      if (activeTab === 'all') {
        const response = await axios.get(`${API_URL}/api/bloodcamp/donor`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token_donor') || user?.token}`
          },
          params: {
            interested: 'true'
          }
        });
        // We don't update the current view but ensure the data is fresh when user switches tabs
      }
    } catch (error) {
      console.error('Error registering interest:', error);
      toast.error('Failed to register interest');
    }
  };

  // Handle cancelling interest
  const handleCancelInterest = async (campId: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      const response = await axios.delete(`${API_URL}/api/bloodcamp/${campId}/interest`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token_donor') || user?.token}`
        }
      });
      
      toast.success('Successfully cancelled interest in blood camp');
      
      // Update local state with the returned count from the backend
      const { interestedDonorsCount, bloodCampId } = response.data;
      
      setBloodCamps(prev => 
        prev.map(camp => 
          camp._id === campId 
            ? { ...camp, isInterested: false, interestedDonorsCount: interestedDonorsCount } 
            : camp
        )
      );

      // Update selected camp if open
      if (selectedCamp && selectedCamp._id === campId) {
        setSelectedCamp({
          ...selectedCamp,
          isInterested: false,
          interestedDonorsCount: interestedDonorsCount
        });
      }
      
      // If we're in the interested tab, remove this camp from the list
      if (activeTab === 'interested') {
        setBloodCamps(prev => prev.filter(camp => camp._id !== campId));
      }
    } catch (error) {
      console.error('Error cancelling interest:', error);
      toast.error('Failed to cancel interest');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-grow container mx-auto py-8 px-4">
        <div>
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Blood Donation Camps</h1>
            </div>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All Camps</TabsTrigger>
                <TabsTrigger value="interested">My Registered Camps</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blood-600"></div>
                  </div>
                ) : bloodCamps.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-gray-500">No blood camps available at the moment.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bloodCamps.map((camp) => (
                      <Card key={camp._id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl">{camp.title}</CardTitle>
                          <CardDescription className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1 text-gray-500" />
                            {camp.hospital?.name}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="pb-2">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{camp.location}</span>
                            </div>
                            
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{format(parseISO(camp.date), 'PPP')}</span>
                            </div>
                            
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{camp.time}</span>
                            </div>
                            
                            <div className="flex items-center text-sm">
                              <Users className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{camp.interestedDonorsCount} donors registered</span>
                            </div>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="pt-2 flex justify-between">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(camp)}>
                            View Details
                          </Button>
                          
                          {camp.isInterested ? (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleCancelInterest(camp._id)}
                            >
                              Cancel Registration
                            </Button>
                          ) : (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleRegisterInterest(camp._id)}
                            >
                              Register Interest
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="interested" className="mt-4">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blood-600"></div>
                  </div>
                ) : bloodCamps.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-gray-500">You haven't registered for any blood camps yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bloodCamps.map((camp) => (
                      <Card key={camp._id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl">{camp.title}</CardTitle>
                          <CardDescription className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1 text-gray-500" />
                            {camp.hospital?.name}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="pb-2">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{camp.location}</span>
                            </div>
                            
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{format(parseISO(camp.date), 'PPP')}</span>
                            </div>
                            
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{camp.time}</span>
                            </div>
                            
                            <div className="flex items-center text-sm">
                              <Users className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{camp.interestedDonorsCount} donors registered</span>
                            </div>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="pt-2 flex justify-between">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(camp)}>
                            View Details
                          </Button>
                          
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCancelInterest(camp._id)}
                          >
                            Cancel Registration
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Camp Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedCamp && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCamp.title}</DialogTitle>
                <DialogDescription className="flex items-center">
                  <Building2 className="h-4 w-4 mr-1 text-gray-500" />
                  {selectedCamp.hospital?.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{selectedCamp.location}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{format(parseISO(selectedCamp.date), 'PPP')}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{selectedCamp.time}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{selectedCamp.contactInfo}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{selectedCamp.interestedDonorsCount} donors registered</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Description</h4>
                    <p className="text-sm text-gray-600">{selectedCamp.description}</p>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                {selectedCamp.isInterested ? (
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      handleCancelInterest(selectedCamp._id);
                      setDetailsDialogOpen(false);
                    }}
                  >
                    Cancel Registration
                  </Button>
                ) : (
                  <Button 
                    variant="default"
                    onClick={() => {
                      handleRegisterInterest(selectedCamp._id);
                      setDetailsDialogOpen(false);
                    }}
                  >
                    Register Interest
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default DonorBloodCamps;