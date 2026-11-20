import { APP_CONFIG, SERVICE_CATEGORIES } from '../config';
import {
  AnalyticsEvent,
  PilotFeedback,
  Provider,
  ProviderFilters,
  Review,
  ServiceCategory,
  ServiceRequest,
  Student,
} from '../types';

export function filterAndSortProviders(
  providers: Provider[],
  filters: ProviderFilters
): Provider[] {
  const query = filters.query.trim().toLowerCase();

  const filtered = providers.filter((p) => {
    if (filters.category !== 'All' && p.category !== filters.category) {
      return false;
    }
    if (filters.verifiedOnly && !p.verified) {
      return false;
    }
    if (filters.offersOnly && !p.studentOffer.trim()) {
      return false;
    }
    if (filters.maxPrice !== null && p.priceMin > filters.maxPrice) {
      return false;
    }
    if (filters.minRating > 0 && p.avgRating < filters.minRating) {
      return false;
    }
    if (query) {
      const searchable = [
        p.name,
        p.category,
        p.area,
        p.description,
        p.studentOffer,
        ...p.services.map((s) => s.name),
      ]
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(query)) {
        return false;
      }
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (filters.sortBy === 'nearest') {
      return a.distanceKm - b.distanceKm;
    }
    if (filters.sortBy === 'cheapest') {
      return a.priceMin - b.priceMin;
    }
    // top_rated
    if (b.avgRating !== a.avgRating) {
      return b.avgRating - a.avgRating;
    }
    return b.ratingCount - a.ratingCount;
  });

  return sorted;
}

export function recalculateProviderRating(
  provider: Provider,
  reviews: Review[]
): Provider {
  const providerReviews = reviews.filter((r) => r.providerId === provider.id);
  if (providerReviews.length === 0) {
    return {
      ...provider,
      avgRating: 0,
      ratingCount: 0,
    };
  }
  const sum = providerReviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = Math.round((sum / providerReviews.length) * 10) / 10;
  return {
    ...provider,
    avgRating: avg,
    ratingCount: providerReviews.length,
  };
}

export interface CategoryMetric {
  category: ServiceCategory;
  count: number;
}

export interface AdminMetrics {
  totalStudents: number;
  totalProviders: number;
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  completionRatePct: number;
  estimatedCommissionInr: number;
  requestsByCategory: CategoryMetric[];
  feedbackCount: number;
  easyToFindYesPct: number;
  wouldReuseYesPct: number;
  willingToPayYesOrMaybePct: number;
  eventCounts: {
    searches: number;
    providerViews: number;
    requestsCreated: number;
    requestsCompleted: number;
  };
}

export function calculateAdminMetrics(
  students: Student[],
  providers: Provider[],
  requests: ServiceRequest[],
  feedbacks: PilotFeedback[],
  events: AnalyticsEvent[]
): AdminMetrics {
  const totalRequests = requests.length;
  const completedRequests = requests.filter((r) => r.status === 'Completed').length;
  const pendingRequests = requests.filter((r) => r.status === 'Pending').length;
  const acceptedRequests = requests.filter((r) => r.status === 'Accepted').length;
  const completionRatePct =
    totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0;

  const estimatedCommissionInr =
    completedRequests * APP_CONFIG.commissionPerCompletedInr;

  const providerMap = new Map<string, Provider>();
  for (const p of providers) {
    providerMap.set(p.id, p);
  }

  const categoryCountMap = new Map<ServiceCategory, number>();
  for (const cat of SERVICE_CATEGORIES) {
    categoryCountMap.set(cat, 0);
  }
  for (const req of requests) {
    const prov = providerMap.get(req.providerId);
    if (prov) {
      categoryCountMap.set(prov.category, (categoryCountMap.get(prov.category) ?? 0) + 1);
    }
  }

  const requestsByCategory: CategoryMetric[] = SERVICE_CATEGORIES.map((category) => ({
    category,
    count: categoryCountMap.get(category) ?? 0,
  }));

  const feedbackCount = feedbacks.length;
  const easyToFindYesPct =
    feedbackCount > 0
      ? Math.round(
          (feedbacks.filter((f) => f.easyToFind === 'Yes').length / feedbackCount) * 100
        )
      : 0;
  const wouldReuseYesPct =
    feedbackCount > 0
      ? Math.round(
          (feedbacks.filter((f) => f.wouldReuse === 'Yes').length / feedbackCount) * 100
        )
      : 0;
  const willingToPayYesOrMaybePct =
    feedbackCount > 0
      ? Math.round(
          (feedbacks.filter((f) => f.willingToPay === 'Yes' || f.willingToPay === 'Maybe')
            .length /
            feedbackCount) *
            100
        )
      : 0;

  const eventCounts = {
    searches: events.filter((e) => e.type === 'search').length,
    providerViews: events.filter((e) => e.type === 'provider_view').length,
    requestsCreated: events.filter((e) => e.type === 'request_created').length,
    requestsCompleted: events.filter((e) => e.type === 'request_completed').length,
  };

  return {
    totalStudents: students.length,
    totalProviders: providers.length,
    totalRequests,
    completedRequests,
    pendingRequests,
    acceptedRequests,
    completionRatePct,
    estimatedCommissionInr,
    requestsByCategory,
    feedbackCount,
    easyToFindYesPct,
    wouldReuseYesPct,
    willingToPayYesOrMaybePct,
    eventCounts,
  };
}

export function normalizeWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizeWhatsAppPhone(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function formatRequestWhatsAppMessage(
  provider: Provider,
  student: Student | null,
  request: ServiceRequest
): string {
  const studentName = student?.name ?? 'a CampusConnect student';
  const college = student?.college ? ` (${student.college})` : '';
  return [
    `Hi ${provider.name}, I'm ${studentName}${college} via CampusConnect (${APP_CONFIG.city}).`,
    `Request ID: ${request.id}`,
    `Service: ${request.serviceDetails} (Qty: ${request.quantity})`,
    `Preferred time: ${request.preferredTime}`,
    `Address: ${request.address}`,
    `Est. total: ₹${request.estimatedPrice} (Pay direct via Cash/UPI)`,
    request.notes ? `Notes: ${request.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function escapeCsvCell(value: string | number): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateRequestsCsv(
  requests: ServiceRequest[],
  providers: Provider[],
  students: Student[]
): string {
  const providerMap = new Map(providers.map((p) => [p.id, p]));
  const studentMap = new Map(students.map((s) => [s.id, s]));

  const headers = [
    'Request ID',
    'Student Name',
    'Student Phone',
    'College',
    'Provider Name',
    'Category',
    'Service Details',
    'Quantity',
    'Preferred Time',
    'Address',
    'Estimated Price (INR)',
    'Status',
    'Created At',
  ];

  const rows = requests.map((r) => {
    const student = studentMap.get(r.studentId);
    const provider = providerMap.get(r.providerId);
    return [
      r.id,
      student?.name ?? 'Unknown',
      student?.phone ?? '',
      student?.college ?? '',
      provider?.name ?? 'Unknown',
      provider?.category ?? '',
      r.serviceDetails,
      r.quantity,
      r.preferredTime,
      r.address,
      r.estimatedPrice,
      r.status,
      r.createdAt,
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  return [headers.map(escapeCsvCell).join(','), ...rows].join('\n');
}

export function validateStudentInput(input: {
  name: string;
  phone: string;
  college: string;
  area: string;
}): string | null {
  if (!input.name.trim()) return 'Please enter your full name.';
  const digits = input.phone.replace(/\D/g, '');
  if (digits.length < 10) return 'Please enter a valid 10-digit WhatsApp/phone number.';
  if (!input.college.trim()) return 'Please enter or select your college name.';
  if (!input.area.trim()) return 'Please enter your hostel/PG locality.';
  return null;
}

export function validateRequestInput(input: {
  serviceDetails: string;
  quantity: number;
  preferredTime: string;
  address: string;
}): string | null {
  if (!input.serviceDetails.trim()) return 'Please specify the service needed.';
  if (!Number.isFinite(input.quantity) || input.quantity < 1) {
    return 'Quantity must be at least 1.';
  }
  if (!input.preferredTime.trim()) return 'Please enter a preferred time.';
  if (!input.address.trim()) return 'Please enter your hostel, PG, or flat address.';
  return null;
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function getStudentRequestNotificationCount(
  requests: ServiceRequest[],
  studentId: string | null | undefined,
  unseenUpdatedRequestIds: string[] = []
): number {
  if (!studentId) return 0;
  const unseenSet = new Set(unseenUpdatedRequestIds);
  return requests.filter(
    (r) =>
      r.studentId === studentId &&
      (r.status === 'Pending' || r.status === 'Accepted' || unseenSet.has(r.id))
  ).length;
}

