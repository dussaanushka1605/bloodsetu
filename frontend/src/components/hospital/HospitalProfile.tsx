import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@/contexts/AuthContext';

interface HospitalProfileProps {
  hospital: User;
}

const HospitalProfile: React.FC<HospitalProfileProps> = ({ hospital }) => {
  if (hospital.role !== 'hospital') {
    return <Card><CardContent><p>Invalid user type for Hospital Profile.</p></CardContent></Card>;
  }

  // Profile picture feature has been removed

  return (
    <Card>
      <CardHeader className="flex flex-col items-center pb-2">
        <CardTitle>Hospital Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Hospital Name</h3>
            <p>{hospital.name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p>{hospital.email}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">License Number</h3>
            <p>{hospital.licenseNumber || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Location</h3>
            <p>{hospital.city && hospital.state ? `${hospital.city}, ${hospital.state}` : hospital.location || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact Person</h3>
            <p>{hospital.contactPerson || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
            <p>{hospital.phone || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Verification Status</h3>
            <div>
              {hospital.isVerified ? (
                <Badge className="bg-green-100 text-green-800">Verified</Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending Verification</Badge>
              )}
            </div>
          </div>
        </div>
        
        {!hospital.isVerified && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
            <p className="font-medium text-yellow-800">Your hospital is pending verification</p>
            <p className="text-yellow-700 mt-1">
              Some features might be limited until an admin verifies your hospital.
              This usually takes 1-2 business days.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HospitalProfile;
