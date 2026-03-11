export interface Request {
  id: number;
  service_type: string;
  address: string;
  user_name: string;
  booking_date: string;
  status: 'pending' | 'confirmed' | 'rejected';
}