export interface Donor {
  _id: string;
  name: string;
  email: string;
  bloodGroup: string;
  age: number;
  gender: string;
  phone: string;
  city: string;
  state: string;
  lastDonation?: Date;
  donations: number;
  createdAt: string;
  updatedAt: string;
}

export { type Hospital } from './bloodTypes';