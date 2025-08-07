import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Edit, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import axios from 'axios';

interface HospitalProfileData {
  name: string;
  email: string;
  licenseNumber: string;
  phone: string;
  city: string;
  state: string;
  contactPerson: string;
  isVerified: boolean;
  // profilePicture field removed as requested
}

const HospitalProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<HospitalProfileData>({
    name: '',
    email: '',
    licenseNumber: '',
    phone: '',
    city: '',
    state: '',
    contactPerson: '',
    isVerified: false
    // profilePicture removed as requested
  });
  
  const [originalData, setOriginalData] = useState<HospitalProfileData>({
    name: '',
    email: '',
    licenseNumber: '',
    phone: '',
    city: '',
    state: '',
    contactPerson: '',
    isVerified: false
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        licenseNumber: user.licenseNumber || '',
        phone: user.phone || '',
        city: user.city || '',
        state: user.state || '',
        contactPerson: user.contactPerson || '',
        isVerified: user.isVerified || false
        // profilePicture removed as requested
      });
      setOriginalData({
        name: user.name || '',
        email: user.email || '',
        licenseNumber: user.licenseNumber || '',
        phone: user.phone || '',
        city: user.city || '',
        state: user.state || '',
        contactPerson: user.contactPerson || '',
        isVerified: user.isVerified || false
        // profilePicture removed as requested
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user || !user.token) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    setIsLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

    try {
      // Create FormData object for data upload
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('phone', profileData.phone);
      formData.append('city', profileData.city);
      formData.append('state', profileData.state);
      formData.append('contactPerson', profileData.contactPerson);
      
      // Profile picture handling removed as requested
      
      const response = await axios.patch(
        `${API_URL}/api/hospital/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            // Don't set Content-Type header when sending FormData
            // The browser will set it automatically with the correct boundary
          }
        }
      );
      
      const updatedUser = {
        ...user,
        name: profileData.name,
        phone: profileData.phone,
        city: profileData.city,
        state: profileData.state,
        contactPerson: profileData.contactPerson
        // profilePicture removed as requested
      };
      
      // Update the original data with all the new profile information
      setOriginalData({
        ...profileData
        // profilePicture removed as requested
      });

      // Store user data in role-specific storage
      const storageKey = updatedUser.role === 'admin' ? 'user_admin' : 
                         updatedUser.role === 'donor' ? 'user_donor' : 
                         updatedUser.role === 'hospital' ? 'user_hospital' : 'user';
      
      localStorage.setItem(storageKey, JSON.stringify(updatedUser));
      // Also store in legacy key for backward compatibility
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
  };

  // Profile picture related functions removed as requested

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="p-6">
            <p>You must be logged in to view this page.</p>
            <Button className="mt-4" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-6">

            <div className="flex flex-col space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isLoading}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSave}
                            disabled={isLoading}
                          >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => setIsEditing(true)}
                        >
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Profile Picture Section removed as requested */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Hospital Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        value={profileData.licenseNumber}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">License number cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        value={profileData.contactPerson}
                        onChange={(e) => setProfileData({...profileData, contactPerson: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profileData.city}
                        onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={profileData.state}
                        onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="verificationStatus">Verification Status</Label>
                      <Input
                        id="verificationStatus"
                        value={profileData.isVerified ? 'Verified' : 'Pending Verification'}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HospitalProfilePage;