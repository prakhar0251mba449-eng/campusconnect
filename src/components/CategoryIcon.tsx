import {
  BookOpen,
  Building2,
  Car,
  Printer,
  Shirt,
  Utensils,
} from 'lucide-react';
import { ServiceCategory } from '../types';

interface CategoryIconProps {
  category: ServiceCategory;
  className?: string;
}

export function CategoryIcon({ category, className = 'w-5 h-5' }: CategoryIconProps) {
  switch (category) {
    case 'Food':
      return <Utensils className={className} aria-hidden="true" />;
    case 'Laundry':
      return <Shirt className={className} aria-hidden="true" />;
    case 'Printing':
      return <Printer className={className} aria-hidden="true" />;
    case 'Stationery':
      return <BookOpen className={className} aria-hidden="true" />;
    case 'Transport':
      return <Car className={className} aria-hidden="true" />;
    case 'Accommodation':
      return <Building2 className={className} aria-hidden="true" />;
  }
}

export function getCategoryTint(category: ServiceCategory): string {
  switch (category) {
    case 'Food':
      return 'bg-orange-50 text-orange-700';
    case 'Laundry':
      return 'bg-blue-50 text-blue-700';
    case 'Printing':
      return 'bg-indigo-50 text-indigo-700';
    case 'Stationery':
      return 'bg-amber-50 text-amber-700';
    case 'Transport':
      return 'bg-sky-50 text-sky-700';
    case 'Accommodation':
      return 'bg-slate-100 text-slate-700';
  }
}
