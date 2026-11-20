import {
  SEED_EVENTS,
  SEED_FEEDBACK,
  SEED_PROVIDERS,
  SEED_REQUESTS,
  SEED_REVIEWS,
  SEED_STUDENTS,
} from '../data/seedData';
import {
  AnalyticsEvent,
  PilotFeedback,
  Provider,
  Review,
  ServiceRequest,
  Student,
} from '../types';

const STORAGE_KEY = 'campusconnect_dehradun_v1';

export interface CampusStore {
  students: Student[];
  providers: Provider[];
  requests: ServiceRequest[];
  reviews: Review[];
  feedbacks: PilotFeedback[];
  events: AnalyticsEvent[];
  activeStudentId: string | null;
  unseenUpdatedRequestIds: string[];
}

export function getSeedStore(): CampusStore {
  return {
    students: SEED_STUDENTS,
    providers: SEED_PROVIDERS,
    requests: SEED_REQUESTS,
    reviews: SEED_REVIEWS,
    feedbacks: SEED_FEEDBACK,
    events: SEED_EVENTS,
    activeStudentId: null,
    unseenUpdatedRequestIds: [],
  };
}

export function loadStore(): CampusStore {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getSeedStore();
      saveStore(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<CampusStore>;
    const seed = getSeedStore();
    return {
      students: Array.isArray(parsed.students) && parsed.students.length > 0 ? parsed.students : seed.students,
      providers: Array.isArray(parsed.providers) && parsed.providers.length > 0 ? parsed.providers : seed.providers,
      requests: Array.isArray(parsed.requests) ? parsed.requests : seed.requests,
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : seed.reviews,
      feedbacks: Array.isArray(parsed.feedbacks) ? parsed.feedbacks : seed.feedbacks,
      events: Array.isArray(parsed.events) ? parsed.events : seed.events,
      activeStudentId: parsed.activeStudentId ?? null,
      unseenUpdatedRequestIds: Array.isArray(parsed.unseenUpdatedRequestIds)
        ? parsed.unseenUpdatedRequestIds
        : [],
    };
  } catch {
    return getSeedStore();
  }
}

export function saveStore(store: CampusStore): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage quota or private mode fallback: keep running cleanly in memory
  }
}

export function resetStoreToSeed(): CampusStore {
  const seed = getSeedStore();
  seed.activeStudentId = seed.students[0]?.id ?? null;
  saveStore(seed);
  return seed;
}
