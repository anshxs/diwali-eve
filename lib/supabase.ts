import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Registration {
  id?: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  parent_husband_mobile: string;
  registration_type: 'SINGLE' | 'GROUP';
  group_members?: GroupMember[];
  ticket_id: string;
  created_at?: string;
}

export interface GroupMember {
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
}

export interface PaymentVerification {
  id?: string;
  ticket_id: string;
  payment_screenshot_url: string;
  upi_reference?: string;
  verified: boolean;
  created_at?: string;
}