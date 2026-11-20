import { FormEvent, useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  MessageCircle,
  X,
} from 'lucide-react';
import {
  Provider,
  ProviderServiceItem,
  ServiceRequest,
  Student,
} from '../types';
import {
  buildWhatsAppUrl,
  formatInr,
  formatRequestWhatsAppMessage,
  validateRequestInput,
} from '../utils/campusLogic';

interface RequestFormModalProps {
  provider: Provider;
  student: Student;
  initialService?: ProviderServiceItem;
  onClose: () => void;
  onSubmitRequest: (payload: {
    providerId: string;
    serviceDetails: string;
    quantity: number;
    preferredTime: string;
    address: string;
    notes: string;
    estimatedPrice: number;
  }) => ServiceRequest;
  onGoToMyRequests: () => void;
}

export function RequestFormModal({
  provider,
  student,
  initialService,
  onClose,
  onSubmitRequest,
  onGoToMyRequests,
}: RequestFormModalProps) {
  const defaultService = initialService ?? provider.services[0];
  const [selectedServiceName, setSelectedServiceName] = useState(
    defaultService?.name ?? 'Custom service request'
  );
  const [customDetails, setCustomDetails] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [preferredTime, setPreferredTime] = useState('Today, 6:00 PM');
  const [address, setAddress] = useState(
    `${student.accommodationType} in ${student.area}, near ${student.college}`
  );
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [createdRequest, setCreatedRequest] = useState<ServiceRequest | null>(null);

  const matchedService = provider.services.find((s) => s.name === selectedServiceName);
  const unitPrice = matchedService ? matchedService.price : provider.priceMin;
  const estimatedPrice = Math.max(unitPrice * quantity, 0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const details =
      selectedServiceName === 'Other / Custom'
        ? customDetails.trim()
        : selectedServiceName;

    const validationError = validateRequestInput({
      serviceDetails: details,
      quantity,
      preferredTime,
      address,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    const created = onSubmitRequest({
      providerId: provider.id,
      serviceDetails: details,
      quantity,
      preferredTime: preferredTime.trim(),
      address: address.trim(),
      notes: notes.trim(),
      estimatedPrice,
    });
    setCreatedRequest(created);
  };

  if (createdRequest) {
    const whatsappUrl = buildWhatsAppUrl(
      provider.phone,
      formatRequestWhatsAppMessage(provider, student, createdRequest)
    );

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-confirmed-title"
        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xl max-h-[92vh] overflow-y-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h2
                  id="request-confirmed-title"
                  className="font-display text-xl font-bold text-slate-900"
                >
                  Request Sent!
                </h2>
                <p className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
                  ID: {createdRequest.id} · Status: {createdRequest.status}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close confirmation dialog"
              className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status progression */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-600">Status flow</p>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-blue-800 font-bold">1. Pending</span>
              <span className="text-slate-300" aria-hidden="true">→</span>
              <span className="text-slate-400">2. Accepted</span>
              <span className="text-slate-300" aria-hidden="true">→</span>
              <span className="text-slate-400">3. Completed</span>
            </div>
          </div>

          <div className="space-y-2 text-sm border-t border-b border-slate-100 py-4">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Provider</span>
              <span className="font-semibold text-slate-900 text-right">{provider.name}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Service</span>
              <span className="font-medium text-slate-900 text-right">
                {createdRequest.serviceDetails} × {createdRequest.quantity}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Preferred time</span>
              <span className="font-medium text-slate-900 text-right">
                {createdRequest.preferredTime}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Estimated price</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatInr(createdRequest.estimatedPrice)}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-orange-50 border border-orange-200 px-3.5 py-2.5 text-xs text-orange-900 flex items-start gap-2">
            <CreditCard className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Pay the provider directly via <strong>Cash or UPI</strong> when your service is delivered or completed.
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span>Contact provider on WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={() => {
                onClose();
                onGoToMyRequests();
              }}
              className="w-full min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-colors"
            >
              View in My Requests
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-form-title"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 max-h-[92vh] flex flex-col shadow-xl">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <h2 id="request-form-title" className="font-display text-lg font-bold text-slate-900">
              Request from {provider.name}
            </h2>
            <p className="text-xs text-slate-500">
              {provider.category} · {provider.area}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close request form"
            className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="req-service" className="block text-sm font-medium text-slate-700 mb-1.5">
              Service needed
            </label>
            <select
              id="req-service"
              value={selectedServiceName}
              onChange={(e) => setSelectedServiceName(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-blue-700"
            >
              {provider.services.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} ({formatInr(s.price)} / {s.unit})
                </option>
              ))}
              <option value="Other / Custom">Other / Custom request</option>
            </select>
          </div>

          {selectedServiceName === 'Other / Custom' && (
            <div>
              <label htmlFor="req-custom" className="block text-sm font-medium text-slate-700 mb-1.5">
                Describe what you need
              </label>
              <input
                id="req-custom"
                type="text"
                value={customDetails}
                onChange={(e) => setCustomDetails(e.target.value)}
                placeholder="e.g. 50 pages B&W printout + spiral bind"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="req-qty" className="block text-sm font-medium text-slate-700 mb-1.5">
                Quantity / Units
              </label>
              <input
                id="req-qty"
                type="number"
                min={1}
                max={100}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="req-time" className="block text-sm font-medium text-slate-700 mb-1.5">
                Preferred time
              </label>
              <input
                id="req-time"
                type="text"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                placeholder="e.g. Today, 6:00 PM"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="req-address" className="block text-sm font-medium text-slate-700 mb-1.5">
              Pickup / Delivery address
            </label>
            <input
              id="req-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Hostel / PG / Room number"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label htmlFor="req-notes" className="block text-sm font-medium text-slate-700 mb-1.5">
              Notes for provider (optional)
            </label>
            <textarea
              id="req-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific instructions or college gate landmark..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          {/* Price estimate + Direct Payment Notice */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Estimated total</span>
              <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                {formatInr(estimatedPrice)}
              </span>
            </div>
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-orange-600 shrink-0" aria-hidden="true" />
              <span>Pay the provider directly (Cash / UPI) on completion.</span>
            </p>
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            Confirm Service Request
          </button>
        </form>
      </div>
    </div>
  );
}
