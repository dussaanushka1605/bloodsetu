
import React from 'react';
import { cn } from '@/lib/utils';

interface BloodTypeCardProps {
  bloodType: string;
  canDonateTo: string[];
  canReceiveFrom: string[];
  selected?: boolean;
  onClick?: () => void;
}

const BloodTypeCard: React.FC<BloodTypeCardProps> = ({
  bloodType,
  canDonateTo,
  canReceiveFrom,
  selected = false,
  onClick
}) => {
  return (
    <div
      className={cn(
        "border rounded-lg p-4 transition-all",
        selected
          ? "border-blood-500 bg-blood-50 shadow-md"
          : "border-gray-200 bg-white hover:border-blood-300 hover:bg-blood-50",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-2xl font-bold text-blood-700">{bloodType}</h3>
        <div className="w-10 h-10 rounded-full bg-blood-100 border border-blood-200 flex items-center justify-center">
          <span className="text-blood-800 font-semibold">{bloodType}</span>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div>
          <p className="text-sm text-gray-500 font-medium">Can donate to:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {canDonateTo.map((type) => (
              <span
                key={type}
                className="inline-flex px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 font-medium">Can receive from:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {canReceiveFrom.map((type) => (
              <span
                key={type}
                className="inline-flex px-2 py-0.5 text-xs bg-blood-100 text-blood-800 rounded"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodTypeCard;
