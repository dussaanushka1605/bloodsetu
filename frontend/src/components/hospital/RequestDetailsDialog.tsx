
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BloodRequest } from '@/types/bloodTypes';

interface RequestDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  request: BloodRequest | null;
  onCancel?: (requestId: string) => void;
}

const RequestDetailsDialog: React.FC<RequestDetailsDialogProps> = ({
  isOpen,
  onOpenChange,
  request,
  onCancel
}) => {
  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
          <DialogDescription>
            Complete information about this blood request
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Request ID</h3>
            <p className="font-medium">{request.id}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Blood Type</h3>
              <p className="font-semibold text-lg text-blood-600">{request.bloodType}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <Badge className={
                request.status === 'completed' ? 'bg-green-100 text-green-800' : 
                request.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                request.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </Badge>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Location</h3>
            <p>{request.location}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Created On</h3>
            <p>{new Date(request.createdAt).toLocaleDateString()}</p>
          </div>
          
          {request.patientName && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Patient Details</h3>
              <p>{request.patientName}, {request.patientAge || 'N/A'} years</p>
            </div>
          )}
          
          {request.unitsRequired && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Units Required</h3>
              <p>{request.unitsRequired}</p>
            </div>
          )}
          
          {request.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Additional Notes</h3>
              <p className="text-gray-700">{request.notes}</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          
          {request.status === 'pending' && onCancel && (
            <Button 
              variant="destructive"
              onClick={() => {
                onCancel(request.id);
                onOpenChange(false);
              }}
            >
              Cancel Request
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestDetailsDialog;
