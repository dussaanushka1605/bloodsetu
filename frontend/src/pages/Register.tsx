import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from "sonner";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const Register: React.FC = () => {
  const { register, login } = useAuth();
  const { addDonor, addHospital } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse role from URL query params
  const queryParams = new URLSearchParams(location.search);
  const roleParam = queryParams.get('role');
  
  const [activeTab, setActiveTab] = useState<string>(roleParam || 'donor');
  const [isLoading, setIsLoading] = useState(false);
  
  // Donor form state
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPassword, setDonorPassword] = useState('');
  const [donorBloodType, setDonorBloodType] = useState('');
  const [donorAge, setDonorAge] = useState('');
  const [donorGender, setDonorGender] = useState('');
  const [donorLocation, setDonorLocation] = useState('');
  const [donorState, setDonorState] = useState('');
  const [donorContactNumber, setDonorContactNumber] = useState('');
  const [donorAvailable, setDonorAvailable] = useState(true);
  
  // Hospital form state
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalEmail, setHospitalEmail] = useState('');
  const [hospitalPassword, setHospitalPassword] = useState('');
  const [hospitalLocation, setHospitalLocation] = useState('');
  const [hospitalState, setHospitalState] = useState('');
  const [hospitalContactPerson, setHospitalContactPerson] = useState('');
  const [hospitalContactNumber, setHospitalContactNumber] = useState('');
  const [hospitalLicenseNumber, setHospitalLicenseNumber] = useState('');
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    licenseNumber?: string;
    [key: string]: string | undefined;
  }>({});
  
  // Update URL when tab changes
  useEffect(() => {
    const newUrl = `/register?role=${activeTab}`;
    window.history.replaceState(null, '', newUrl);
  }, [activeTab]);
  
  // OTP modal state
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpRole, setOtpRole] = useState<'donor' | 'hospital' | null>(null);
  const [otpUserData, setOtpUserData] = useState<any>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Countdown for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Helper to join OTP digits
  const otpCode = otp.join('');

  // Request OTP and open modal
  const handleRequestOtp = async (userData: any, role: 'donor' | 'hospital') => {
    try {
      setIsLoading(true);
      setOtpError('');
      setOtp(['', '', '', '', '', '']);
      setOtpEmail(userData.email);
      setOtpRole(role);
      setOtpUserData(userData);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      const response = await fetch(`${API_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userData.email,
          userData: userData,
          role: role
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('OTP request failed:', data);
        
        // Check for duplicate license number error
        if (data.error && data.error.includes('licenseNumber')) {
          if (role === 'hospital') {
            setFormErrors(prev => ({
              ...prev,
              licenseNumber: 'This license number is already registered. Please use a different license number.'
            }));
          }
          toast.error('This license number is already registered.');
          return;
        }
        
        // Check for duplicate email error
        if (data.error && data.error.includes('email')) {
          toast.error('This email is already registered.');
          return;
        }
        
        toast.error(data.message || 'Failed to send OTP. Please try again.');
        return;
      }
      
      // If everything is successful, open the OTP modal
      setOtpModalOpen(true);
      setResendTimer(60);
      toast.success('OTP sent to your email.');
    } catch (err) {
      console.error('Error in OTP request:', err);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP and register
  const handleVerifyOtp = async () => {
    setIsVerifying(true);
    setOtpError('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      // Enhanced logging for debugging
      console.log('Sending OTP verification with:', {
        email: otpEmail,
        code: otpCode,
        role: otpRole,
        userData: otpUserData ? 'userData present' : 'userData missing'
      });
      
      // Validate OTP code before sending
      if (otpCode.length !== 6) {
        console.error('Invalid OTP code length:', otpCode.length);
        setOtpError('Please enter a valid 6-digit OTP code');
        setIsVerifying(false);
        return;
      }
      
      // Validate required fields
      if (!otpEmail || !otpRole) {
        console.error('Missing required fields:', { email: otpEmail, role: otpRole });
        setOtpError('Missing required information. Please try again.');
        setIsVerifying(false);
        return;
      }
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: otpEmail,
          code: otpCode,
          userData: otpUserData,
          role: otpRole
        })
      });
      const data = await response.json();
      if (!response.ok) {
        console.error('OTP verification failed:', data);
        
        // Check for duplicate license number error
        if (data.error && data.error.includes('licenseNumber')) {
          setOtpError('This license number is already registered. Please use a different license number.');
          // Close OTP modal and return to registration form
          setOtpModalOpen(false);
          toast.error('This license number is already registered. Please use a different license number.');
          return;
        }
        
        // Improved error handling to handle object errors
        if (typeof data === 'object' && data !== null) {
          setOtpError(data.message || JSON.stringify(data) || 'Invalid OTP');
        } else {
          setOtpError(data.message || 'Invalid OTP');
        }
        return;
      }
      console.log('OTP verification successful:', data);
      setOtpModalOpen(false);
      // For hospitals, don't store user data since they need admin verification
      if (otpRole === 'hospital') {
        console.log('Hospital registered successfully. Redirecting to login for admin verification.');
        toast.success('Hospital registration successful! Please wait for admin verification before logging in.');
        navigate('/login');
        return;
      }
      
      // For donors, store user data for auto-login
      if (data && data.user && data.token && otpRole === 'donor') {
        console.log('Received user data after verification:', data.user);
        
        const user = {
          _id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: otpRole,
          token: data.token,
          isVerified: data.user.isVerified || false
        };
        
        // Store user data in role-specific storage
        const storageKey = 'user_donor';
        
        console.log('Storing user data in localStorage:', { storageKey, user });
        localStorage.setItem(storageKey, JSON.stringify(user));
        // Also store in legacy key for backward compatibility
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', data.token);
        
        // For donors, auto-login since they don't need admin verification
        if (login && otpUserData && otpUserData.password) {
          try {
            console.log('Calling login function from AuthContext for donor');
            await login(otpUserData.email, otpUserData.password, 'donor');
          } catch (error) {
            console.error('Error updating auth context:', error);
          }
        }
        
        // Redirect to dashboard
        console.log(`Redirecting to ${otpRole} dashboard`);
        window.location.href = otpRole === 'donor' ? '/donor/dashboard' : '/hospital/dashboard';
        return;
      } else if (data && data.token) {
        console.warn('Missing user data or token in response:', data);
      }
      // fallback redirect
      console.log('Using fallback redirect');
      window.location.href = otpRole === 'donor' ? '/donor/dashboard' : '/hospital/dashboard';
    } catch (err) {
      console.error('OTP verification error:', err);
      // Improved error handling
      if (err instanceof Error) {
        // Check for duplicate license number error
        if (err.message && err.message.includes('licenseNumber')) {
          setOtpError('This license number is already registered. Please use a different license number.');
          // Close OTP modal and return to registration form
          setOtpModalOpen(false);
          toast.error('This license number is already registered. Please use a different license number.');
          return;
        }
        setOtpError(`Failed to verify OTP: ${err.message}`);
      } else if (typeof err === 'object' && err !== null) {
        // Check for duplicate license number in object error
        const errString = JSON.stringify(err);
        if (errString.includes('licenseNumber')) {
          setOtpError('This license number is already registered. Please use a different license number.');
          // Close OTP modal and return to registration form
          setOtpModalOpen(false);
          toast.error('This license number is already registered. Please use a different license number.');
          return;
        }
        setOtpError(`Failed to verify OTP: ${errString}`);
      } else {
        setOtpError('Failed to verify OTP. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };
      
  // Resend OTP
  const handleResendOtp = async () => {
    setIsResending(true);
    setOtpError('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      await fetch(`${API_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail })
      });
      setResendTimer(60);
      toast.success('OTP resent.');
    } catch (err) {
      setOtpError('Failed to resend OTP.');
    } finally {
      setIsResending(false);
    }
  };
  
  const handleDonorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
      const backendData = {
        name: donorName,
        email: donorEmail,
        password: donorPassword,
        bloodGroup: donorBloodType,
        phone: donorContactNumber,
      city: donorLocation,
        state: donorState,
        age: parseInt(donorAge),
        gender: donorGender,
        isAvailable: donorAvailable
      };
    await handleRequestOtp(backendData, 'donor');
  };
  
  const handleHospitalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset form errors
    setFormErrors({});
    
    // Validate license number format
    const licenseNumberRegex = /^[A-Za-z0-9-]{6,15}$/;
    if (!licenseNumberRegex.test(hospitalLicenseNumber)) {
      setFormErrors(prev => ({
        ...prev,
        licenseNumber: 'License number must be 6-15 characters (letters, numbers, hyphens only)'
      }));
      return;
    }
    
    const backendData = {
      name: hospitalName,
      email: hospitalEmail,
      password: hospitalPassword,
      licenseNumber: hospitalLicenseNumber,
      phone: hospitalContactNumber,
      city: hospitalLocation,
      state: hospitalState,
      contactPerson: hospitalContactPerson
    };
    
    await handleRequestOtp(backendData, 'hospital');
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-12 px-4 bg-gray-50">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">Join RaktSetu</h1>
            <p className="text-gray-600 mt-2">Register as a donor or hospital</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Create an Account</CardTitle>
              <CardDescription>
                Fill in your details to register
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="donor">Donor</TabsTrigger>
                  <TabsTrigger value="hospital">Hospital</TabsTrigger>
                </TabsList>
                
                <TabsContent value="donor">
                  <form onSubmit={handleDonorRegister}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="donor-name">Full Name</Label>
                          <Input
                            id="donor-name"
                            placeholder="John Doe"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="donor-email">Email</Label>
                          <Input
                            id="donor-email"
                            type="email"
                            placeholder="john@example.com"
                            value={donorEmail}
                            onChange={(e) => setDonorEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="donor-password">Password</Label>
                          <Input
                            id="donor-password"
                            type="password"
                            value={donorPassword}
                            onChange={(e) => setDonorPassword(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="donor-blood-type">Blood Type</Label>
                          <Select 
                            value={donorBloodType} 
                            onValueChange={setDonorBloodType}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood type" />
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
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="donor-age">Age</Label>
                          <Input
                            id="donor-age"
                            type="number"
                            min="18"
                            max="65"
                            placeholder="25"
                            value={donorAge}
                            onChange={(e) => setDonorAge(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="donor-gender">Gender</Label>
                          <Select 
                            value={donorGender} 
                            onValueChange={setDonorGender}
                            required
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
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="donor-location">Location</Label>
                          <Input
                            id="donor-location"
                            placeholder="Enter your location"
                            value={donorLocation}
                            onChange={(e) => setDonorLocation(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="donor-state">State</Label>
                          <Input
                            id="donor-state"
                            placeholder="Enter your state"
                            value={donorState}
                            onChange={(e) => setDonorState(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="donor-contact">Contact Number</Label>
                          <Input
                            id="donor-contact"
                            placeholder="+91 9876543210"
                            value={donorContactNumber}
                            onChange={(e) => setDonorContactNumber(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="donor-available"
                          checked={donorAvailable}
                          onCheckedChange={setDonorAvailable}
                        />
                        <Label htmlFor="donor-available">
                          I am available to donate blood
                        </Label>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                      {isLoading ? 'Registering...' : 'Register as Donor'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="hospital">
                  <form onSubmit={handleHospitalRegister}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="hospital-name">Hospital Name</Label>
                          <Input
                            id="hospital-name"
                            placeholder="City Hospital"
                            value={hospitalName}
                            onChange={(e) => setHospitalName(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="hospital-email">Email</Label>
                          <Input
                            id="hospital-email"
                            type="email"
                            placeholder="contact@hospital.com"
                            value={hospitalEmail}
                            onChange={(e) => setHospitalEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="hospital-password">Password</Label>
                          <Input
                            id="hospital-password"
                            type="password"
                            value={hospitalPassword}
                            onChange={(e) => setHospitalPassword(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="hospital-license">License Number</Label>
                          <Input
                            id="hospital-license"
                            placeholder="HOSP123456"
                            value={hospitalLicenseNumber}
                            onChange={(e) => {
                              setHospitalLicenseNumber(e.target.value);
                              // Clear any previous errors when user types
                              if (formErrors.licenseNumber) {
                                setFormErrors(prev => ({ ...prev, licenseNumber: '' }));
                              }
                            }}
                            className={formErrors.licenseNumber ? 'border-red-500' : ''}
                            required
                          />
                          {formErrors.licenseNumber && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.licenseNumber}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="hospital-contact-person">Contact Person</Label>
                          <Input
                            id="hospital-contact-person"
                            placeholder="Dr. Smith"
                            value={hospitalContactPerson}
                            onChange={(e) => setHospitalContactPerson(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="hospital-contact-number">Contact Number</Label>
                          <Input
                            id="hospital-contact-number"
                            placeholder="+91 9876543210"
                            value={hospitalContactNumber}
                            onChange={(e) => setHospitalContactNumber(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="hospital-location">City</Label>
                          <Input
                            id="hospital-location"
                            placeholder="City"
                            value={hospitalLocation}
                            onChange={(e) => setHospitalLocation(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="hospital-state">State</Label>
                          <Input
                            id="hospital-state"
                            placeholder="State"
                            value={hospitalState}
                            onChange={(e) => setHospitalState(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p>Note: New hospital registrations require admin verification before accessing all features.</p>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                      {isLoading ? 'Registering...' : 'Register as Hospital'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <p className="text-sm text-center text-gray-600 mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-blood-600 hover:underline">
                  Login
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
      <Dialog open={otpModalOpen} onOpenChange={setOtpModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Verification</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code sent to <b>{otpEmail}</b>.<br />
              {resendTimer > 0 ? (
                <span>Resend available in {resendTimer}s</span>
              ) : (
                <Button variant="link" onClick={handleResendOtp} disabled={isResending}>
                  Resend Code
                </Button>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-2 my-4">
            {otp.map((digit, idx) => (
              <Input
                key={idx}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="w-12 text-center text-xl"
                value={digit}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  const newOtp = [...otp];
                  newOtp[idx] = val;
                  setOtp(newOtp);
                  // Move to next input
                  if (val && idx < 5) {
                    const next = document.getElementById(`otp-input-${idx+1}`);
                    if (next) (next as HTMLInputElement).focus();
                  }
                  // Log OTP code for debugging
                  console.log('Current OTP:', newOtp.join(''));
                }}
                onKeyDown={e => {
                  // Handle backspace to move to previous input
                  if (e.key === 'Backspace' && !digit && idx > 0) {
                    const prev = document.getElementById(`otp-input-${idx-1}`);
                    if (prev) (prev as HTMLInputElement).focus();
                  }
                }}
                id={`otp-input-${idx}`}
                autoFocus={idx === 0}
              />
            ))}
          </div>
          {otpError && <div className="text-red-500 text-center mb-2">{otpError}</div>}
          <DialogFooter>
            <Button onClick={handleVerifyOtp} disabled={otpCode.length !== 6 || isVerifying}>
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Register;
