import React from 'react';

interface DonorFiltersProps {
  searchTerm: string;
  selectedBloodType: string;
  onSearchChange: (value: string) => void;
  onBloodTypeChange: (value: string) => void;
}

const DonorFilters: React.FC<DonorFiltersProps> = ({
  searchTerm,
  selectedBloodType,
  onSearchChange,
  onBloodTypeChange
}) => {
  return (
    <div className="mb-6">
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search by name or location..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
        />
        <select
          value={selectedBloodType}
          onChange={(e) => onBloodTypeChange(e.target.value)}
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
  );
};

export default DonorFilters;
