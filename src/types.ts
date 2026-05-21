/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Service {
  id: string;
  name: string;
  category: 'skincare' | 'hair' | 'massage' | 'consult' | 'nails' | string;
  price: number;
  duration: number; // in minutes
  description: string;
  icon: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceId: string; // fallback or primary service
  serviceIds?: string[]; // list of all booked services
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (e.g., "10:00")
  duration: number; // in minutes (sum of all selected service durations)
  staffName: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes?: string;
  colorClass?: string;
  clientId?: string; // linked client ID
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  stars: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface StaffServiceConfig {
  price: number;
  duration: number;
  enabled: boolean;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  services?: string[]; // IDs of services they can perform
  category?: 'skincare' | 'hair' | 'massage' | 'consult' | 'nails' | string;
  commissionRate?: number; // Custom commission rate (e.g. 0.45 for 45%). If undefined, uses global rate.
  avatar?: string;
  description?: string;
  active?: boolean; // Toggles availability
  workingHours?: {
    [dayIndex: number]: { start: string; end: string; enabled: boolean }; // 0 represents Sunday, 6 is Saturday
  };
  vacations?: string[]; // Array of YYYY-MM-DD strings
  customServices?: {
    [serviceId: string]: StaffServiceConfig;
  };
}


