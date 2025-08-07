import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const DonorProfile: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bloodGroup: '',
    age: '',
    gender: '',
    city: '',
    state: '',
    phone: '',
    isAvailable: true,
    // profilePicture field removed as requested
  });
  
  // Profile picture related state variables removed as requested
  const [originalData, setOriginalData] = useState<any>({});

  useEffect(() => {
    if (user) {
      const donorData = {
        name: user.name || '',
        email: user.email || '',
        bloodGroup: user.bloodGroup || user.bloodType || '',
        age: user.age?.toString() || '',
        gender: user.gender || '',
        phone: user.phone || '',
        city: user.city || '',
        state: user.state || '',
        isAvailable: user.isAvailable !== false
        // profilePicture removed as requested
      };
      setProfileData(donorData);
      setOriginalData(donorData);
      
      // Profile data loaded
    }
  }, [user]);

  // Force refresh profile data when user changes
  useEffect(() => {
    if (user && !isEditing) {
      const donorData = {
        name: user.name || '',
        email: user.email || '',
        bloodGroup: user.bloodGroup || user.bloodType || '',
        age: user.age?.toString() || '',
        gender: user.gender || '',
        phone: user.phone || '',
        city: user.city || '',
        state: user.state || '',
        isAvailable: user.isAvailable !== false
      };
      setProfileData(donorData);
      console.log('Profile data refreshed from user:', donorData);
    }
  }, [user, isEditing]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validate required fields
      if (!profileData.name || !profileData.bloodGroup || !profileData.age || !profileData.gender) {
        toast.error('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      console.log('Sending profile update request...');
      console.log('Profile data to send:', profileData);
      
      if (!user) {
        throw new Error('Authentication data not found. Please log in again.');
      }
      
      // Get token from user object or role-specific storage
      let token = user.token;
      if (!token) {
        const roleToken = localStorage.getItem(`token_${user.role}`);
        if (roleToken) {
          token = roleToken;
        } else {
          token = localStorage.getItem('token');
        }
      }
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      const response = await fetch(`${API_URL}/api/donor/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        let errorMessage = 'Failed to update profile';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('Server error:', errorData);
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      const updatedUser = await response.json();
      console.log('Profile updated successfully:', updatedUser);
      console.log('Original user data:', user);
      console.log('New user data will be:', { ...user, ...updatedUser });
      
      const newUserData = { ...user, ...updatedUser };
      const storageKey = user.role === 'admin' ? 'user_admin' : 
                         user.role === 'donor' ? 'user_donor' : 
                         user.role === 'hospital' ? 'user_hospital' : 'user';
      
      localStorage.setItem(storageKey, JSON.stringify(newUserData));
      if (setUser) setUser(newUserData);
      
      // Update the profile data with the new values from the server
      const updatedProfileData = {
        name: updatedUser.name || profileData.name,
        email: updatedUser.email || profileData.email,
        bloodGroup: updatedUser.bloodGroup || updatedUser.bloodType || profileData.bloodGroup,
        age: updatedUser.age?.toString() || profileData.age,
        gender: updatedUser.gender || profileData.gender,
        phone: updatedUser.phone || profileData.phone,
        city: updatedUser.city || profileData.city,
        state: updatedUser.state || profileData.state,
        isAvailable: updatedUser.isAvailable !== false
      };
      
      setProfileData(updatedProfileData);
      setOriginalData(updatedProfileData);
      setIsEditing(false);
      
      // Fetch the latest profile data from server to ensure we have the most up-to-date information
      try {
        const profileResponse = await fetch(`${API_URL}/api/donor/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (profileResponse.ok) {
          const latestProfile = await profileResponse.json();
          console.log('Latest profile from server:', latestProfile);
          
          // Update the user data with the latest information
          const latestUserData = { ...user, ...latestProfile };
          localStorage.setItem(storageKey, JSON.stringify(latestUserData));
          if (setUser) setUser(latestUserData);
        }
      } catch (fetchError) {
        console.error('Error fetching latest profile:', fetchError);
      }
      
      // Force a small delay to ensure state updates
      setTimeout(() => {
        toast.success('Profile updated successfully!');
      }, 100);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
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
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600">Please log in to view your profile.</p>
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
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Donor Profile</h1>
                  <p className="text-gray-600">Manage your profile information</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">

                {/* Profile Information Section */}
                <div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Profile Information</CardTitle>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button 
                            onClick={handleSave} 
                            disabled={isLoading}
                            className="flex items-center"
                          >
                            <Save className="mr-2 h-4 w-4" />
                            {isLoading ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button variant="outline" onClick={handleCancel}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setIsEditing(true)} className="flex items-center">
                          <Edit className="mr-2 h-4 w-4" />
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
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
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
                      <Label htmlFor="bloodGroup">Blood Group</Label>
                      <Select 
                        value={profileData.bloodGroup} 
                        onValueChange={(value) => setProfileData({...profileData, bloodGroup: value})}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
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

                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={profileData.age}
                        onChange={(e) => setProfileData({...profileData, age: e.target.value})}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
                        min="18"
                        max="65"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select 
                        value={profileData.gender} 
                        onValueChange={(value) => setProfileData({...profileData, gender: value})}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profileData.city}
                        onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={profileData.state}
                        onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isAvailable"
                          checked={profileData.isAvailable}
                          onCheckedChange={(checked) => setProfileData({...profileData, isAvailable: checked})}
                          disabled={!isEditing}
                        />
                        <Label htmlFor="isAvailable">Available for donation</Label>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        When enabled, hospitals can find you for blood requests
                      </p>
                    </div>


                  </div>
                </CardContent>
              </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DonorProfile;