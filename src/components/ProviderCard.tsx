import { Check, MapPin, Plus, ShieldCheck, Star, Tag } from 'lucide-react';
import { Provider } from '../types';
import { formatInr } from '../utils/campusLogic';
import { CategoryIcon, getCategoryTint } from './CategoryIcon';

interface ProviderCardProps {
  provider: Provider;
  isCompared: boolean;
  onSelect: (provider: Provider) => void;
  onToggleCompare: (providerId: string) => void;
  onQuickRequest: (provider: Provider) => void;
}

export function ProviderCard({
  provider,
  isCompared,
  onSelect,
  onToggleCompare,
  onQuickRequest,
}: ProviderCardProps) {
  return (
    <article
      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col justify-between transition-shadow hover:shadow-md"
      data-testid={`provider-card-${provider.id}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${getCategoryTint(
                provider.category
              )}`}
            >
              <CategoryIcon category={provider.category} className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onSelect(provider)}
                className="text-left font-display font-semibold text-base text-slate-900 hover:text-blue-700 transition-colors leading-snug block focus-visible:outline-2 focus-visible:outline-blue-700 rounded"
              >
                {provider.name}
              </button>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 whitespace-nowrap overflow-hidden">
                <span className="shrink-0">{provider.category}</span>
                <span aria-hidden="true" className="shrink-0">·</span>
                <span className="inline-flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  <span className="truncate">{provider.area}</span>
                </span>
                <span aria-hidden="true" className="shrink-0">·</span>
                <span className="tabular-nums font-mono text-[11px] shrink-0">
                  {provider.distanceKm.toFixed(1)} km
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 text-sm font-semibold text-slate-900 tabular-nums">
            <Star className="w-4 h-4 fill-orange-500 text-orange-500" aria-hidden="true" />
            <span>{provider.avgRating > 0 ? provider.avgRating.toFixed(1) : 'New'}</span>
            {provider.ratingCount > 0 && (
              <span className="text-xs font-normal text-slate-400">
                ({provider.ratingCount})
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-slate-600 mt-3 line-clamp-2 min-h-[2.75rem] leading-relaxed">
          {provider.description}
        </p>

        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="font-mono tabular-nums font-medium text-slate-800">
            {formatInr(provider.priceMin)} – {formatInr(provider.priceMax)}
          </div>
          {provider.verified && (
            <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              Verified
            </span>
          )}
        </div>

        {provider.studentOffer && (
          <div className="mt-2.5 flex items-start gap-1.5 text-xs font-medium text-orange-700">
            <Tag className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{provider.studentOffer}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onQuickRequest(provider)}
          className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          Request service
        </button>
        <button
          type="button"
          onClick={() => onSelect(provider)}
          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors whitespace-nowrap"
        >
          Details
        </button>
        <button
          type="button"
          onClick={() => onToggleCompare(provider.id)}
          aria-label={
            isCompared
              ? `Remove ${provider.name} from compare`
              : `Add ${provider.name} to compare`
          }
          aria-pressed={isCompared}
          className={`min-h-[44px] min-w-[44px] px-2.5 rounded-xl border text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors whitespace-nowrap ${
            isCompared
              ? 'border-blue-700 bg-blue-50 text-blue-800'
              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
          }`}
        >
          {isCompared ? <Check className="w-4 h-4 shrink-0" /> : <Plus className="w-4 h-4 shrink-0" />}
          <span className="hidden sm:inline">{isCompared ? 'Added' : 'Compare'}</span>
        </button>
      </div>
    </article>
  );
}
