import { useEffect, useMemo, useState } from 'react';
import { AdminPinModal } from './components/AdminPinModal';
import { AdminView } from './components/AdminView';
import { BottomNav } from './components/BottomNav';
import { CompareModal } from './components/CompareModal';
import { Header, StudentTab } from './components/Header';
import { HomeView } from './components/HomeView';
import { MyRequestsView } from './components/MyRequestsView';
import { OnboardingView } from './components/OnboardingView';
import { ProfileView } from './components/ProfileView';
import { ProviderDetailView } from './components/ProviderDetailView';
import { RequestFormModal } from './components/RequestFormModal';
import { SearchView } from './components/SearchView';
import {
  AnalyticsEvent,
  AnalyticsEventType,
  Provider,
  ProviderFilters,
  ProviderServiceItem,
  RequestStatus,
  Review,
  ServiceCategory,
  ServiceRequest,
  Student,
} from './types';
import {
  filterAndSortProviders,
  getStudentRequestNotificationCount,
  recalculateProviderRating,
} from './utils/campusLogic';
import {
  CampusStore,
  loadStore,
  resetStoreToSeed,
  saveStore,
} from './utils/storage';

const DEFAULT_FILTERS: ProviderFilters = {
  query: '',
  category: 'All',
  maxPrice: null,
  minRating: 0,
  verifiedOnly: false,
  offersOnly: false,
  sortBy: 'nearest',
};

export default function App() {
  const [store, setStore] = useState<CampusStore | null>(null);
  const [mode, setMode] = useState<'student' | 'admin'>('student');
  const [activeTab, setActiveTab] = useState<StudentTab>('home');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProviderFilters>(DEFAULT_FILTERS);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAdminPinOpen, setIsAdminPinOpen] = useState(false);
  const [requestTarget, setRequestTarget] = useState<{
    provider: Provider;
    service?: ProviderServiceItem;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadStore();
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' && !loaded.activeStudentId) {
      loaded.activeStudentId = loaded.students[0]?.id ?? 'stu-1';
      saveStore(loaded);
    }
    setStore(loaded);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const updateStore = (updater: (prev: CampusStore) => CampusStore) => {
    setStore((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      saveStore(next);
      return next;
    });
  };

  const recordEvent = (
    prev: CampusStore,
    type: AnalyticsEventType,
    userId: string,
    meta?: string
  ): AnalyticsEvent[] => {
    const newEvent: AnalyticsEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      userId,
      meta,
      timestamp: new Date().toISOString(),
    };
    return [...prev.events, newEvent];
  };

  const filteredProviders = useMemo(() => {
    if (!store) return [];
    return filterAndSortProviders(store.providers, filters);
  }, [store, filters]);

  if (!store) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-3 text-center">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 mx-auto animate-pulse" />
          <p className="text-sm font-medium text-slate-600">Loading CampusConnect...</p>
        </div>
      </div>
    );
  }

  const activeStudent =
    store.students.find((s) => s.id === store.activeStudentId) ?? null;

  const selectedProvider =
    store.providers.find((p) => p.id === selectedProviderId) ?? null;

  const comparedProviders = compareIds
    .map((id) => store.providers.find((p) => p.id === id))
    .filter((p): p is Provider => Boolean(p));

  const activeRequestCount = getStudentRequestNotificationCount(
    store.requests,
    activeStudent?.id,
    store.unseenUpdatedRequestIds
  );

  // Handlers
  const handleCreateStudent = (payload: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...payload,
      id: `stu-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    updateStore((prev) => ({
      ...prev,
      students: [...prev.students, newStudent],
      activeStudentId: newStudent.id,
    }));
    setActiveTab('home');
    setSelectedProviderId(null);
  };

  const handleSelectExistingStudent = (studentId: string) => {
    updateStore((prev) => ({
      ...prev,
      activeStudentId: studentId,
    }));
    setActiveTab('home');
    setSelectedProviderId(null);
  };

  const handleUpdateStudent = (updated: Student) => {
    updateStore((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === updated.id ? updated : s)),
    }));
  };

  const markStudentUpdatesSeen = (studentId: string | undefined) => {
    if (!studentId || store.unseenUpdatedRequestIds.length === 0) return;
    const studentReqIds = new Set(
      store.requests.filter((r) => r.studentId === studentId).map((r) => r.id)
    );
    const hasUnseenForStudent = store.unseenUpdatedRequestIds.some((id) =>
      studentReqIds.has(id)
    );
    if (!hasUnseenForStudent) return;
    updateStore((prev) => ({
      ...prev,
      unseenUpdatedRequestIds: prev.unseenUpdatedRequestIds.filter(
        (id) => !studentReqIds.has(id)
      ),
    }));
  };

  const handleNavigateTab = (tab: StudentTab) => {
    if (tab === 'requests') {
      markStudentUpdatesSeen(activeStudent?.id);
    }
    setActiveTab(tab);
    setSelectedProviderId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHomeSearch = (query: string, category?: ServiceCategory) => {
    setFilters((prev) => ({
      ...prev,
      query,
      category: category ?? 'All',
    }));
    if (activeStudent) {
      updateStore((prev) => ({
        ...prev,
        events: recordEvent(
          prev,
          'search',
          activeStudent.id,
          category ? `${category}:${query}` : query
        ),
      }));
    }
    setSelectedProviderId(null);
    setActiveTab('search');
  };

  const handleChangeFilters = (next: ProviderFilters) => {
    if (
      activeStudent &&
      next.query.trim() &&
      next.query.trim() !== filters.query.trim()
    ) {
      updateStore((prev) => ({
        ...prev,
        events: recordEvent(prev, 'search', activeStudent.id, next.query.trim()),
      }));
    }
    setFilters(next);
  };

  const handleSelectProvider = (provider: Provider) => {
    setSelectedProviderId(provider.id);
    if (activeStudent) {
      updateStore((prev) => ({
        ...prev,
        events: recordEvent(prev, 'provider_view', activeStudent.id, provider.id),
      }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleCompare = (providerId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(providerId)) {
        return prev.filter((id) => id !== providerId);
      }
      if (prev.length >= 3) {
        showToast('You can compare up to 3 providers at a time.');
        return prev;
      }
      return [...prev, providerId];
    });
  };

  const handleSubmitRequest = (payload: {
    providerId: string;
    serviceDetails: string;
    quantity: number;
    preferredTime: string;
    address: string;
    notes: string;
    estimatedPrice: number;
  }): ServiceRequest => {
    const reqNum = 1001 + store.requests.length;
    const newReq: ServiceRequest = {
      id: `REQ-${reqNum}`,
      studentId: activeStudent?.id ?? 'stu-1',
      providerId: payload.providerId,
      serviceDetails: payload.serviceDetails,
      quantity: payload.quantity,
      preferredTime: payload.preferredTime,
      address: payload.address,
      notes: payload.notes,
      estimatedPrice: payload.estimatedPrice,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    updateStore((prev) => ({
      ...prev,
      requests: [newReq, ...prev.requests],
      events: recordEvent(prev, 'request_created', newReq.studentId, newReq.id),
    }));
    return newReq;
  };

  const handleUpdateRequestStatus = (requestId: string, status: RequestStatus) => {
    updateStore((prev) => {
      const target = prev.requests.find((r) => r.id === requestId);
      const statusChanged = Boolean(target && target.status !== status);
      const nextRequests = prev.requests.map((r) =>
        r.id === requestId ? { ...r, status } : r
      );
      const nextEvents =
        status === 'Completed' && statusChanged && target
          ? recordEvent(prev, 'request_completed', target.studentId, requestId)
          : prev.events;
      const nextUnseen =
        statusChanged &&
        !(mode === 'student' && activeTab === 'requests' && target?.studentId === activeStudent?.id)
          ? Array.from(new Set([...prev.unseenUpdatedRequestIds, requestId]))
          : prev.unseenUpdatedRequestIds;
      return {
        ...prev,
        requests: nextRequests,
        events: nextEvents,
        unseenUpdatedRequestIds: nextUnseen,
      };
    });
  };

  const handleSubmitReview = (payload: {
    requestId: string;
    providerId: string;
    rating: number;
    comment: string;
  }) => {
    if (!activeStudent) return;
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      requestId: payload.requestId,
      providerId: payload.providerId,
      studentId: activeStudent.id,
      rating: payload.rating,
      comment: payload.comment,
      createdAt: new Date().toISOString(),
    };
    updateStore((prev) => {
      const nextReviews = [newReview, ...prev.reviews];
      const nextProviders = prev.providers.map((p) =>
        p.id === payload.providerId
          ? recalculateProviderRating(p, nextReviews)
          : p
      );
      return {
        ...prev,
        reviews: nextReviews,
        providers: nextProviders,
      };
    });
    showToast('Thanks for reviewing! Provider rating updated.');
  };

  const handleSubmitFeedback = (payload: {
    requestId: string;
    easyToFind: 'Yes' | 'Somewhat' | 'No';
    wouldReuse: 'Yes' | 'Maybe' | 'No';
    willingToPay: 'Yes' | 'Maybe' | 'No';
  }) => {
    if (!activeStudent) return;
    updateStore((prev) => ({
      ...prev,
      feedbacks: [
        ...prev.feedbacks,
        {
          id: `fb-${Date.now()}`,
          requestId: payload.requestId,
          studentId: activeStudent.id,
          easyToFind: payload.easyToFind,
          wouldReuse: payload.wouldReuse,
          willingToPay: payload.willingToPay,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    showToast('Pilot feedback recorded. Thank you!');
  };

  const handleSaveProvider = (provider: Provider) => {
    updateStore((prev) => {
      const exists = prev.providers.some((p) => p.id === provider.id);
      return {
        ...prev,
        providers: exists
          ? prev.providers.map((p) => (p.id === provider.id ? provider : p))
          : [provider, ...prev.providers],
      };
    });
    showToast(`Saved ${provider.name}.`);
  };

  const handleDeleteProvider = (providerId: string) => {
    updateStore((prev) => ({
      ...prev,
      providers: prev.providers.filter((p) => p.id !== providerId),
    }));
    setCompareIds((prev) => prev.filter((id) => id !== providerId));
    if (selectedProviderId === providerId) {
      setSelectedProviderId(null);
    }
    showToast('Provider deleted.');
  };

  // Onboarding screen if no student selected and not in admin mode
  if (!activeStudent && mode === 'student') {
    return (
      <>
        <OnboardingView
          existingStudents={store.students}
          onCreateStudent={handleCreateStudent}
          onSelectExistingStudent={handleSelectExistingStudent}
          onOpenAdmin={() => setIsAdminPinOpen(true)}
        />
        {isAdminPinOpen && (
          <AdminPinModal
            onClose={() => setIsAdminPinOpen(false)}
            onSuccess={() => {
              setIsAdminPinOpen(false);
              setMode('admin');
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        mode={mode}
        activeTab={activeTab}
        onNavigateTab={handleNavigateTab}
        onRequestAdminMode={() => setIsAdminPinOpen(true)}
        onExitAdminMode={() => setMode('student')}
        requestCountBadge={activeRequestCount}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-24 md:pb-12">
        {mode === 'admin' ? (
          <AdminView
            students={store.students}
            providers={store.providers}
            requests={store.requests}
            feedbacks={store.feedbacks}
            events={store.events}
            onUpdateRequestStatus={handleUpdateRequestStatus}
            onSaveProvider={handleSaveProvider}
            onDeleteProvider={handleDeleteProvider}
          />
        ) : selectedProvider ? (
          <ProviderDetailView
            provider={selectedProvider}
            reviews={store.reviews}
            students={store.students}
            isCompared={compareIds.includes(selectedProvider.id)}
            onBack={() => setSelectedProviderId(null)}
            onToggleCompare={handleToggleCompare}
            onStartRequest={(provider, service) =>
              setRequestTarget({ provider, service })
            }
          />
        ) : activeTab === 'home' && activeStudent ? (
          <HomeView
            student={activeStudent}
            providers={store.providers}
            compareIds={compareIds}
            onSearchSubmit={handleHomeSearch}
            onSelectProvider={handleSelectProvider}
            onToggleCompare={handleToggleCompare}
            onQuickRequest={(provider) => setRequestTarget({ provider })}
            onOpenCompare={() => setIsCompareOpen(true)}
          />
        ) : activeTab === 'search' ? (
          <SearchView
            providers={store.providers}
            filteredProviders={filteredProviders}
            filters={filters}
            compareIds={compareIds}
            onChangeFilters={handleChangeFilters}
            onSelectProvider={handleSelectProvider}
            onToggleCompare={handleToggleCompare}
            onQuickRequest={(provider) => setRequestTarget({ provider })}
            onOpenCompare={() => setIsCompareOpen(true)}
            onClearCompare={() => setCompareIds([])}
          />
        ) : activeTab === 'requests' && activeStudent ? (
          <MyRequestsView
            student={activeStudent}
            requests={store.requests}
            providers={store.providers}
            reviews={store.reviews}
            feedbacks={store.feedbacks}
            onBrowseServices={() => handleNavigateTab('search')}
            onCancelRequest={(requestId) =>
              handleUpdateRequestStatus(requestId, 'Cancelled')
            }
            onSubmitReview={handleSubmitReview}
            onSubmitFeedback={handleSubmitFeedback}
          />
        ) : activeTab === 'profile' && activeStudent ? (
          <ProfileView
            student={activeStudent}
            allStudents={store.students}
            onUpdateStudent={handleUpdateStudent}
            onSwitchStudent={handleSelectExistingStudent}
            onSignOutToOnboarding={() =>
              updateStore((prev) => ({ ...prev, activeStudentId: null }))
            }
            onOpenAdminPinModal={() => setIsAdminPinOpen(true)}
            onResetSeedData={() => {
              const reset = resetStoreToSeed();
              setStore(reset);
              setCompareIds([]);
              setSelectedProviderId(null);
              showToast('Pilot demo data reset.');
            }}
          />
        ) : null}
      </main>

      {mode === 'student' && (
        <BottomNav
          activeTab={activeTab}
          onNavigateTab={handleNavigateTab}
          activeRequestCount={activeRequestCount}
        />
      )}

      {isCompareOpen && (
        <CompareModal
          providers={comparedProviders}
          onClose={() => setIsCompareOpen(false)}
          onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
          onRequestProvider={(provider) => setRequestTarget({ provider })}
        />
      )}

      {requestTarget && activeStudent && (
        <RequestFormModal
          provider={requestTarget.provider}
          student={activeStudent}
          initialService={requestTarget.service}
          onClose={() => setRequestTarget(null)}
          onSubmitRequest={handleSubmitRequest}
          onGoToMyRequests={() => handleNavigateTab('requests')}
        />
      )}

      {isAdminPinOpen && (
        <AdminPinModal
          onClose={() => setIsAdminPinOpen(false)}
          onSuccess={() => {
            setIsAdminPinOpen(false);
            setMode('admin');
          }}
        />
      )}

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg whitespace-nowrap"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
