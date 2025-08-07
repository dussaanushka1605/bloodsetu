
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// No props needed as we're only showing guidelines now
const DonorEligibility: React.FC = () => {

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Donation Guidelines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-3 rounded-md text-sm">
          <p className="font-medium mb-1">Donation Guidelines:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>You must wait at least 3 months between whole blood donations</li>
            <li>You must be feeling well and healthy on the day of donation</li>
            <li>Maintain adequate iron levels and hydration before donating</li>
            <li>Bring a valid ID to the donation center</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DonorEligibility;
