import { CheckCircle2, Minus, Scale, Star, Trash2, X } from 'lucide-react';
import { Provider } from '../types';
import { formatInr } from '../utils/campusLogic';

interface CompareModalProps {
  providers: Provider[];
  onClose: () => void;
  onRemove: (providerId: string) => void;
  onRequestProvider: (provider: Provider) => void;
}

export function CompareModal({
  providers,
  onClose,
  onRemove,
  onRequestProvider,
}: CompareModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-dialog-title"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-white w-full sm:max-w-4xl rounded-t-3xl sm:rounded-3xl border border-slate-200 max-h-[90vh] flex flex-col shadow-xl">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-700" aria-hidden="true" />
            <h2 id="compare-dialog-title" className="font-display text-lg font-bold text-slate-900">
              Compare Providers ({providers.length}/3)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison dialog"
            className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-auto flex-1">
          {providers.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="font-semibold text-slate-900">No providers selected yet</p>
              <p className="text-sm text-slate-600">
                Tap "Compare" on up to 3 providers to view prices, ratings, and offers side by side.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[540px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 pr-4 text-xs font-semibold text-slate-500 w-32">
                      Criteria
                    </th>
                    {providers.map((p) => (
                      <th key={p.id} className="py-3 px-3 align-top">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-display text-sm font-bold text-slate-900">
                              {p.name}
                            </p>
                            <p className="text-xs font-normal text-slate-500 mt-0.5">
                              {p.category} · {p.area}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemove(p.id)}
                            aria-label={`Remove ${p.name} from compare`}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  <tr>
                    <td className="py-3.5 pr-4 text-xs font-medium text-slate-500">Price Range</td>
                    {providers.map((p) => (
                      <td key={p.id} className="py-3.5 px-3 font-mono tabular-nums font-semibold text-slate-900">
                        {formatInr(p.priceMin)} – {formatInr(p.priceMax)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 text-xs font-medium text-slate-500">Avg Rating</td>
                    {providers.map((p) => (
                      <td key={p.id} className="py-3.5 px-3 tabular-nums">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                          <Star className="w-4 h-4 fill-orange-500 text-orange-500" aria-hidden="true" />
                          {p.avgRating > 0 ? p.avgRating.toFixed(1) : 'New'}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">({p.ratingCount})</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 text-xs font-medium text-slate-500">Distance</td>
                    {providers.map((p) => (
                      <td key={p.id} className="py-3.5 px-3 font-mono tabular-nums text-slate-700">
                        {p.distanceKm.toFixed(1)} km
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 text-xs font-medium text-slate-500">Verified</td>
                    {providers.map((p) => (
                      <td key={p.id} className="py-3.5 px-3">
                        {p.verified ? (
                          <span className="inline-flex items-center gap-1 text-blue-700 font-medium text-xs">
                            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 text-xs">
                            <Minus className="w-4 h-4" aria-hidden="true" />
                            Standard
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 text-xs font-medium text-slate-500">Student Offer</td>
                    {providers.map((p) => (
                      <td key={p.id} className="py-3.5 px-3 text-xs">
                        {p.studentOffer ? (
                          <span className="text-orange-700 font-medium">{p.studentOffer}</span>
                        ) : (
                          <span className="text-slate-400">None listed</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 text-xs font-medium text-slate-500">Hours</td>
                    {providers.map((p) => (
                      <td key={p.id} className="py-3.5 px-3 text-xs text-slate-600">
                        {p.hours}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 pr-4" />
                    {providers.map((p) => (
                      <td key={p.id} className="py-4 px-3">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onRequestProvider(p);
                          }}
                          className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                        >
                          Request service
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
