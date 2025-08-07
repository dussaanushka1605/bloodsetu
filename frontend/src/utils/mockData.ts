import { BloodRequest, Donor } from "../types/bloodTypes";

// Generate mock blood requests data
export const generateMockBloodRequests = (): BloodRequest[] => {
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const hospitals = [
    { id: 'h1', name: 'City Hospital', location: 'Delhi' },
    { id: 'h2', name: 'General Hospital', location: 'Mumbai' },
    { id: 'h3', name: 'Medical Center', location: 'Bangalore' }
  ];
  
  return Array.from({ length: 15 }, (_, i) => {
    const hospital = hospitals[Math.floor(Math.random() * hospitals.length)];
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));
    
    return {
      id: `req-${i + 1}`,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
      urgent: Math.random() > 0.7,
      status: ['pending', 'accepted', 'completed', 'cancelled'][Math.floor(Math.random() * 4)] as BloodRequest['status'],
      location: hospital.location,
      contactPerson: ['Dr. Sharma', 'Dr. Patel', 'Dr. Gupta'][Math.floor(Math.random() * 3)],
      contactNumber: `+91 98${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
      notes: Math.random() > 0.5 ? 'Needed for surgery tomorrow' : undefined,
      createdAt: createdDate.toISOString(),
      acceptedBy: Math.random() > 0.7 ? `d${Math.floor(Math.random() * 10) + 1}` : undefined
    };
  });
};

// Generate mock donors data
export const generateMockDonors = (): Donor[] => {
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];
  const names = [
    'Rahul Sharma', 'Priya Patel', 'Amit Singh', 'Deepa Gupta', 'Vikram Reddy', 
    'Sneha Joshi', 'Raj Kumar', 'Ananya Mehta', 'Sanjay Verma', 'Neha Kapoor'
  ];
  
  return Array.from({ length: 20 }, (_, i) => {
    const lastDonationDate = Math.random() > 0.3 ? new Date() : undefined;
    if (lastDonationDate) {
      lastDonationDate.setDate(lastDonationDate.getDate() - Math.floor(Math.random() * 90));
    }
    
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365));
    
    return {
      id: `d${i + 1}`,
      name: names[Math.floor(Math.random() * names.length)],
      email: `donor${i + 1}@example.com`,
      bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
      age: Math.floor(Math.random() * 40) + 18,
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      location: locations[Math.floor(Math.random() * locations.length)],
      state: locations[Math.floor(Math.random() * locations.length)],
      contactNumber: `+91 98${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
      lastDonation: lastDonationDate?.toISOString(),
      donations: Math.floor(Math.random() * 10),
      createdAt: createdDate.toISOString()
    };
  });
};
