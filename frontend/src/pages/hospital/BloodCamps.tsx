import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Components
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Phone, User, Calendar as CalendarIcon, Plus, Users, AlertCircle } from 'lucide-react';

// Types
interface BloodCamp {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  contactInfo: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  interestedDonors: {
    donor: {
      _id: string;
      name: string;
      email: string;
      phone: string;
      bloodGroup: string;
    };
    status: 'registered' | 'attended' | 'no-show';
    registeredAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface NewCampForm {
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  contactInfo: string;
}

const BloodCamps: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bloodCamps, setBloodCamps] = useState<BloodCamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const validTabs = ['upcoming', 'completed'];
  const [newCampDialogOpen, setNewCampDialogOpen] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState<BloodCamp | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<NewCampForm>({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    contactInfo: ''
  });

  // Fetch blood camps
  useEffect(() => {
    const fetchBloodCamps = async () => {
      try {
        setLoading(true);
        // Only fetch upcoming or completed camps
        if (!validTabs.includes(activeTab)) {
          setActiveTab('upcoming');
          return;
        }
        
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
        const response = await axios.get(`${API_URL}/api/bloodcamp/hospital`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token_hospital') || user?.token}`
          },
          params: {
            status: activeTab
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

    fetchBloodCamps();
  }, [activeTab]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // No file handling needed anymore

  // Create new blood camp
  const handleCreateCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      const response = await axios.post(`${API_URL}/api/bloodcamp`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token_hospital') || user?.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Blood camp created successfully');
      setNewCampDialogOpen(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        time: '',
        contactInfo: ''
      });
      
      // Refresh blood camps list
      setActiveTab('upcoming');
    } catch (error) {
      console.error('Error creating blood camp:', error);
      toast.error('Failed to create blood camp');
    }
  };

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [campToCancel, setCampToCancel] = useState<string | null>(null);

  // Handle camp status update
  const handleUpdateStatus = async (campId: string, newStatus: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      if (newStatus === 'cancelled') {
        await axios.delete(`${API_URL}/api/bloodcamp/${campId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token_hospital') || user?.token}`
          }
        });
        toast.success('Blood camp cancelled successfully');
      } else {
        await axios.patch(`${API_URL}/api/bloodcamp/${campId}`, { status: newStatus }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token_hospital') || user?.token}`
          }
        });
        toast.success(`Blood camp ${newStatus}`);
      }
      
      // Refresh blood camps list
      const response = await axios.get(`${API_URL}/api/bloodcamp/hospital`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token_hospital') || user?.token}`
        },
        params: {
          status: activeTab
        }
      });
      setBloodCamps(response.data);
      setCancelDialogOpen(false);
      setCampToCancel(null);
    } catch (error) {
      console.error(`Error updating blood camp status:`, error);
      toast.error('Failed to update blood camp status');
    }
  };

  // Handle donor attendance update
  const handleUpdateAttendance = async (campId: string, donorId: string, status: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      await axios.patch(`${API_URL}/api/bloodcamp/${campId}/attendance/${donorId}`, { status }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token_hospital') || user?.token}`
        }
      });
      
      toast.success(`Donor status updated to ${status}`);
      
      // Update the selected camp data
      if (selectedCamp) {
        const updatedCamp = {...selectedCamp};
        const donorIndex = updatedCamp.interestedDonors.findIndex(d => d.donor._id === donorId);
        if (donorIndex !== -1) {
          updatedCamp.interestedDonors[donorIndex].status = status as 'registered' | 'attended' | 'no-show';
          setSelectedCamp(updatedCamp);
        }
      }
    } catch (error) {
      console.error('Error updating donor attendance:', error);
      toast.error('Failed to update donor attendance');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'registered': return 'bg-blue-100 text-blue-800';
      case 'attended': return 'bg-green-100 text-green-800';
      case 'no-show': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div>
          {/* Main content */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Blood Camps</h1>
              
              <Button 
                onClick={() => setNewCampDialogOpen(true)}
                disabled={!user?.isVerified}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Blood Camp
              </Button>
            </div>
            
            {!user?.isVerified && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Your hospital account needs to be verified before you can create blood camps.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab}>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blood-600"></div>
                  </div>
                ) : bloodCamps.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No blood camps found</h3>
                    <p className="text-gray-500 mb-6">
                      {activeTab === 'upcoming' ? 'You haven\'t scheduled any upcoming blood camps yet.' :
                       activeTab === 'ongoing' ? 'You don\'t have any ongoing blood camps.' :
                       activeTab === 'completed' ? 'You don\'t have any completed blood camps.' :
                       'You don\'t have any cancelled blood camps.'}
                    </p>
                    {activeTab === 'upcoming' && user?.isVerified && (
                      <Button onClick={() => setNewCampDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Blood Camp
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bloodCamps.map((camp) => (
                      <Card key={camp._id} className="overflow-hidden">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle>{camp.title}</CardTitle>
                            <Badge className={getStatusColor(camp.status || '')}>
                              {camp.status ? camp.status.charAt(0).toUpperCase() + camp.status.slice(1) : 'Unknown'}
                            </Badge>
                          </div>
                          <CardDescription>{camp.description ? camp.description.substring(0, 100) + '...' : 'No description available'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{formatDate(camp.date)}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{camp.time}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{camp.location}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Users className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{camp.interestedDonors.length} interested donors</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setSelectedCamp(camp);
                              setDetailsDialogOpen(true);
                            }}
                          >
                            View Details
                          </Button>
                          
                          {camp.status === 'ongoing' && (
                            <Button 
                              variant="default"
                              onClick={() => handleUpdateStatus(camp._id, 'completed')}
                            >
                              Complete Camp
                            </Button>
                          )}
                          
                          {(camp.status === 'upcoming' || camp.status === 'ongoing') && (
                            <Button 
                              variant="destructive"
                              onClick={() => {
                                setCampToCancel(camp._id);
                                setCancelDialogOpen(true);
                              }}
                            >
                              Cancel Camp
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Blood Camp</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this blood camp? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>No, Keep It</Button>
            <Button variant="destructive" onClick={() => campToCancel && handleUpdateStatus(campToCancel, 'cancelled')}>Yes, Cancel It</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Blood Camp Dialog */}
      <Dialog open={newCampDialogOpen} onOpenChange={setNewCampDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Blood Camp</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new blood donation camp.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateCamp}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Camp Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  name="date" 
                  type="date" 
                  value={formData.date} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input 
                  id="time" 
                  name="time" 
                  type="time" 
                  value={formData.time} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Information</Label>
                <Input 
                  id="contactInfo" 
                  name="contactInfo" 
                  value={formData.contactInfo} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  required 
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewCampDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Blood Camp
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Blood Camp Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl">
          {selectedCamp && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle>{selectedCamp.title}</DialogTitle>
                  <Badge className={getStatusColor(selectedCamp.status || '')}>
                    {selectedCamp.status ? selectedCamp.status.charAt(0).toUpperCase() + selectedCamp.status.slice(1) : 'Unknown'}
                  </Badge>
                </div>
                <DialogDescription>{selectedCamp.description}</DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div>
                  <h3 className="text-lg font-medium mb-4">Camp Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                      <div>
                        <p className="font-medium">Date</p>
                        <p>{formatDate(selectedCamp.date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-3 text-gray-500" />
                      <div>
                        <p className="font-medium">Time</p>
                        <p>{selectedCamp.time}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p>{selectedCamp.location}</p>
                      </div>
                    </div>
                    
                    {/* Contact information removed as it is confidential */}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Interested Donors ({selectedCamp.interestedDonors.length})</h3>
                  
                  {selectedCamp.interestedDonors.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Users className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">No donors have registered yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {selectedCamp.interestedDonors.map((item) => (
                        <Card key={item.donor?._id || `temp-${Math.random()}`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{item.donor?.name || 'Unknown Donor'}</h4>
                                <p className="text-sm text-gray-500">{item.donor?.email || 'No email provided'}</p>
                                <p className="text-sm text-gray-500">{item.donor?.city && item.donor?.state ? `${item.donor.city}, ${item.donor.state}` : 'Location not provided'}</p>
                                <div className="flex items-center mt-1">
                                  <div className="h-4 w-4 rounded-full bg-blood-600 mr-2"></div>
                                  <span className="text-sm font-medium">{item.donor?.bloodGroup || 'Unknown'}</span>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <Badge className={getStatusColor(item.status || '')}>
                                  {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Unknown'}
                                </Badge>
                                
                                {(selectedCamp.status === 'ongoing' || selectedCamp.status === 'completed') && (
                                  <div className="mt-2 space-x-2">
                                    {item.status !== 'attended' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-xs"
                                        onClick={() => handleUpdateAttendance(selectedCamp._id, item.donor._id, 'attended')}
                                      >
                                        Mark Attended
                                      </Button>
                                    )}
                                    
                                    {item.status !== 'no-show' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-xs"
                                        onClick={() => handleUpdateAttendance(selectedCamp._id, item.donor._id, 'no-show')}
                                      >
                                        Mark No-show
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                {selectedCamp.status === 'ongoing' && (
                  <Button 
                    variant="default"
                    onClick={() => {
                      handleUpdateStatus(selectedCamp._id, 'completed');
                      setDetailsDialogOpen(false);
                    }}
                  >
                    Complete Camp
                  </Button>
                )}
                
                {(selectedCamp.status === 'upcoming' || selectedCamp.status === 'ongoing') && (
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      setCampToCancel(selectedCamp._id);
                      setCancelDialogOpen(true);
                      setDetailsDialogOpen(false);
                    }}
                  >
                    Cancel Camp
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

export default BloodCamps;