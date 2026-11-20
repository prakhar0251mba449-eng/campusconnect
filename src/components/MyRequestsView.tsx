import { FormEvent, useState } from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  MessageCircle,
  Star,
  X,
} from 'lucide-react';
import {
  PilotFeedback,
  Provider,
  RequestStatus,
  Review,
  ServiceRequest,
  Student,
} from '../types';
import {
  buildWhatsAppUrl,
  formatInr,
  formatRequestWhatsAppMessage,
} from '../utils/campusLogic';

interface MyRequestsViewProps {
  student: Student;
  requests: ServiceRequest[];
  providers: Provider[];
  reviews: Review[];
  feedbacks: PilotFeedback[];
  onBrowseServices: () => void;
  onCancelRequest: (requestId: string) => void;
  onSubmitReview: (payload: {
    requestId: string;
    providerId: string;
    rating: number;
    comment: string;
  }) => void;
  onSubmitFeedback: (payload: {
    requestId: string;
    easyToFind: 'Yes' | 'Somewhat' | 'No';
    wouldReuse: 'Yes' | 'Maybe' | 'No';
    willingToPay: 'Yes' | 'Maybe' | 'No';
  }) => void;
}

export function MyRequestsView({
  student,
  requests,
  providers,
  reviews,
  feedbacks,
  onBrowseServices,
  onCancelRequest,
  onSubmitReview,
  onSubmitFeedback,
}: MyRequestsViewProps) {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'All'>('All');
  const [reviewingRequest, setReviewingRequest] = useState<ServiceRequest | null>(null);
  const [feedbackRequest, setFeedbackRequest] = useState<ServiceRequest | null>(null);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Pilot feedback form state
  const [easyToFind, setEasyToFind] = useState<'Yes' | 'Somewhat' | 'No'>('Yes');
  const [wouldReuse, setWouldReuse] = useState<'Yes' | 'Maybe' | 'No'>('Yes');
  const [willingToPay, setWillingToPay] = useState<'Yes' | 'Maybe' | 'No'>('Yes');

  const providerMap = new Map(providers.map((p) => [p.id, p]));
  const studentRequests = requests
    .filter((r) => r.studentId === student.id)
    .filter((r) => (statusFilter === 'All' ? true : r.status === statusFilter))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleReviewSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!reviewingRequest) return;
    onSubmitReview({
      requestId: reviewingRequest.id,
      providerId: reviewingRequest.providerId,
      rating,
      comment: comment.trim() || 'Good service experience.',
    });
    const reqForFeedback = reviewingRequest;
    setReviewingRequest(null);
    setRating(5);
    setComment('');
    // Prompt pilot feedback right after review if not submitted yet
    const alreadyHasFeedback = feedbacks.some((f) => f.requestId === reqForFeedback.id);
    if (!alreadyHasFeedback) {
      setFeedbackRequest(reqForFeedback);
    }
  };

  const handleFeedbackSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!feedbackRequest) return;
    onSubmitFeedback({
      requestId: feedbackRequest.id,
      easyToFind,
      wouldReuse,
      willingToPay,
    });
    setFeedbackRequest(null);
  };

  const getStatusStyle = (status: RequestStatus) => {
    switch (status) {
      case 'Pending':
        return 'text-amber-700';
      case 'Accepted':
        return 'text-blue-700';
      case 'Completed':
        return 'text-emerald-700';
      case 'Cancelled':
        return 'text-slate-500';
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            My Service Requests
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Track status, message providers on WhatsApp, and rate completed services.
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['All', 'Pending', 'Accepted', 'Completed', 'Cancelled'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-blue-700 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {studentRequests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-3">
          <p className="font-display text-lg font-bold text-slate-900">
            No {statusFilter === 'All' ? '' : statusFilter.toLowerCase()} requests yet
          </p>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Browse verified local food, laundry, printing, and transport providers near your hostel to send your first request.
          </p>
          <button
            type="button"
            onClick={onBrowseServices}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors"
          >
            Browse services
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {studentRequests.map((req) => {
            const provider = providerMap.get(req.providerId);
            const existingReview = reviews.find((r) => r.requestId === req.id);
            const existingFeedback = feedbacks.find((f) => f.requestId === req.id);
            const waUrl = provider
              ? buildWhatsAppUrl(
                  provider.phone,
                  formatRequestWhatsAppMessage(provider, student, req)
                )
              : '#';

            return (
              <article
                key={req.id}
                data-testid={`request-card-${req.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-semibold text-slate-700">{req.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>{provider?.category ?? 'Service'}</span>
                      <span aria-hidden="true">·</span>
                      <span className={`font-semibold ${getStatusStyle(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                    <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 mt-1">
                      {provider?.name ?? 'Local Provider'}
                    </h2>
                    <p className="text-sm text-slate-700 mt-0.5">
                      {req.serviceDetails} × {req.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-mono text-base font-bold text-slate-900 tabular-nums">
                      {formatInr(req.estimatedPrice)}
                    </p>
                    <p className="text-xs text-slate-500">Cash / UPI direct</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                    <span>Preferred: {req.preferredTime}</span>
                  </div>
                  <div className="truncate">Address: {req.address}</div>
                </div>

                {/* Progress Steps */}
                {req.status !== 'Cancelled' && (
                  <div className="flex items-center gap-2 text-xs pt-1">
                    <span
                      className={
                        req.status === 'Pending'
                          ? 'font-bold text-blue-800'
                          : 'font-medium text-emerald-700'
                      }
                    >
                      Pending
                    </span>
                    <span className="text-slate-300" aria-hidden="true">→</span>
                    <span
                      className={
                        req.status === 'Accepted'
                          ? 'font-bold text-blue-800'
                          : req.status === 'Completed'
                          ? 'font-medium text-emerald-700'
                          : 'text-slate-400'
                      }
                    >
                      Accepted
                    </span>
                    <span className="text-slate-300" aria-hidden="true">→</span>
                    <span
                      className={
                        req.status === 'Completed'
                          ? 'font-bold text-emerald-700'
                          : 'text-slate-400'
                      }
                    >
                      Completed
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  {provider && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                      <span>WhatsApp Provider</span>
                    </a>
                  )}

                  {req.status === 'Pending' && (
                    <button
                      type="button"
                      onClick={() => onCancelRequest(req.id)}
                      className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-600 text-xs font-semibold transition-colors"
                    >
                      Cancel request
                    </button>
                  )}

                  {req.status === 'Completed' && !existingReview && (
                    <button
                      type="button"
                      onClick={() => setReviewingRequest(req)}
                      className="min-h-[42px] px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Rate & Review</span>
                    </button>
                  )}

                  {req.status === 'Completed' && existingReview && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 px-2">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Reviewed ({existingReview.rating}/5)
                    </span>
                  )}

                  {req.status === 'Completed' && !existingFeedback && (
                    <button
                      type="button"
                      onClick={() => setFeedbackRequest(req)}
                      className="min-h-[42px] px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>3-Question Pilot Feedback</span>
                    </button>
                  )}

                  {req.status === 'Completed' && existingFeedback && (
                    <span className="text-xs text-slate-500 px-2">
                      Pilot feedback recorded
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewingRequest && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 id="review-modal-title" className="font-display text-lg font-bold text-slate-900">
                Rate {providerMap.get(reviewingRequest.providerId)?.name}
              </h2>
              <button
                type="button"
                onClick={() => setReviewingRequest(null)}
                aria-label="Close review modal"
                className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <span className="block text-sm font-medium text-slate-700 mb-2">
                  Your rating
                </span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`${star} star${star > 1 ? 's' : ''}`}
                      className={`min-h-[44px] min-w-[44px] rounded-xl border flex items-center justify-center transition-colors ${
                        rating >= star
                          ? 'border-orange-300 bg-orange-50 text-orange-600'
                          : 'border-slate-200 text-slate-300'
                      }`}
                    >
                      <Star
                        className={`w-5 h-5 ${rating >= star ? 'fill-orange-500' : ''}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="rev-comment" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Short review for fellow students
                </label>
                <textarea
                  id="rev-comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the quality, pricing, and timeliness?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-colors"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3-Question Pilot Feedback Modal */}
      {feedbackRequest && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pilot-feedback-title"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="pilot-feedback-title" className="font-display text-lg font-bold text-slate-900">
                  Quick Pilot Feedback
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Helps us improve CampusConnect for Dehradun students
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackRequest(null)}
                aria-label="Close pilot feedback modal"
                className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-800 mb-2">
                  1. Was it easy to find a provider?
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(['Yes', 'Somewhat', 'No'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setEasyToFind(opt)}
                      className={`min-h-[44px] rounded-xl border text-xs font-semibold transition-colors ${
                        easyToFind === opt
                          ? 'border-blue-700 bg-blue-50 text-blue-900'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-800 mb-2">
                  2. Would you use CampusConnect again?
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(['Yes', 'Maybe', 'No'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setWouldReuse(opt)}
                      className={`min-h-[44px] rounded-xl border text-xs font-semibold transition-colors ${
                        wouldReuse === opt
                          ? 'border-blue-700 bg-blue-50 text-blue-900'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-800 mb-2">
                  3. Would you pay ₹10–25 for this convenience?
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(['Yes', 'Maybe', 'No'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setWillingToPay(opt)}
                      className={`min-h-[44px] rounded-xl border text-xs font-semibold transition-colors ${
                        willingToPay === opt
                          ? 'border-blue-700 bg-blue-50 text-blue-900'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-colors"
              >
                Submit Pilot Feedback
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
