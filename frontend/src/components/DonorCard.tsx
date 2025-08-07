import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Phone, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Donor } from '@/types/index';

interface DonorCardProps {
  id: string;
  name: string;
  bloodGroup: string;
  age: number;
  gender: string;
  city: string;
  state: string;
  phone: string;
  lastDonation?: string; // Made optional since it's no longer displayed in hospital dashboard
  donations?: number; // Made optional since it's no longer displayed in hospital dashboard
  onView: () => void;
  showContactInfo?: boolean;
  isAdminView?: boolean;
}

export default function DonorCard({
  id,
  name,
  bloodGroup,
  age,
  gender,
  city,
  state,
  phone,
  lastDonation,
  donations,
  onView,
  showContactInfo = false,
  isAdminView = false,
}: DonorCardProps) {
  const lastDonationDate = lastDonation ? new Date(lastDonation) : null;
  const lastDonationText = lastDonationDate 
    ? formatDistanceToNow(lastDonationDate, { addSuffix: true }) 
    : 'Never donated';
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              {name}
            </CardTitle>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {city}, {state}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="w-10 h-10 rounded-full bg-blood-100 border border-blood-200 flex items-center justify-center">
              <span className="text-blood-800 font-semibold">{bloodGroup}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="my-3">
          <div>
            <div className="flex items-center text-sm">
              <User className="h-3 w-3 mr-1 text-gray-500" />
              <span className="text-gray-500">Age/Gender:</span>
              <span className="ml-1 font-medium">{age > 0 ? age : 'N/A'}, {gender}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 px-6 py-3 flex justify-between">
        <Button variant="outline" size="sm" onClick={onView} className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
