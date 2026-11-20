import {
  ArrowLeft,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  ShieldCheck,
  Star,
  Tag,
} from 'lucide-react';
import { Provider, ProviderServiceItem, Review, Student } from '../types';
import { buildWhatsAppUrl, formatInr } from '../utils/campusLogic';
import { CategoryIcon, getCategoryTint } from './CategoryIcon';

interface ProviderDetailViewProps {
  provider: Provider;
  reviews: Review[];
  students: Student[];
  isCompared: boolean;
  onBack: () => void;
  onToggleCompare: (providerId: string) => void;
  onStartRequest: (provider: Provider, preselectedService?: ProviderServiceItem) => void;
}

export function ProviderDetailView({
  provider,
  reviews,
  students,
  isCompared,
  onBack,
  onToggleCompare,
  onStartRequest,
}: ProviderDetailViewProps) {
  const providerReviews = reviews.filter((r) => r.providerId === provider.id);
  const studentNameMap = new Map(students.map((s) => [s.id, s.name]));

  const whatsappDirectUrl = buildWhatsAppUrl(
    provider.phone,
    `Hi ${provider.name}, I found you on CampusConnect and wanted to ask about your ${provider.category.toLowerCase()} services.`
  );

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-3 py-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 text-slate-700 text-sm font-semibold inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to services</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleCompare(provider.id)}
          className={`min-h-[44px] px-4 py-2 rounded-xl border text-sm font-semibold inline-flex items-center gap-1.5 transition-colors ${
            isCompared
              ? 'border-blue-700 bg-blue-50 text-blue-900'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {isCompared ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isCompared ? 'Added to Compare' : 'Compare'}</span>
        </button>
      </div>

      {/* Main Provider Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${getCategoryTint(
                provider.category
              )}`}
            >
              <CategoryIcon category={provider.category} className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{provider.category}</span>
                <span aria-hidden="true">·</span>
                <span>{provider.area}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {provider.distanceKm.toFixed(1)} km from campus
                </span>
                {provider.verified && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-blue-700 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                      Verified vendor
                    </span>
                  </>
                )}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                {provider.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed max-w-2xl">
                {provider.description}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
            <div className="inline-flex items-center gap-1.5 text-lg font-bold text-slate-900 tabular-nums">
              <Star className="w-5 h-5 fill-orange-500 text-orange-500" aria-hidden="true" />
              <span>{provider.avgRating > 0 ? provider.avgRating.toFixed(1) : 'New'}</span>
            </div>
            <span className="text-xs text-slate-500 tabular-nums">
              {provider.ratingCount} {provider.ratingCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-sm">
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs text-slate-500">Opening hours</p>
              <p className="font-medium text-slate-900">{provider.hours}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs text-slate-500">Locality</p>
              <p className="font-medium text-slate-900">{provider.area}, Dehradun</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs text-slate-500">Contact number</p>
              <p className="font-mono font-medium text-slate-900 tabular-nums">
                +{provider.phone}
              </p>
            </div>
          </div>
        </div>

        {provider.studentOffer && (
          <div className="rounded-2xl bg-orange-50 border border-orange-200 px-4 py-3 flex items-start gap-2.5 text-sm text-orange-900">
            <Tag className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <span className="font-semibold">Student Offer: </span>
              <span>{provider.studentOffer}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => onStartRequest(provider)}
            className="flex-1 min-h-[48px] px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            Request this service
          </button>
          <a
            href={whatsappDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[48px] px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Services & Price List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Services & transparent pricing
            </h2>
            <span className="text-xs text-slate-500">Pay direct via Cash / UPI</span>
          </div>

          <div className="divide-y divide-slate-100">
            {provider.services.map((item) => (
              <div
                key={item.name}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.unit}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                    {formatInr(item.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onStartRequest(provider, item)}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-700 hover:text-white text-slate-800 text-xs font-semibold transition-colors"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Student Reviews */}
        <section className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Student reviews ({providerReviews.length})
          </h2>

          {providerReviews.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">
              No reviews yet. Complete a request with {provider.name} to leave the first review!
            </p>
          ) : (
            <div className="space-y-4 divide-y divide-slate-100">
              {providerReviews.map((rev) => (
                <div key={rev.id} className="pt-3 first:pt-0 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900">
                      {studentNameMap.get(rev.studentId) ?? 'Pilot Student'}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-800 tabular-nums">
                      <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" aria-hidden="true" />
                      {rev.rating}.0
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
