import { ArrowUpDown, Scale, Search, SlidersHorizontal, X } from 'lucide-react';
import { SERVICE_CATEGORIES } from '../config';
import { Provider, ProviderFilters, ServiceCategory, SortOption } from '../types';
import { ProviderCard } from './ProviderCard';

interface SearchViewProps {
  providers: Provider[];
  filteredProviders: Provider[];
  filters: ProviderFilters;
  compareIds: string[];
  onChangeFilters: (next: ProviderFilters) => void;
  onSelectProvider: (provider: Provider) => void;
  onToggleCompare: (providerId: string) => void;
  onQuickRequest: (provider: Provider) => void;
  onOpenCompare: () => void;
  onClearCompare: () => void;
}

export function SearchView({
  providers,
  filteredProviders,
  filters,
  compareIds,
  onChangeFilters,
  onSelectProvider,
  onToggleCompare,
  onQuickRequest,
  onOpenCompare,
  onClearCompare,
}: SearchViewProps) {
  const categories: (ServiceCategory | 'All')[] = ['All', ...SERVICE_CATEGORIES];

  const resetFilters = () => {
    onChangeFilters({
      query: '',
      category: 'All',
      maxPrice: null,
      minRating: 0,
      verifiedOnly: false,
      offersOnly: false,
      sortBy: 'nearest',
    });
  };

  const hasActiveFilters =
    filters.query.trim() !== '' ||
    filters.category !== 'All' ||
    filters.maxPrice !== null ||
    filters.minRating > 0 ||
    filters.verifiedOnly ||
    filters.offersOnly;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Explore Local Services
          </h1>
          <p className="text-sm text-slate-600 mt-0.5 tabular-nums">
            Showing {filteredProviders.length} of {providers.length} providers
          </p>
        </div>

        {compareIds.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCompare}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
            >
              <Scale className="w-4 h-4" aria-hidden="true" />
              <span>Compare ({compareIds.length}/3)</span>
            </button>
            <button
              type="button"
              onClick={onClearCompare}
              aria-label="Clear compare selection"
              className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <label htmlFor="explore-search-input" className="sr-only">
              Search providers by name, area, or service
            </label>
            <input
              id="explore-search-input"
              type="search"
              value={filters.query}
              onChange={(e) => onChangeFilters({ ...filters, query: e.target.value })}
              placeholder="Search tiffin, laundry, Bidholi, spiral binding..."
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="sr-only">
              Sort providers
            </label>
            <div className="relative w-full md:w-48">
              <ArrowUpDown
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <select
                id="sort-select"
                value={filters.sortBy}
                onChange={(e) =>
                  onChangeFilters({ ...filters, sortBy: e.target.value as SortOption })
                }
                className="w-full min-h-[44px] pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-700"
              >
                <option value="nearest">Nearest first</option>
                <option value="cheapest">Cheapest first</option>
                <option value="top_rated">Top rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter by service category"
          className="flex items-center gap-1.5 overflow-x-auto pb-1"
        >
          {categories.map((cat) => {
            const active = filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChangeFilters({ ...filters, category: cat })}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  active
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Secondary Filters */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
            Filters:
          </span>

          <label className="inline-flex items-center gap-2 min-h-[36px] px-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) =>
                onChangeFilters({ ...filters, verifiedOnly: e.target.checked })
              }
              className="rounded border-slate-300 text-blue-700 focus:ring-blue-700"
            />
            <span className="font-medium text-slate-700">Verified only</span>
          </label>

          <label className="inline-flex items-center gap-2 min-h-[36px] px-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={filters.offersOnly}
              onChange={(e) =>
                onChangeFilters({ ...filters, offersOnly: e.target.checked })
              }
              className="rounded border-slate-300 text-orange-600 focus:ring-orange-600"
            />
            <span className="font-medium text-slate-700">Student offers only</span>
          </label>

          <div className="flex items-center gap-1.5">
            <label htmlFor="max-price-select" className="text-slate-600 font-medium">
              Starting under:
            </label>
            <select
              id="max-price-select"
              value={filters.maxPrice ?? ''}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  maxPrice: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="min-h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium"
            >
              <option value="">Any price</option>
              <option value="50">₹50</option>
              <option value="100">₹100</option>
              <option value="300">₹300</option>
              <option value="1000">₹1,000</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label htmlFor="min-rating-select" className="text-slate-600 font-medium">
              Rating:
            </label>
            <select
              id="min-rating-select"
              value={filters.minRating}
              onChange={(e) =>
                onChangeFilters({ ...filters, minRating: Number(e.target.value) })
              }
              className="min-h-[36px] px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium"
            >
              <option value="0">All ratings</option>
              <option value="4">4.0+ stars</option>
              <option value="4.5">4.5+ stars</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto text-blue-700 hover:underline font-semibold py-1.5 px-2"
            >
              Reset all
            </button>
          )}
        </div>
      </div>

      {/* Results or Empty State */}
      {filteredProviders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-3">
          <p className="font-display text-lg font-bold text-slate-900">
            No matching service providers found
          </p>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Try clearing one of your filters or searching by a nearby Dehradun area like Bidholi, Pondha, or Clement Town.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors"
          >
            Show all providers
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isCompared={compareIds.includes(provider.id)}
              onSelect={onSelectProvider}
              onToggleCompare={onToggleCompare}
              onQuickRequest={onQuickRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
}
