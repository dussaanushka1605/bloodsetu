import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { MapPin, User } from 'lucide-react';

interface HospitalDonorCardProps {
  id: string;
  name: string;
  bloodGroup: string;
  age: number;
  gender: string;
  city: string;
  state: string;
  onView: () => void;
}

export default function HospitalDonorCard({
  id,
  name,
  bloodGroup,
  age,
  gender,
  city,
  state,
  onView,
}: HospitalDonorCardProps) {
  
  return (
    <Card className="h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              {city}, {state}
            </div>
          </div>
          
          {/* Prominent Blood Group Circle */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blood-500 to-blood-600 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">{bloodGroup}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pb-3">
        <div className="space-y-3">
          {/* Age and Gender */}
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-gray-600">Age/Gender:</span>
            <span className="ml-1 font-medium text-gray-900">{age > 0 ? age : 'N/A'}, {gender}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onView} 
          className="w-full hover:bg-blood-50 hover:border-blood-200 hover:text-blood-700 transition-colors"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
} 