import { Registration } from '@/lib/supabase';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function saveTicketToLocalStorage(ticket: Registration) {
  const existingTickets = getTicketsFromLocalStorage();
  existingTickets.push(ticket);
  localStorage.setItem('diwali-tickets', JSON.stringify(existingTickets));
}

export function getTicketsFromLocalStorage(): Registration[] {
  if (typeof window === 'undefined') return [];
  const tickets = localStorage.getItem('diwali-tickets');
  return tickets ? JSON.parse(tickets) : [];
}

export function generateTicketId(): string {
  const prefix = 'DW2025';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

export function generateUPIPaymentUrl(amount: number, ticketId: string): string {
  const upiId = '8439100899@fam';
  const merchantName = 'Nihar Gautam';
  const note = `Diwali Night 2025 - ${ticketId}`;
  
  return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
}