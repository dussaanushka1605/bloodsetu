import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "sonner";
import { Hospital, Donor } from '../types/bloodTypes';
import { silentFetch } from '../utils/authUtils';

type UserRole = 'donor' | 'hospital' | 'admin' | null;

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
  isVerified: boolean;
  licenseNumber?: string;
  phone?: string;
  city?: string;
  state?: string;
  location?: string;
  contactPerson?: string;
  requestsMade?: number;
  requestsCompleted?: number;
  bloodType?: string;
  bloodGroup?: string; // Added bloodGroup to match backend response
  age?: number;
  gender?: string;
  lastDonation?: string;
  donations?: number;
  createdAt?: string;
  // profilePicture field removed
}

interface AuthContextType {
  user: User | null;
  setUser?: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (userData: any, role: UserRole) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper function to get role-specific localStorage key
  const getUserStorageKey = (role: UserRole): string => {
    return `user_${role}`;
  };

  useEffect(() => {
    // Check URL path to determine which user type to restore
    const path = window.location.pathname;
    let userRole: UserRole = null;
    
    if (path.includes('/donor')) {
      userRole = 'donor';
    } else if (path.includes('/hospital')) {
      userRole = 'hospital';
    } else if (path.includes('/admin')) {
      userRole = 'admin';
    }
    
    // If we can determine the role from the URL, try to load that specific user
    if (userRole) {
      const storageKey = getUserStorageKey(userRole);
      const storedUser = localStorage.getItem(storageKey);
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          if (!parsedUser._id || !parsedUser.role) {
            console.error(`Invalid ${userRole} data in localStorage - missing _id or role`);
            localStorage.removeItem(storageKey);
            setUser(null);
            setIsAuthenticated(false);
          } else {
            console.log(`Restored ${userRole} from localStorage:`, parsedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error(`Failed to parse ${userRole} from localStorage`, error);
          localStorage.removeItem(storageKey);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // No stored user for this role
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      // If we can't determine role from URL, don't set any user
      // This allows multiple user roles to remain logged in simultaneously
      setUser(null);
      setIsAuthenticated(false);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      const response = await silentFetch(`${API_URL}/api/auth/login/${role}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login response data:', data);

      let loggedInUser: User | null = null;

      if (role === 'admin' && data.admin) {
        const adminData = data.admin;
        loggedInUser = {
          _id: adminData.id || adminData._id || 'admin',
          name: adminData.name || 'Admin',
          email: adminData.email,
          role: 'admin',
          token: data.token,
          isVerified: true
        };
      } else if (role === 'hospital' && data.hospital) {
        const hospitalData = data.hospital;
        if (!hospitalData.isVerified) {
          toast.warning('Login successful! Your hospital is pending admin verification.');
        }
        loggedInUser = {
          _id: hospitalData.id || hospitalData._id,
          name: hospitalData.name,
          email: hospitalData.email,
          role: 'hospital',
          token: data.token,
          isVerified: hospitalData.isVerified,
          licenseNumber: hospitalData.licenseNumber,
          phone: hospitalData.phone,
          city: hospitalData.city,
          state: hospitalData.state,
          location: hospitalData.city,
          contactPerson: hospitalData.contactPerson || 'N/A',
          requestsMade: hospitalData.requestsMade || 0,
          requestsCompleted: hospitalData.requestsCompleted || 0,
          createdAt: hospitalData.createdAt,
          profilePicture: hospitalData.profilePicture || null
        };
        
        console.log('Hospital data after mapping:', loggedInUser);
      } else if (role === 'donor' && data.donor) {
        const donorData = data.donor;
        loggedInUser = {
          _id: donorData.id || donorData._id,
          name: donorData.name,
          email: donorData.email,
          role: 'donor',
          token: data.token,
          isVerified: true,
          bloodType: donorData.bloodType || donorData.bloodGroup,
          bloodGroup: donorData.bloodGroup || donorData.bloodType,
          age: donorData.age,
          gender: donorData.gender,
          location: donorData.location || donorData.city,
          phone: donorData.contactNumber || donorData.phone,
          city: donorData.city,
          state: donorData.state,
          lastDonation: donorData.lastDonation,
          donations: donorData.donations,
          createdAt: donorData.createdAt
        };
      } else {
        console.error('Login response missing expected data for role:', role, data);
        throw new Error('Login failed: Invalid data received from server.');
      }

      console.log('Constructed user object:', loggedInUser);

      if (!loggedInUser._id) {
        console.error('User object missing _id:', loggedInUser);
        throw new Error('Failed to create valid user object (missing ID)');
      }

      setUser(loggedInUser);
      setIsAuthenticated(true);
      
      // Store user data in role-specific localStorage key only
      const storageKey = getUserStorageKey(loggedInUser.role);
      localStorage.setItem(storageKey, JSON.stringify(loggedInUser));
      localStorage.setItem(`token_${loggedInUser.role}`, data.token);
      
      toast.success('Login successful!');

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
      
      // Only clear the role-specific storage for the current login attempt
      if (role) {
        const storageKey = getUserStorageKey(role);
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`token_${role}`);
      }
      
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any, role: UserRole): Promise<User> => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      const response = await silentFetch(`${API_URL}/api/auth/register/${role}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      let user: User;

      if (role === 'admin') {
        user = {
          _id: data.admin._id,
          name: data.admin.name,
          email: data.admin.email,
          role: role,
          token: data.token,
          isVerified: true
        };
      } else if (role === 'hospital') {
        user = {
          _id: data.hospital._id,
          name: data.hospital.name,
          email: data.hospital.email,
          role: role,
          token: data.token,
          isVerified: data.hospital.isVerified
        };
      } else {
        user = {
          _id: data.donor._id,
          name: data.donor.name,
          email: data.donor.email,
          role: role,
          token: data.token,
          bloodType: data.donor.bloodGroup,
          location: data.donor.address,
          isVerified: true
        };
      }

      setUser(user);
      setIsAuthenticated(true);
      
      // Store user data in role-specific localStorage key only
      const storageKey = getUserStorageKey(user.role);
      localStorage.setItem(storageKey, JSON.stringify(user));
      localStorage.setItem(`token_${user.role}`, data.token);
      
      toast.success('Registration successful!');
      return user;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log("Logging out...");
    
    // Only clear role-specific storage for the current user
    if (user && user.role) {
      const storageKey = getUserStorageKey(user.role);
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`token_${user.role}`);
      
      setUser(null);
      setIsAuthenticated(false);
      toast.info(`You have been logged out from ${user.role} account`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
