import { AccommodationType, ServiceCategory } from './types';

export const APP_CONFIG = {
  appName: 'CampusConnect',
  tagline: 'Find it. Compare it. Get it done.',
  city: 'Dehradun',
  adminPin: '1234',
  assumedAvgOrderInr: 250,
  commissionRate: 0.1,
  commissionPerCompletedInr: 25,
} as const;

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  'Food',
  'Laundry',
  'Printing',
  'Stationery',
  'Transport',
  'Accommodation',
];

export const ACCOMMODATION_TYPES: AccommodationType[] = ['Hostel', 'PG', 'Rented'];

export const DEHRADUN_AREAS = [
  'Bidholi',
  'Pondha',
  'Prem Nagar',
  'Clement Town',
  'Rajpur Road',
  'Karanpur',
  'Jakhan',
  'Ballupur',
  'Clock Tower',
  'Dalanwala',
];

export const DEHRADUN_COLLEGES = [
  'DBS Global University',
  'UPES Bidholi',
  'Graphic Era University',
  'DIT University',
  'Doon University',
  'Uttaranchal University',
];
