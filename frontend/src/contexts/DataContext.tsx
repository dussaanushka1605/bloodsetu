import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "sonner";
import { BloodRequest, Donor, Hospital, BloodRequestPayload } from '../types/bloodTypes';
import { generateMockBloodRequests } from '../utils/mockData';
import axios from 'axios';
import { createAuthenticatedAxios, silentFetch } from '../utils/authUtils';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5002') + '/api';

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataContextType {
  bloodRequests: BloodRequest[];
  donors: Donor[];
  hospitals: Hospital[];
  addBloodRequest: (request: Omit<BloodRequest, '_id' | 'createdAt' | 'updatedAt'>) => Promise<BloodRequest>;
  updateBloodRequestStatus: (requestId: string, status: 'pending' | 'accepted' | 'completed' | 'cancelled' | 'rejected') => Promise<void>;
  getDonorById: (id: string) => Donor | undefined;
  getHospitalById: (id: string) => Hospital | null;
  getRequestById: (id: string) => BloodRequest | undefined;
  getDonorsByBloodType: (bloodType: string) => Donor[];
  getRequestsByHospital: (hospitalId: string) => BloodRequest[];
  getRequestsByDonor: (donorId: string, status?: string) => BloodRequest[];
  getBloodRequestsForDonor: (donorId: string) => BloodRequest[];
  getCompletedRequestsByDonorId: (donorId: string) => BloodRequest[];
  addDonor: (donor: Omit<Donor, '_id' | 'createdAt' | 'donations'>) => void;
  addHospital: (hospital: Omit<Hospital, '_id' | 'createdAt' | 'requestsMade' | 'requestsCompleted'>) => void;
  verifyHospital: (hospitalId: string, verified: boolean) => Promise<void>;
  getBloodRequests: () => Promise<void>;
  createBloodRequest: (request: BloodRequestPayload) => Promise<BloodRequest>;
}

interface BloodRequestResponse {
  _id: string;
  hospitalId: string;
  bloodType: string;
  contactPerson: string;
  contactNumber: string;
  urgent: boolean;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled' | 'rejected';
  notifiedDonors: string[];
  donorResponses: Array<{
    donor: string;
    response: 'accepted' | 'rejected';
    respondedAt: string;
  }>;
  acceptedBy?: string;
  createdAt: string;
  updatedAt: string;
  request: BloodRequest;
  message: string;
  notifiedDonorsCount: number;
}

interface BloodRequestUpdateResponse {
  request: BloodRequest;
  message: string;
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  // Fetch blood requests from backend
  useEffect(() => {
    const fetchBloodRequests = async () => {
      try {
        // Try to get user from role-specific storage first
        let storedUser = localStorage.getItem('user_admin') || localStorage.getItem('user_donor') || localStorage.getItem('user_hospital');
        
        // Fall back to legacy storage if needed
        if (!storedUser) {
          storedUser = localStorage.getItem('user');
        }

        if (!storedUser) {
          console.log('DataContext: No user found, skipping blood request fetch.');
          return;
        }
        const user = JSON.parse(storedUser);

        // Determine the endpoint based on user role
        let endpoint = '';
        if (user.role === 'hospital') {
          endpoint = `${API_URL}/hospital/blood-requests`;
        } else if (user.role === 'donor') {
          endpoint = `${API_URL}/donor/blood-requests`;
        } else if (user.role === 'admin') {
          console.log('DataContext: Skipping blood request fetch for admin role.');
          setBloodRequests([]);
          return;
        }

        if (!endpoint) {
            console.log('DataContext: No valid endpoint determined for blood requests.');
            return;
        }

        console.log('Fetching blood requests from:', endpoint);

        try {
          // Use silentFetch to handle 401 errors gracefully
          const response = await silentFetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`,
              'Accept': 'application/json'
            }
          });

          if (!response.ok) {
            if (response.status === 401) {
              // Token expired - this will be handled by silentFetch
              return;
            }
            const errorText = await response.text();
            console.error(`Error fetching blood requests (${endpoint}): ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Failed to fetch blood requests: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          console.log('Fetched blood requests:', data);
          setBloodRequests(data);
        } catch (fetchError) {
          // If it's an authentication error, don't show toast as it will be handled by silentFetch
          if (fetchError.message !== 'Authentication failed. Please log in again.') {
            toast.error(fetchError instanceof Error ? fetchError.message : 'Failed to fetch blood requests');
          }
        }
      } catch (error) {
        console.error('Error in fetchBloodRequests:', error);
        // Only show toast for non-auth errors
        if (error.message !== 'Authentication failed. Please log in again.') {
          toast.error(error instanceof Error ? error.message : 'Failed to fetch blood requests');
        }
      }
    };

    fetchBloodRequests();
  }, []);

  // Fetch real donors from backend
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        // Try to get user from role-specific storage first
        let storedUser = localStorage.getItem('user_admin') || localStorage.getItem('user_donor') || localStorage.getItem('user_hospital');
        
        // Fall back to legacy storage if needed
        if (!storedUser) {
          storedUser = localStorage.getItem('user');
        }

        if (!storedUser) {
          console.log('DataContext: No user found, skipping donor fetch.');
          return;
        }
        const user = JSON.parse(storedUser);
        console.log('Attempting to fetch donors...'); 

        // Determine endpoint based on role
        let endpoint = '';
        if (user.role === 'admin') {
            endpoint = `${API_URL}/admin/donors`;
            console.log('Using admin donors endpoint');
        } else if (user.role === 'hospital') {
            endpoint = `${API_URL}/hospital/search-donors`;
            console.log("DataContext: Skipping bulk donor fetch for hospital role (use search page).");
            setDonors([]);
            return;
        } else if (user.role === 'donor') {
            console.log("DataContext: Skipping bulk donor fetch for donor role.");
            setDonors([]);
            return;
        }

        if (!endpoint) {
            console.log('DataContext: No valid endpoint determined for donors.');
            return;
        }

        try {
          // Use silentFetch to handle 401 errors gracefully
          const response = await silentFetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`,
              'Accept': 'application/json'
            }
          });

          console.log('Donor fetch response status:', response.status);

          if (!response.ok) {
            if (response.status === 401) {
              // Token expired - this will be handled by silentFetch
              return;
            }
            const errorText = await response.text();
            console.error('Error response fetching donors:', {
              status: response.status,
              statusText: response.statusText,
              body: errorText
            });
            throw new Error(`Failed to fetch donors: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          console.log('Fetched donors data:', data);
          setDonors(data);
        } catch (fetchError) {
          // If it's an authentication error, don't show toast as it will be handled by silentFetch
          if (fetchError.message !== 'Authentication failed. Please log in again.') {
            toast.error(fetchError instanceof Error ? fetchError.message : 'Failed to fetch donors');
          }
          setDonors([]);
        }
      } catch (error) {
        console.error('Error in fetchDonors:', error);
        // Only show toast for non-auth errors
        if (error.message !== 'Authentication failed. Please log in again.') {
          toast.error(error instanceof Error ? error.message : 'Failed to fetch donors');
        }
        setDonors([]);
      }
    };

    fetchDonors();
  }, []);

  // Fetch real hospitals from backend
  const fetchHospitals = async () => {
    try {
      // Try to get user from role-specific storage first
      let storedUser = localStorage.getItem('user_admin') || localStorage.getItem('user_donor') || localStorage.getItem('user_hospital');
      
      // Fall back to legacy storage if needed
      if (!storedUser) {
        storedUser = localStorage.getItem('user');
      }

      if (!storedUser) {
        console.log('DataContext: No user found, skipping hospital fetch.');
        return;
      }
      const user = JSON.parse(storedUser);
      console.log('Current user role for hospital fetch:', user.role);

      // Determine endpoint based on user role
      let endpoint = '';
      if (user.role === 'hospital') {
          endpoint = `${API_URL}/hospital/profile`;
      } else if (user.role === 'admin') {
          endpoint = `${API_URL}/admin/hospitals`;
      } else if (user.role === 'donor') {
          console.log("DataContext: Skipping hospital fetch for donor role.");
          setHospitals([]);
          return;
      }

      if (!endpoint) {
          console.log('DataContext: No valid endpoint determined for hospitals.');
          return;
      }

      console.log('Fetching hospital data from:', endpoint);

      try {
        // Use silentFetch to handle 401 errors gracefully
        const response = await silentFetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired - this will be handled by silentFetch
            return;
          }
          const errorText = await response.text();
          console.error('Error response fetching hospitals:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
            endpoint: endpoint
          });
          throw new Error(`Failed to fetch hospitals: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Raw hospital data:', data);
        const hospitalsData = Array.isArray(data) ? data : [data];
        console.log('Processed hospital data:', hospitalsData);

        const mappedHospitals = hospitalsData.map((hospital: any) => ({
          _id: hospital._id || hospital.id,
            name: hospital.name,
            email: hospital.email,
          licenseNumber: hospital.licenseNumber,
          phone: hospital.phone,
            city: hospital.city || 'Not specified',
            state: hospital.state || 'Not specified',
            contactPerson: hospital.contactPerson || 'Not specified',
          isVerified: Boolean(hospital.isVerified),
            requestsMade: hospital.requestsMade || 0,
            requestsCompleted: hospital.requestsCompleted || 0,
          createdAt: hospital.createdAt,
          updatedAt: hospital.updatedAt || hospital.createdAt // Fallback to createdAt if updatedAt is not available
        }));

        console.log('Final mapped hospitals:', mappedHospitals);
        setHospitals(mappedHospitals);

        if (user.role === 'hospital' && hospitalsData.length === 1) {
          const hospital = hospitalsData[0];
          const userKey = 'user_hospital';
          const currentUser = JSON.parse(localStorage.getItem(userKey) || '{}');
          if (currentUser.isVerified !== hospital.isVerified) {
            const updatedUser = {
              ...currentUser,
              isVerified: hospital.isVerified
            };
            localStorage.setItem(userKey, JSON.stringify(updatedUser));
            console.log('Updated user verification status:', updatedUser.isVerified);
          }
        }
      } catch (fetchError) {
        // If it's an authentication error, don't show toast as it will be handled by silentFetch
        if (fetchError.message !== 'Authentication failed. Please log in again.') {
          toast.error(fetchError instanceof Error ? fetchError.message : 'Failed to fetch hospitals');
        }
        setHospitals([]);
      }
    } catch (error) {
      console.error('Error in fetchHospitals:', error);
      // Only show toast for non-auth errors
      if (error.message !== 'Authentication failed. Please log in again.') {
        toast.error(error instanceof Error ? error.message : 'Failed to fetch hospitals');
      }
      setHospitals([]);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  // Add a blood request
  const addBloodRequest = async (request: Omit<BloodRequest, '_id' | 'createdAt' | 'updatedAt'>): Promise<BloodRequest> => {
    try {
      // Try to get user from role-specific storage first
      let storedUser = localStorage.getItem('user_hospital');
      
      // Fall back to legacy storage if needed
      if (!storedUser) {
        storedUser = localStorage.getItem('user');
      }

      if (!storedUser) {
        console.error('No user found, cannot add blood request.');
        toast.error('You must be logged in to add a blood request.');
        throw new Error('User not authenticated');
      }

      const user = JSON.parse(storedUser);

      // Only hospitals can add blood requests
      if (user.role !== 'hospital') {
        console.error('Only hospitals can add blood requests.');
        toast.error('Only hospitals can add blood requests.');
        throw new Error('Only hospitals can add blood requests');
      }

      // Create an authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios();

      const response = await authenticatedAxios.post(
        `${API_URL}/hospital/blood-requests`, 
        request
      );

      const newRequest = response.data.request;
      setBloodRequests(prev => [...prev, newRequest]);
      toast.success('Blood request added successfully!');
      return newRequest;
    } catch (error) {
      console.error('Error in addBloodRequest:', error);
      // Only show toast for non-auth errors
      if (error.response?.status !== 401) {
        toast.error(error instanceof Error ? error.message : 'Failed to add blood request');
      }
      throw error;
    }
  };

  // Update blood request status
  const updateBloodRequestStatus = async (requestId: string, status: 'pending' | 'accepted' | 'completed' | 'cancelled' | 'rejected'): Promise<void> => {
        // Try to get user from role-specific storage first
        let storedUser = localStorage.getItem('user_admin') || localStorage.getItem('user_donor') || localStorage.getItem('user_hospital');
        
        // Fall back to legacy storage if needed
        if (!storedUser) {
          storedUser = localStorage.getItem('user');
        }
        
        if (!storedUser) {
          throw new Error('User not authenticated');
        }
    
        const user = JSON.parse(storedUser);
    const endpoint = user.role === 'donor'
      ? `${API_URL}/donor/blood-requests/${requestId}/respond`
      : `${API_URL}/hospital/blood-requests/${requestId}`;
    
    try {
      // Create an authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios();
      
      const apiResponse = await authenticatedAxios.post<BloodRequestUpdateResponse>(
        endpoint, 
        { response: status }
      );

      // Update local state with the updated request from the response
      setBloodRequests(prev => prev.map(req => 
        req._id === requestId ? apiResponse.data.request : req
      ));

      toast.success(apiResponse.data.message);
    } catch (error: any) {
      console.error('Error updating blood request:', error);
      // Only show toast for non-auth errors
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Failed to update blood request');
      }
      throw error;
    }
  };

  // Get donor by ID
  const getDonorById = (donor_id: string): Donor | undefined => {
    return donors.find(donor => donor._id === donor_id);
  };

  // Get hospital by ID
  const getHospitalById = (hospital_id: string): Hospital | null => {
    if (!hospital_id) {
        console.error("Invalid hospital ID provided:", hospital_id, new Error().stack); // Log stack trace
      return null;
    }
    console.log("Getting hospital by id:", hospital_id);
    console.log("Current hospitals state:", hospitals);
    const hospital = hospitals.find(h => h._id === hospital_id);
    if (!hospital) {
        console.warn("No hospital found with id:", hospital_id);
      return null;
    }
    return hospital;
  };

  // Get request by ID
  const getRequestById = (request_id: string): BloodRequest | undefined => {
    return bloodRequests.find(req => req._id === request_id);
  };

  // Get donors by blood type
  const getDonorsByBloodType = (bloodType: string): Donor[] => {
    return donors.filter(donor => donor.bloodGroup === bloodType);
  };

  // Get requests made by a specific hospital
  const getRequestsByHospital = (hospitalId: string): BloodRequest[] => {
    return bloodRequests.filter(req => req.hospitalId === hospitalId);
  };

  // Get requests relevant for a specific donor
  const getRequestsByDonor = (donorId: string, status?: string): BloodRequest[] => {
    if (!donorId) return [];
    return bloodRequests.filter(req => {
      // If status is specified, filter by it
      if (status && req.status !== status) return false;
      // Check if donor is in notifiedDonors array
      const isNotified = req.notifiedDonors?.includes(donorId);
      return isNotified;
    });
  };

  // Get requests relevant for a donor to potentially accept
  const getBloodRequestsForDonor = (donorId: string): BloodRequest[] => {
    if (!donorId) return [];
    
    return bloodRequests.filter(req => {
      // Only show pending requests
      if (req.status !== 'pending') return false;
      
      // Check if donor is in notifiedDonors array but hasn't responded yet
      const isNotified = req.notifiedDonors?.includes(donorId);
      const hasResponded = req.donorResponses?.some(response => response.donor === donorId);
      
      return isNotified && !hasResponded;
    });
  };

  // Get completed requests by a specific donor (assuming donorId exists)
  const getCompletedRequestsByDonorId = (donorId: string): BloodRequest[] => {
    return bloodRequests.filter(request => 
      request.status === 'completed' && 
      request.acceptedBy === donorId
    );
  };

  // Add a new donor
  const addDonor = (donor: Omit<Donor, '_id' | 'createdAt' | 'donations'>) => {
    console.warn("addDonor is using mock data or needs backend implementation");
    const newDonor: Donor = {
      ...donor,
      _id: Math.random().toString(36).substring(2), // Temporary ID
      createdAt: new Date().toISOString(),
      donations: 0
    };
    setDonors(prev => [...prev, newDonor]);
  };

  // Add a new hospital
  const addHospital = async (hospital: Omit<Hospital, '_id' | 'createdAt' | 'requestsMade' | 'requestsCompleted'>) => {
    // Registration is handled by AuthContext/register. This function now refreshes the hospital list from backend.
    try {
      await fetchHospitals();
    } catch (error) {
      console.error('Failed to refresh hospitals after registration:', error);
    }
  };

  // Verify hospital
  const verifyHospital = async (hospitalId: string, verified: boolean) => {
    try {
      if (!hospitalId) {
        throw new Error('Hospital ID is required');
      }

      // Try to get user from role-specific storage first
      let storedUser = localStorage.getItem('user_admin') || localStorage.getItem('user_donor') || localStorage.getItem('user_hospital');
      
      // Fall back to legacy storage if needed
      if (!storedUser) {
        storedUser = localStorage.getItem('user');
      }
      
      if (!storedUser) {
        throw new Error('User not found');
      }
      const user = JSON.parse(storedUser);

      console.log('Verifying hospital:', { hospitalId, verified, userRole: user.role });

      const response = await fetch(`${API_URL}/verify-hospital/${hospitalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ isVerified: verified })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from verify-hospital:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          hospitalId
        });
        throw new Error(`Failed to update hospital verification status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Hospital verification response:', data);

      // Update local state
      setHospitals(prevHospitals =>
        prevHospitals.map(h =>
          h._id === hospitalId ? { ...h, isVerified: verified } : h
        )
      );

      // Update user verification status if it's the current user's hospital
      if (user.role === 'hospital' && user._id === hospitalId) {
        const userKey = 'user_hospital';
        const updatedUser = {
          ...user,
          isVerified: verified
        };
        localStorage.setItem(userKey, JSON.stringify(updatedUser));
      }

      toast.success(data.message);
    } catch (error) {
      console.error('Error in verifyHospital:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update hospital verification status');
    }
  };

  // Get all blood requests (placeholder, might be redundant with useEffect fetch)
  const getBloodRequests = async () => {
    // Try to get user from role-specific storage first
    let storedUser = localStorage.getItem('user_admin') || localStorage.getItem('user_donor') || localStorage.getItem('user_hospital');
    
    // Fall back to legacy storage if needed
    if (!storedUser) {
      storedUser = localStorage.getItem('user');
    }
    
    if (!storedUser) {
      throw new Error('User not authenticated');
    }
    
    const user = JSON.parse(storedUser);
    const endpoint = user.role === 'hospital' 
      ? `${API_URL}/hospital/blood-requests`
      : `${API_URL}/donor/blood-requests`;
    
    try {
      const response = await axios.get<BloodRequest[]>(endpoint, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      setBloodRequests(response.data);
    } catch (error: any) {
      console.error('Error fetching blood requests:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch blood requests');
      throw error;
    }
  };

  // Create blood request
  const createBloodRequest = async (request: BloodRequestPayload): Promise<BloodRequest> => {
    // Try to get user from role-specific storage first
    let storedUser = localStorage.getItem('user_admin') || localStorage.getItem('user_donor') || localStorage.getItem('user_hospital');
    
    // Fall back to legacy storage if needed
    if (!storedUser) {
      storedUser = localStorage.getItem('user');
    }
    
    if (!storedUser) {
      throw new Error('User not authenticated');
    }
    
    const user = JSON.parse(storedUser);
    
    try {
      const response = await axios.post<BloodRequestResponse>(
        `${API_URL}/hospital/blood-requests`,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        }
      );

      const newRequest = response.data.request;
      setBloodRequests(prev => [...prev, newRequest]);
      
      toast.success(`Blood request created successfully. ${response.data.notifiedDonorsCount} donors notified.`);
      return newRequest;
    } catch (error: any) {
      console.error('Error creating blood request:', error);
      toast.error(error.response?.data?.message || 'Failed to create blood request');
      throw error;
    }
  };

  return (
    <DataContext.Provider 
      value={{ 
        bloodRequests,
        donors,
        hospitals,
        addBloodRequest,
        updateBloodRequestStatus,
        getDonorById,
        getHospitalById,
        getRequestById,
        getDonorsByBloodType,
        getRequestsByHospital,
        getRequestsByDonor,
        getBloodRequestsForDonor,
        getCompletedRequestsByDonorId,
        addDonor,
        addHospital,
        verifyHospital,
        getBloodRequests,
        createBloodRequest
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};