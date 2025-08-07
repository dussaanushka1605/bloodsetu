
import { addMonths, isAfter } from 'date-fns';

// Calculate next eligible donation date
export const calculateNextEligibleDate = (lastDonation?: string) => {
  if (!lastDonation) return null;
  
  const lastDonationDate = new Date(lastDonation);
  return addMonths(lastDonationDate, 3);
};

// Check if donor is eligible to donate
export const isDonorEligible = (lastDonation?: string) => {
  if (!lastDonation) return true;
  
  const nextEligibleDate = calculateNextEligibleDate(lastDonation);
  return nextEligibleDate ? !isAfter(nextEligibleDate, new Date()) : true;
};

// Format date to display in UI
export const formatNextEligibleDate = (lastDonation?: string) => {
  const nextEligibleDate = calculateNextEligibleDate(lastDonation);
  if (!nextEligibleDate) return null;
  
  return nextEligibleDate.toLocaleDateString();
};
