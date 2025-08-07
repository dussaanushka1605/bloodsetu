import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Phone, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HospitalCardProps {
  id: string;
  name: string;
  location?: string;
  city: string;
  contactPerson: string;
  contactNumber?: string;
  phone: string;
  isVerified: boolean;
  onVerify?: () => void;
  onUnverify?: () => void;
  onView?: () => void;
  isAdminView?: boolean;
}

const HospitalCard: React.FC<HospitalCardProps> = ({
  id,
  name,
  location,
  city,
  contactPerson,
  contactNumber,
  phone,
  isVerified,
  onVerify,
  onUnverify,
  onView,
  isAdminView = false,
}) => {
  const navigate = useNavigate();
  const displayLocation = location || city;
  const displayContact = contactNumber || phone;
  
  const handleVerifyClick = () => {
    // Navigate to hospital detail page instead of directly verifying
    navigate(`/admin/hospitals/${id}`);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              {name}
              <Badge
                variant="outline"
                className={`ml-2 ${
                  isVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {isVerified ? 'Verified' : 'Unverified'}
              </Badge>
            </CardTitle>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {displayLocation}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <Building className="h-6 w-6 text-blood-600" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="grid grid-cols-1 gap-3 my-3">
          <div>
            <div className="flex items-center text-sm">
              <User className="h-3 w-3 mr-1 text-gray-500" />
              <span className="text-gray-500">Contact:</span>
              <span className="ml-1 font-medium">{contactPerson}</span>
            </div>
            
            <div className="flex items-center text-sm mt-2">
              <Phone className="h-3 w-3 mr-1 text-gray-500" />
              <span className="text-gray-500">Phone:</span>
              <span className="ml-1 font-medium">{displayContact}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 px-6 py-3 flex justify-between">
        {isAdminView ? (
          <>
            {isVerified ? (
              <Button variant="outline" size="sm" onClick={onUnverify}>
                Unverify Hospital
              </Button>
            ) : (
              <Button variant="default" size="sm" onClick={handleVerifyClick}>
                Verify Hospital
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onView}>
              View Details
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={onView} className="w-full">
            View Hospital
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default HospitalCard;
