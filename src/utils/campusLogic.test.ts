import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWhatsAppUrl,
  calculateAdminMetrics,
  filterAndSortProviders,
  generateRequestsCsv,
  getStudentRequestNotificationCount,
  recalculateProviderRating,
  validateRequestInput,
  validateStudentInput,
} from './campusLogic';
import {
  SEED_EVENTS,
  SEED_FEEDBACK,
  SEED_PROVIDERS,
  SEED_REQUESTS,
  SEED_REVIEWS,
  SEED_STUDENTS,
} from '../data/seedData';
import { ProviderFilters } from '../types';

const defaultFilters: ProviderFilters = {
  query: '',
  category: 'All',
  maxPrice: null,
  minRating: 0,
  verifiedOnly: false,
  offersOnly: false,
  sortBy: 'nearest',
};

test('filterAndSortProviders filters by category, verified, and query', () => {
  const laundryVerified = filterAndSortProviders(SEED_PROVIDERS, {
    ...defaultFilters,
    category: 'Laundry',
    verifiedOnly: true,
    sortBy: 'nearest',
  });
  assert.equal(laundryVerified.length, 2);
  assert.equal(laundryVerified[0].id, 'prov-1');
  assert.ok(laundryVerified.every((p) => p.verified && p.category === 'Laundry'));

  const searchTiffin = filterAndSortProviders(SEED_PROVIDERS, {
    ...defaultFilters,
    query: 'tiffin',
  });
  assert.equal(searchTiffin.length, 2);
  assert.equal(searchTiffin[0].name, 'Sharma Tiffin Service');
});

test('filterAndSortProviders sorts by cheapest and top_rated', () => {
  const cheapest = filterAndSortProviders(SEED_PROVIDERS, {
    ...defaultFilters,
    category: 'Food',
    sortBy: 'cheapest',
  });
  assert.equal(cheapest[0].priceMin, 30);

  const topRated = filterAndSortProviders(SEED_PROVIDERS, {
    ...defaultFilters,
    sortBy: 'top_rated',
  });
  assert.ok(topRated[0].avgRating >= topRated[1].avgRating);
});

test('recalculateProviderRating computes average and count accurately', () => {
  const prov = SEED_PROVIDERS[0];
  const updated = recalculateProviderRating(prov, [
    ...SEED_REVIEWS,
    {
      id: 'rev-new',
      requestId: 'REQ-999',
      providerId: prov.id,
      studentId: 'stu-1',
      rating: 2,
      comment: 'Delayed once',
      createdAt: '2026-09-28T10:00:00.000Z',
    },
  ]);
  // SEED_REVIEWS has two 5-star reviews for prov-1; adding a 2-star makes (5+5+2)/3 = 4.0
  assert.equal(updated.ratingCount, 3);
  assert.equal(updated.avgRating, 4);
});

test('calculateAdminMetrics computes commission and completion rate', () => {
  const metrics = calculateAdminMetrics(
    SEED_STUDENTS,
    SEED_PROVIDERS,
    SEED_REQUESTS,
    SEED_FEEDBACK,
    SEED_EVENTS
  );
  // 5 completed out of 8 requests => 63% completion rate, 5 * 25 = 125 INR commission
  assert.equal(metrics.totalStudents, 5);
  assert.equal(metrics.totalProviders, 18);
  assert.equal(metrics.totalRequests, 8);
  assert.equal(metrics.completedRequests, 5);
  assert.equal(metrics.completionRatePct, 63);
  assert.equal(metrics.estimatedCommissionInr, 125);
  assert.equal(metrics.feedbackCount, 4);
  assert.equal(metrics.easyToFindYesPct, 75);
});

test('buildWhatsAppUrl normalizes 10-digit Indian numbers and encodes message', () => {
  const url = buildWhatsAppUrl('9876543210', 'Hello & test');
  assert.equal(url, 'https://wa.me/919876543210?text=Hello%20%26%20test');
});

test('generateRequestsCsv escapes commas and quotes properly', () => {
  const csv = generateRequestsCsv(SEED_REQUESTS.slice(0, 2), SEED_PROVIDERS, SEED_STUDENTS);
  const lines = csv.split('\n');
  assert.equal(lines.length, 3);
  assert.ok(lines[0].startsWith('Request ID,Student Name'));
  assert.ok(lines[1].includes('REQ-1001'));
  assert.ok(lines[1].includes('"DBS Hostel Block B, Room 214, Pondha"'));
});

test('validation helpers reject empty or invalid inputs', () => {
  assert.ok(
    validateStudentInput({ name: '', phone: '9812345678', college: 'DBS', area: 'Pondha' })
  );
  assert.ok(
    validateStudentInput({ name: 'Aarav', phone: '123', college: 'DBS', area: 'Pondha' })
  );
  assert.equal(
    validateStudentInput({ name: 'Aarav', phone: '9812345678', college: 'DBS', area: 'Pondha' }),
    null
  );

  assert.ok(
    validateRequestInput({ serviceDetails: '', quantity: 1, preferredTime: '5 PM', address: 'Hostel' })
  );
  assert.equal(
    validateRequestInput({ serviceDetails: 'Wash', quantity: 2, preferredTime: '5 PM', address: 'Hostel' }),
    null
  );
});

test('getStudentRequestNotificationCount counts pending, accepted, and unseen updated requests without double counting', () => {
  // stu-1 has REQ-1001 (Completed), REQ-1002 (Completed), REQ-1006 (Pending)
  assert.equal(getStudentRequestNotificationCount(SEED_REQUESTS, 'stu-1', []), 1);

  // If REQ-1001 was recently updated to Completed and unseen, count becomes 2
  assert.equal(
    getStudentRequestNotificationCount(SEED_REQUESTS, 'stu-1', ['REQ-1001']),
    2
  );

  // If REQ-1006 is both Pending and in unseenUpdatedRequestIds, do not double count
  assert.equal(
    getStudentRequestNotificationCount(SEED_REQUESTS, 'stu-1', ['REQ-1006']),
    1
  );

  assert.equal(getStudentRequestNotificationCount(SEED_REQUESTS, null, []), 0);
});

