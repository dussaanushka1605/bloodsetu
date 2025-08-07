import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BloodRequest } from '@/types/bloodTypes';

interface BloodRequestCardProps {
  id: string;
  hospitalName: string;
  bloodType: string;
  urgent: boolean;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled' | 'rejected';
  location: string;
  createdAt: string;
  onView: () => void;
  onAccept?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
  showActionButtons?: boolean;
  isDonorView?: boolean;
  notifiedDonorsCount?: number;
  acceptedBy?: string;
  description?: string;
}

const BloodRequestCard: React.FC<BloodRequestCardProps> = ({
  id,
  hospitalName,
  bloodType,
  urgent,
  status,
  location,
  createdAt,
  onView,
  onAccept,
  onCancel,
  onComplete,
  showActionButtons = true,
  isDonorView = false,
  notifiedDonorsCount = 0,
  acceptedBy,
  description
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{hospitalName}</h3>
            <p className="text-sm text-gray-500">{location}</p>
          </div>
          <Badge className={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Blood Type</span>
            <span className="font-medium text-red-600">{bloodType}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Urgency</span>
            <Badge variant={urgent ? "destructive" : "secondary"}>
              {urgent ? 'Urgent (Emergency)' : 'Regular'}
            </Badge>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Created</span>
            <span className="text-sm">
              {new Date(createdAt).toLocaleDateString()}
            </span>
          </div>

          {description && (
            <div className="mt-2">
              <span className="text-sm text-gray-500">Description</span>
              <p className="text-sm mt-1">{description}</p>
            </div>
          )}

          {notifiedDonorsCount > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Notified Donors</span>
              <span className="text-sm font-medium">{notifiedDonorsCount}</span>
            </div>
          )}

          {acceptedBy && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Accepted By</span>
              <span className="text-sm font-medium">{acceptedBy}</span>
            </div>
          )}
        </div>

        {showActionButtons && (
          <div className="mt-4 flex justify-end gap-2">
            {isDonorView && status === 'pending' && onAccept && (
              <Button variant="default" onClick={onAccept}>
                Accept Request
              </Button>
            )}
            {isDonorView && status === 'accepted' && onComplete && (
              <Button variant="default" onClick={onComplete}>
                Mark as Completed
              </Button>
            )}
            {status !== 'completed' && status !== 'cancelled' && onCancel && (
              <Button variant="destructive" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button variant="outline" onClick={onView}>
              View Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BloodRequestCard;
