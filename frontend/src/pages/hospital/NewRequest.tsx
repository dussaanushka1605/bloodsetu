import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BLOOD_TYPES } from '@/types/bloodTypes';
import axios from 'axios';

const NewRequest: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [bloodType, setBloodType] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bloodType || !contactPerson || !contactNumber) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!user) {
      toast.error('Please log in to create a blood request');
      return;
    }
    
    if (user.role !== 'hospital') {
      toast.error('Only hospitals can create blood requests');
      return;
    }
    
    if (!user.isVerified) {
      toast.error('Your hospital account needs to be verified before you can create blood requests');
      return;
    }
    
    try {

      const requestPayload = {
        bloodType,
        contactPerson,
        contactNumber,
        urgent: isUrgent
      };

      console.log('Sending request payload:', requestPayload);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      const response = await axios.post(`${API_URL}/api/hospital/blood-requests`, requestPayload, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json'
        }
      });

      console.log('Server response:', response.data);

      if (response.data) {
        toast.success('Blood request created successfully');
        navigate('/hospital/dashboard');
      }
    } catch (error: any) {
      console.error('Error creating blood request:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        requestPayload: error.config?.data
      });

      if (error?.response?.status === 400) {
        const errorMessage = error.response.data?.message || 'Invalid request data';
        const details = error.response.data?.details;
        if (details) {
          const detailMessages = Object.values(details).filter(Boolean).join(', ');
          toast.error(`Failed to create blood request: ${detailMessages}`);
        } else {
          toast.error(`Failed to create blood request: ${errorMessage}`);
        }
      } else if (error?.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
      } else if (error?.response?.status === 404) {
        toast.error('The requested endpoint was not found. Please try again.');
      } else {
        toast.error(error?.message || 'Failed to create blood request');
      }
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-12 px-4 bg-gray-50">
        <div className="container mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>New Blood Donation Request</CardTitle>
              <CardDescription>
                Create a new request for blood donation to match with eligible donors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type Required</Label>
                  <Select 
                    value={bloodType}
                    onValueChange={setBloodType}
                    required
                  >
                    <SelectTrigger id="bloodType">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input 
                      id="contactPerson"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Name of contact person"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input 
                      id="contactNumber"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="Phone number for inquiries"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch 
                    id="urgent"
                    checked={isUrgent}
                    onCheckedChange={setIsUrgent}
                  />
                  <Label htmlFor="urgent" className="font-medium text-red-600">
                    This is an urgent request (emergency)
                  </Label>
                </div>
                
                <div className="flex flex-wrap justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/hospital/dashboard')}
                    className="flex-shrink-0"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-shrink-0"
                  >
                    Create Request
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NewRequest;
