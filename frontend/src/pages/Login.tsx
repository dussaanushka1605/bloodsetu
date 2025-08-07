import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract redirectTo from location state if available
  const redirectTo = location.state?.redirectTo;
  
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPassword, setDonorPassword] = useState('');
  const [hospitalEmail, setHospitalEmail] = useState('');
  const [hospitalPassword, setHospitalPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('donor');
  
  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotRole, setForgotRole] = useState<'donor'|'hospital'|null>(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resetOtp, setResetOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  // Helper to join OTP digits
  const resetOtpCode = resetOtp.join('');

  // Send reset OTP
  const handleSendResetOtp = async () => {
    setIsOtpLoading(true);
    setOtpError('');
    setOtpVerified(false);
    setResetError('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      const res = await fetch(`${API_URL}/api/auth/request-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, role: forgotRole })
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.message || 'Failed to send OTP');
        return;
      }
      setMaskedEmail(data.maskedEmail);
      setOtpSent(true);
    } catch (err) {
      setOtpError('Failed to send OTP');
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Verify reset OTP
  const handleVerifyResetOtp = async () => {
    setIsOtpLoading(true);
    setOtpError('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      const res = await fetch(`${API_URL}/api/auth/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: resetOtpCode })
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.message || 'Invalid OTP');
        return;
      }
      setOtpVerified(true);
    } catch (err) {
      setOtpError('Failed to verify OTP');
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    setIsResetting(true);
    setResetError('');
    if (resetPassword !== resetConfirm) {
      setResetError('Passwords do not match');
      setIsResetting(false);
      return;
    }
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, role: forgotRole, newPassword: resetPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setResetError(data.message || 'Failed to reset password');
        return;
      }
      setForgotOpen(false);
      toast.success('Password reset successful! Please login.');
      // Optionally, auto-login and redirect
      if (forgotRole === 'donor') {
        await login(forgotEmail, resetPassword, 'donor');
        navigate('/donor/dashboard');
      } else if (forgotRole === 'hospital') {
        await login(forgotEmail, resetPassword, 'hospital');
        navigate('/hospital/dashboard');
      }
    } catch (err) {
      setResetError('Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };
  
  const handleDonorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await login(donorEmail, donorPassword, 'donor');
      
      // Always navigate to dashboard
      navigate('/donor/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error instanceof Error ? error.message : 'Unable to connect to the server. Please make sure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleHospitalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await login(hospitalEmail, hospitalPassword, 'hospital');
      
      // Always navigate to dashboard
      navigate('/hospital/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error instanceof Error ? error.message : 'Unable to connect to the server. Please make sure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await login(adminEmail, adminPassword, 'admin');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error instanceof Error ? error.message : 'Unable to connect to the server. Please make sure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-12 px-4 bg-gray-50">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">Welcome to RaktSetu</h1>
            <p className="text-gray-600 mt-2">Log in to your account</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Choose your role and enter your credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="donor">Donor</TabsTrigger>
                  <TabsTrigger value="hospital">Hospital</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>
                
                <TabsContent value="donor">
                  <form onSubmit={handleDonorLogin}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="donor-email">Email</Label>
                        <Input
                          id="donor-email"
                          type="email"
                          value={donorEmail}
                          onChange={e => setDonorEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="donor-password">Password</Label>
                        <Input
                          id="donor-password"
                          type="password"
                          value={donorPassword}
                          onChange={e => setDonorPassword(e.target.value)}
                          required
                        />
                        <Button variant="link" className="p-0 h-auto text-xs" type="button" onClick={() => { setForgotRole('donor'); setForgotEmail(donorEmail); setForgotOpen(true); setOtpSent(false); setOtpVerified(false); setResetOtp(['','','','','','']); setResetPassword(''); setResetConfirm(''); setOtpError(''); setResetError(''); }}>
                          Forgot Password?
                        </Button>
                      </div>
                      <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login as Donor'}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="hospital">
                  <form onSubmit={handleHospitalLogin}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="hospital-email">Email</Label>
                        <Input
                          id="hospital-email"
                          type="email"
                          value={hospitalEmail}
                          onChange={e => setHospitalEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hospital-password">Password</Label>
                        <Input
                          id="hospital-password"
                          type="password"
                          value={hospitalPassword}
                          onChange={e => setHospitalPassword(e.target.value)}
                          required
                        />
                        <Button variant="link" className="p-0 h-auto text-xs" type="button" onClick={() => { setForgotRole('hospital'); setForgotEmail(hospitalEmail); setForgotOpen(true); setOtpSent(false); setOtpVerified(false); setResetOtp(['','','','','','']); setResetPassword(''); setResetConfirm(''); setOtpError(''); setResetError(''); }}>
                          Forgot Password?
                        </Button>
                      </div>
                      <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login as Hospital'}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="admin">
                  <form onSubmit={handleAdminLogin}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-email">Email</Label>
                        <Input
                          id="admin-email"
                          type="email"
                          value={adminEmail}
                          onChange={e => setAdminEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-password">Password</Label>
                        <Input
                          id="admin-password"
                          type="password"
                          value={adminPassword}
                          onChange={e => setAdminPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login as Admin'}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <p className="text-sm text-center text-gray-600 mt-4">
                Don't have an account?{' '}
                <Link to={`/register?role=${activeTab}`} className="text-blood-600 hover:underline">
                  Register
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogDescription>
              {otpSent
                ? `A 6-digit code has been sent to your email: ${maskedEmail}`
                : 'Enter your registered email to receive a reset code.'}
            </DialogDescription>
          </DialogHeader>
          {!otpSent && (
            <>
              <Input
                type="email"
                placeholder="Enter your registered email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                className="mb-2"
              />
              <div className="flex gap-2 mb-2">
                <Button onClick={() => { setForgotRole(activeTab as 'donor'|'hospital'); handleSendResetOtp(); }} disabled={isOtpLoading || !forgotEmail || activeTab === 'admin'}>
                  {isOtpLoading ? 'Sending...' : 'Send Code'}
                </Button>
              </div>
              {otpError && <div className="text-red-500 text-center mb-2">{otpError}</div>}
            </>
          )}
          {otpSent && !otpVerified && (
            <>
              <div className="flex justify-center gap-2 my-4">
                {resetOtp.map((digit, idx) => (
                  <Input
                    key={idx}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="w-12 text-center text-xl"
                    value={digit}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (!val) return;
                      const newOtp = [...resetOtp];
                      newOtp[idx] = val;
                      setResetOtp(newOtp);
                      // Move to next input
                      if (val && idx < 5) {
                        const next = document.getElementById(`reset-otp-input-${idx+1}`);
                        if (next) (next as HTMLInputElement).focus();
                      }
                    }}
                    id={`reset-otp-input-${idx}`}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
              <Button onClick={handleVerifyResetOtp} disabled={resetOtpCode.length !== 6 || isOtpLoading}>
                {isOtpLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
              {otpError && <div className="text-red-500 text-center mb-2">{otpError}</div>}
            </>
          )}
          {otpVerified && (
            <>
              <Input
                type="password"
                placeholder="New password"
                value={resetPassword}
                onChange={e => setResetPassword(e.target.value)}
                className="mb-2"
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={resetConfirm}
                onChange={e => setResetConfirm(e.target.value)}
                className="mb-2"
              />
              <Button onClick={handleResetPassword} disabled={isResetting || !resetPassword || !resetConfirm}>
                {isResetting ? 'Resetting...' : 'Reset Password'}
              </Button>
              {resetError && <div className="text-red-500 text-center mb-2">{resetError}</div>}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
