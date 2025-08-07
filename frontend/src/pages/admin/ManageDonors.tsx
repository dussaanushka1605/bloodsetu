import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DonorFilters from '@/components/admin/DonorFilters';
import DonorList from '@/components/admin/DonorList';
import { DonorDetailsDialog } from '@/components/admin/DonorDetailsDialog';
import axios from 'axios';
import { toast } from 'sonner';
import { Donor } from '@/types/index';

const ManageDonors: React.FC = () => {
  const { user } = useAuth();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState('all');
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [isDonorDetailsOpen, setIsDonorDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
        const token = localStorage.getItem('token_admin') || user?.token;
        if (!token) {
          console.error('No admin token found');
          toast.error('Authentication error. Please login again.');
          return;
        }
        
        const response = await axios.get<Donor[]>(`${API_URL}/api/admin/donors`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setDonors(response.data);
      } catch (error) {
        console.error('Error fetching donors:', error);
        toast.error('Failed to fetch donors');
      }
    };

    fetchDonors();
  }, [user]);

  // Filter donors based on search and filters
  const filteredDonors = donors.filter((donor) => {
    const matchesSearch = 
      donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${donor.city}, ${donor.state}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBloodType = 
      selectedBloodType === 'all' || 
      donor.bloodGroup === selectedBloodType;
    
    return matchesSearch && matchesBloodType;
  });

  const handleViewDetails = (donorId: string) => {
    const donor = donors.find(d => d._id === donorId);
    if (donor) {
      setSelectedDonor(donor);
      setIsDonorDetailsOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Donors</h1>
          <p className="text-gray-600">View and manage all registered blood donors</p>
        </div>

        <div className="mb-6">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-2 border rounded-lg"
            />
            <select
              value={selectedBloodType}
              onChange={(e) => setSelectedBloodType(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        <DonorList 
          donors={filteredDonors}
          onViewDetails={handleViewDetails}
        />

        <DonorDetailsDialog
          open={isDonorDetailsOpen}
          onClose={() => setIsDonorDetailsOpen(false)}
          donor={selectedDonor}
        />
      </main>
      <Footer />
    </div>
  );
};

export default ManageDonors;
