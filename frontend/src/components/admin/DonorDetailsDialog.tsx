import React from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Button, Typography } from '@mui/material';
import { MapPin, Phone, User, X, Activity } from 'lucide-react';
import { Donor } from '@/types/index';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';

interface DonorDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  donor: Donor | null;
}



export const DonorDetailsDialog: React.FC<DonorDetailsDialogProps> = ({ open, onClose, donor }) => {
  if (!donor) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 3,
          position: 'relative'
        }
      }}
      sx={{
        zIndex: 1500
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute',
          right: 16,
          top: 16,
          cursor: 'pointer'
        }}
        onClick={onClose}
      >
        <X size={20} />
      </Box>

      <Typography variant="h5" sx={{ mb: 1 }}>
        Donor Details
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Complete information about this donor
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Donor Name
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {donor.name}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Email
        </Typography>
        <Typography variant="body1">
          {donor.email}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <MapPin size={20} />
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Location
          </Typography>
          <Typography variant="body1">
            {`${donor.city}, ${donor.state}`}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <User size={20} />
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Age & Gender
          </Typography>
          <Typography variant="body1">
            {`${donor.age} years, ${donor.gender}`}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Phone size={20} />
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Contact Number
          </Typography>
          <Typography variant="body1">
            {donor.phone}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Activity size={20} />
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Blood Group
          </Typography>
          <Typography variant="body1">
            {donor.bloodGroup}
          </Typography>
        </Box>
      </Box>



      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={onClose}
          sx={{ 
            flex: 1,
            borderColor: 'divider',
            color: 'text.primary'
          }}
        >
          Close
        </Button>
      </Box>
    </Dialog>
  );
};

