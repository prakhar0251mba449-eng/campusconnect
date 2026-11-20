import { FormEvent, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Edit3,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { APP_CONFIG, DEHRADUN_AREAS, SERVICE_CATEGORIES } from '../config';
import {
  AnalyticsEvent,
  PilotFeedback,
  Provider,
  RequestStatus,
  ServiceCategory,
  ServiceRequest,
  Student,
} from '../types';
import {
  calculateAdminMetrics,
  formatInr,
  generateRequestsCsv,
} from '../utils/campusLogic';

interface AdminViewProps {
  students: Student[];
  providers: Provider[];
  requests: ServiceRequest[];
  feedbacks: PilotFeedback[];
  events: AnalyticsEvent[];
  onUpdateRequestStatus: (requestId: string, status: RequestStatus) => void;
  onSaveProvider: (provider: Provider) => void;
  onDeleteProvider: (providerId: string) => void;
}

export function AdminView({
  students,
  providers,
  requests,
  feedbacks,
  events,
  onUpdateRequestStatus,
  onSaveProvider,
  onDeleteProvider,
}: AdminViewProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'requests' | 'providers'>('overview');
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [isCreatingProvider, setIsCreatingProvider] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Provider form state
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState<ServiceCategory>('Food');
  const [pArea, setPArea] = useState(DEHRADUN_AREAS[0]);
  const [pDistance, setPDistance] = useState('0.5');
  const [pPriceMin, setPPriceMin] = useState('50');
  const [pPriceMax, setPPriceMax] = useState('250');
  const [pHours, setPHours] = useState('8:00 AM – 9:00 PM');
  const [pPhone, setPPhone] = useState('919897001199');
  const [pOffer, setPOffer] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pVerified, setPVerified] = useState(true);
  const [pServiceName, setPServiceName] = useState('Standard Service');
  const [pServicePrice, setPServicePrice] = useState('100');
  const [pFormError, setPFormError] = useState<string | null>(null);

  const metrics = calculateAdminMetrics(students, providers, requests, feedbacks, events);
  const maxCategoryCount = Math.max(
    1,
    ...metrics.requestsByCategory.map((c) => c.count)
  );

  const studentMap = new Map(students.map((s) => [s.id, s]));
  const providerMap = new Map(providers.map((p) => [p.id, p]));

  const openCreateModal = () => {
    setEditingProvider(null);
    setIsCreatingProvider(true);
    setPName('');
    setPCategory('Food');
    setPArea(DEHRADUN_AREAS[0]);
    setPDistance('0.5');
    setPPriceMin('50');
    setPPriceMax('250');
    setPHours('8:00 AM – 9:00 PM');
    setPPhone('919897001199');
    setPOffer('');
    setPDescription('');
    setPVerified(true);
    setPServiceName('Standard Package');
    setPServicePrice('100');
    setPFormError(null);
  };

  const openEditModal = (prov: Provider) => {
    setEditingProvider(prov);
    setIsCreatingProvider(false);
    setPName(prov.name);
    setPCategory(prov.category);
    setPArea(prov.area);
    setPDistance(String(prov.distanceKm));
    setPPriceMin(String(prov.priceMin));
    setPPriceMax(String(prov.priceMax));
    setPHours(prov.hours);
    setPPhone(prov.phone);
    setPOffer(prov.studentOffer);
    setPDescription(prov.description);
    setPVerified(prov.verified);
    setPServiceName(prov.services[0]?.name ?? 'Standard Service');
    setPServicePrice(String(prov.services[0]?.price ?? prov.priceMin));
    setPFormError(null);
  };

  const handleSaveProviderForm = (e: FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || !pArea.trim() || !pPhone.trim()) {
      setPFormError('Provider name, area, and phone number are required.');
      return;
    }
    const minP = Math.max(0, Number(pPriceMin) || 0);
    const maxP = Math.max(minP, Number(pPriceMax) || minP);
    const dist = Math.max(0.1, Number(pDistance) || 0.5);
    const baseServicePrice = Math.max(0, Number(pServicePrice) || minP);

    const saved: Provider = {
      id: editingProvider?.id ?? `prov-${Date.now()}`,
      name: pName.trim(),
      category: pCategory,
      area: pArea.trim(),
      distanceKm: dist,
      priceMin: minP,
      priceMax: maxP,
      description:
        pDescription.trim() ||
        `Reliable ${pCategory.toLowerCase()} service for students near ${pArea}.`,
      services:
        editingProvider && editingProvider.services.length > 0
          ? [
              { ...editingProvider.services[0], name: pServiceName.trim() || editingProvider.services[0].name, price: baseServicePrice },
              ...editingProvider.services.slice(1),
            ]
          : [{ name: pServiceName.trim() || 'Standard Service', price: baseServicePrice, unit: 'service' }],
      hours: pHours.trim() || '9:00 AM – 9:00 PM',
      phone: pPhone.trim(),
      verified: pVerified,
      studentOffer: pOffer.trim(),
      avgRating: editingProvider?.avgRating ?? 0,
      ratingCount: editingProvider?.ratingCount ?? 0,
    };

    onSaveProvider(saved);
    setEditingProvider(null);
    setIsCreatingProvider(false);
  };

  const handleExportCsv = () => {
    const csv = generateRequestsCsv(requests, providers, students);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `campusconnect-dehradun-requests.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sortedRequests = [...requests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Admin Pilot Dashboard ({APP_CONFIG.city})
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Track MVP transactions, estimated commission (10% of ₹250 avg order), and pilot feedback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Export Requests CSV</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Provider</span>
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {(
          [
            { id: 'overview', label: 'Analytics & Pilot Metrics' },
            { id: 'requests', label: `All Requests (${requests.length})` },
            { id: 'providers', label: `Providers (${providers.length})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id)}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
              activeSection === tab.id
                ? 'bg-blue-700 text-white'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Total Students</p>
              <p className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {metrics.totalStudents}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Total Providers</p>
              <p className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {metrics.totalProviders}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Total Requests</p>
              <p className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {metrics.totalRequests}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Completed</p>
              <p className="font-display text-2xl font-bold text-emerald-700 tabular-nums mt-1">
                {metrics.completedRequests}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Completion Rate</p>
              <p className="font-display text-2xl font-bold text-blue-800 tabular-nums mt-1">
                {metrics.completionRatePct}%
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-orange-200 p-4">
              <p className="text-xs text-orange-700 font-medium">Est. Commission</p>
              <p className="font-display text-2xl font-bold text-orange-600 tabular-nums mt-1">
                {formatInr(metrics.estimatedCommissionInr)}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">₹25 / completed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Requests by Category Bar Chart */}
            <section className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Requests by Category
                </h2>
                <span className="text-xs text-slate-500 tabular-nums">
                  {metrics.totalRequests} total
                </span>
              </div>
              <div className="space-y-3">
                {metrics.requestsByCategory.map((item) => {
                  const widthPct = Math.round((item.count / maxCategoryCount) * 100);
                  return (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{item.category}</span>
                        <span className="font-mono font-semibold text-slate-900 tabular-nums">
                          {item.count}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-700 transition-all"
                          style={{ width: `${item.count > 0 ? Math.max(widthPct, 8) : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Pilot Feedback & Event Analytics */}
            <section className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3">
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Pilot Feedback ({metrics.feedbackCount})
                </h2>
                {metrics.feedbackCount === 0 ? (
                  <p className="text-sm text-slate-500">No pilot feedback responses yet.</p>
                ) : (
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <span className="text-slate-600">Easy to find a provider ("Yes")</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {metrics.easyToFindYesPct}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <span className="text-slate-600">Would use again ("Yes")</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {metrics.wouldReuseYesPct}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-600">Willing to pay ₹10–25 (Yes/Maybe)</span>
                      <span className="font-mono font-bold text-orange-600 tabular-nums">
                        {metrics.willingToPayYesOrMaybePct}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3">
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Tracked Pilot Funnel Events
                </h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Searches</p>
                    <p className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                      {metrics.eventCounts.searches}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Provider views</p>
                    <p className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                      {metrics.eventCounts.providerViews}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Requests created</p>
                    <p className="font-mono text-xl font-bold text-blue-800 tabular-nums">
                      {metrics.eventCounts.requestsCreated}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Requests completed</p>
                    <p className="font-mono text-xl font-bold text-emerald-700 tabular-nums">
                      {metrics.eventCounts.requestsCompleted}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {activeSection === 'requests' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Provider</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Est. Price</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {sortedRequests.map((req) => {
                  const stu = studentMap.get(req.studentId);
                  const prov = providerMap.get(req.providerId);
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">
                        {req.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{stu?.name ?? 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{stu?.college}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-900">{prov?.name ?? 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{prov?.category}</p>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-800 truncate">
                          {req.serviceDetails} × {req.quantity}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{req.preferredTime}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 tabular-nums">
                        {formatInr(req.estimatedPrice)}
                      </td>
                      <td className="py-3.5 px-4">
                        <label htmlFor={`status-${req.id}`} className="sr-only">
                          Status for {req.id}
                        </label>
                        <select
                          id={`status-${req.id}`}
                          value={req.status}
                          onChange={(e) =>
                            onUpdateRequestStatus(req.id, e.target.value as RequestStatus)
                          }
                          className="min-h-[38px] px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'providers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((prov) => (
            <article
              key={prov.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-500">
                      {prov.category} · {prov.area} · {prov.distanceKm.toFixed(1)} km
                    </p>
                    <h3 className="font-display font-bold text-base text-slate-900 mt-0.5">
                      {prov.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSaveProvider({ ...prov, verified: !prov.verified })}
                    aria-label={`Toggle verified for ${prov.name}`}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors ${
                      prov.verified
                        ? 'bg-blue-50 text-blue-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    {prov.verified ? 'Verified' : 'Unverified'}
                  </button>
                </div>

                <p className="font-mono text-xs font-semibold text-slate-700 tabular-nums mt-2">
                  {formatInr(prov.priceMin)} – {formatInr(prov.priceMax)} · +{prov.phone}
                </p>
                {prov.studentOffer && (
                  <p className="text-xs text-orange-700 mt-1.5">{prov.studentOffer}</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => openEditModal(prov)}
                  className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                  Edit
                </button>

                {confirmDeleteId === prov.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteProvider(prov.id);
                        setConfirmDeleteId(null);
                      }}
                      className="min-h-[38px] px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="min-h-[38px] px-2.5 py-1 rounded-lg text-xs text-slate-500"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(prov.id)}
                    aria-label={`Delete ${prov.name}`}
                    className="min-h-[40px] px-3 py-1.5 rounded-xl hover:bg-red-50 text-slate-500 hover:text-red-700 text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    Delete
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add / Edit Provider Modal */}
      {(isCreatingProvider || editingProvider) && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="provider-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 max-h-[92vh] flex flex-col shadow-xl">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 id="provider-modal-title" className="font-display text-lg font-bold text-slate-900">
                {editingProvider ? `Edit ${editingProvider.name}` : 'Add Local Provider'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingProvider(null);
                  setIsCreatingProvider(false);
                }}
                aria-label="Close provider form"
                className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProviderForm} className="p-5 space-y-3.5 overflow-y-auto">
              {pFormError && (
                <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs text-red-800">
                  {pFormError}
                </div>
              )}

              <div>
                <label htmlFor="adm-p-name" className="block text-xs font-semibold text-slate-700 mb-1">
                  Provider Name
                </label>
                <input
                  id="adm-p-name"
                  type="text"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="e.g. Doon Express Laundry"
                  className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="adm-p-cat" className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    id="adm-p-cat"
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value as ServiceCategory)}
                    className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 bg-white text-sm"
                  >
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="adm-p-area" className="block text-xs font-semibold text-slate-700 mb-1">
                    Dehradun Area
                  </label>
                  <input
                    id="adm-p-area"
                    value={pArea}
                    onChange={(e) => setPArea(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="adm-p-dist" className="block text-xs font-semibold text-slate-700 mb-1">
                    Distance (km)
                  </label>
                  <input
                    id="adm-p-dist"
                    type="number"
                    step="0.1"
                    value={pDistance}
                    onChange={(e) => setPDistance(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-sm font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="adm-p-min" className="block text-xs font-semibold text-slate-700 mb-1">
                    Min Price (₹)
                  </label>
                  <input
                    id="adm-p-min"
                    type="number"
                    value={pPriceMin}
                    onChange={(e) => setPPriceMin(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-sm font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="adm-p-max" className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Price (₹)
                  </label>
                  <input
                    id="adm-p-max"
                    type="number"
                    value={pPriceMax}
                    onChange={(e) => setPPriceMax(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="adm-p-svc" className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Service Item
                  </label>
                  <input
                    id="adm-p-svc"
                    type="text"
                    value={pServiceName}
                    onChange={(e) => setPServiceName(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="adm-p-svc-price" className="block text-xs font-semibold text-slate-700 mb-1">
                    Item Price (₹)
                  </label>
                  <input
                    id="adm-p-svc-price"
                    type="number"
                    value={pServicePrice}
                    onChange={(e) => setPServicePrice(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="adm-p-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp Phone
                  </label>
                  <input
                    id="adm-p-phone"
                    type="tel"
                    value={pPhone}
                    onChange={(e) => setPPhone(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-sm font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="adm-p-hours" className="block text-xs font-semibold text-slate-700 mb-1">
                    Opening Hours
                  </label>
                  <input
                    id="adm-p-hours"
                    type="text"
                    value={pHours}
                    onChange={(e) => setPHours(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="adm-p-offer" className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Offer (optional)
                </label>
                <input
                  id="adm-p-offer"
                  type="text"
                  value={pOffer}
                  onChange={(e) => setPOffer(e.target.value)}
                  placeholder="e.g. 10% off with college ID"
                  className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label htmlFor="adm-p-desc" className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  id="adm-p-desc"
                  rows={2}
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-slate-800 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={pVerified}
                  onChange={(e) => setPVerified(e.target.checked)}
                  className="rounded border-slate-300 text-blue-700"
                />
                <CheckCircle2 className="w-4 h-4 text-blue-700" aria-hidden="true" />
                <span className="font-medium">Mark as Verified Campus Vendor</span>
              </label>

              <button
                type="submit"
                className="w-full min-h-[46px] rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-colors"
              >
                {editingProvider ? 'Save Provider Changes' : 'Create Provider'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
