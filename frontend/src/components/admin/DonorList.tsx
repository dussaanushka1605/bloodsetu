import React from 'react';
import { AlertCircle } from 'lucide-react';
import DonorCard from '@/components/DonorCard';
import { Donor } from '@/types/index';

interface DonorListProps {
  donors: Donor[];
  onViewDetails: (donorId: string) => void;
}

const DonorList: React.FC<DonorListProps> = ({ donors, onViewDetails }) => {
  if (donors.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Donors Found</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          No donors match your search criteria. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {donors.map((donor) => (
        <DonorCard
          key={donor._id}
          id={donor._id}
          name={donor.name}
          bloodGroup={donor.bloodGroup}
          age={donor.age}
          gender={donor.gender}
          city={donor.city}
          state={donor.state}
          phone={donor.phone}
          onView={() => onViewDetails(donor._id)}
          isAdminView={true}
        />
      ))}
    </div>
  );
};

export default DonorList;
