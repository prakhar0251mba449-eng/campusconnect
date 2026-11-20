import { FormEvent, useState } from 'react';
import { ArrowRight, Search, ShieldCheck, Tag } from 'lucide-react';
import { APP_CONFIG, SERVICE_CATEGORIES } from '../config';
import { Provider, ServiceCategory, Student } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { ProviderCard } from './ProviderCard';

interface HomeViewProps {
  student: Student;
  providers: Provider[];
  compareIds: string[];
  onSearchSubmit: (query: string, category?: ServiceCategory) => void;
  onSelectProvider: (provider: Provider) => void;
  onToggleCompare: (providerId: string) => void;
  onQuickRequest: (provider: Provider) => void;
  onOpenCompare: () => void;
}

export function HomeView({
  student,
  providers,
  compareIds,
  onSearchSubmit,
  onSelectProvider,
  onToggleCompare,
  onQuickRequest,
  onOpenCompare,
}: HomeViewProps) {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearchSubmit(searchInput);
  };

  const offersProviders = providers.filter((p) => p.studentOffer.trim().length > 0).slice(0, 4);
  const featuredProviders = [...providers]
    .sort((a, b) => {
      if (a.verified !== b.verified) return a.verified ? -1 : 1;
      return b.avgRating - a.avgRating;
    })
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Hero & Search Anchor */}
      <section className="bg-blue-900 text-white rounded-3xl p-5 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-blue-200 font-medium">
            <span>Hi {student.name.split(' ')[0]}</span>
            <span aria-hidden="true">·</span>
            <span>{student.college}</span>
            <span aria-hidden="true">·</span>
            <span>
              {student.area} ({student.accommodationType})
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-balance leading-tight">
            {APP_CONFIG.tagline}
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl leading-relaxed">
            Discover verified tiffins, laundry, printing, stationery, and transport near your campus in {APP_CONFIG.city}.
          </p>

          <form onSubmit={handleSubmit} className="pt-1 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <label htmlFor="home-search-input" className="sr-only">
                Search local services
              </label>
              <input
                id="home-search-input"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search laundry, tiffin, xerox, Bidholi..."
                className="w-full min-h-[48px] pl-10 pr-4 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              type="submit"
              className="min-h-[48px] px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm whitespace-nowrap shrink-0 transition-colors"
            >
              Find Services
            </button>
          </form>
        </div>
      </section>

      {/* Category Chips */}
      <section aria-labelledby="categories-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="categories-heading" className="font-display text-lg font-bold text-slate-900">
            Browse by category
          </h2>
          <button
            type="button"
            onClick={() => onSearchSubmit('')}
            className="text-sm font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 py-1"
          >
            <span>All {providers.length} vendors</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onSearchSubmit('', cat)}
              className="min-h-[68px] p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-700 hover:bg-blue-50/40 flex flex-col items-center justify-center gap-1.5 text-slate-800 transition-colors"
            >
              <CategoryIcon category={cat} className="w-5 h-5 text-blue-700" />
              <span className="text-xs font-semibold whitespace-nowrap">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Student Offers Section */}
      {offersProviders.length > 0 && (
        <section aria-labelledby="offers-heading" className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 id="offers-heading" className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-600 shrink-0" aria-hidden="true" />
              <span>Student-only offers</span>
            </h2>
            <span className="text-xs text-slate-500">Show your college ID on delivery</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {offersProviders.map((prov) => (
              <button
                key={prov.id}
                type="button"
                onClick={() => onSelectProvider(prov)}
                className="text-left bg-white rounded-2xl border border-slate-200 hover:border-orange-400 p-4 flex flex-col justify-between gap-2 transition-colors"
              >
                <div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span>{prov.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{prov.area}</span>
                  </div>
                  <p className="font-display font-semibold text-sm text-slate-900 mt-1">
                    {prov.name}
                  </p>
                </div>
                <p className="text-xs font-semibold text-orange-700 leading-snug">
                  {prov.studentOffer}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Featured & Verified Providers */}
      <section aria-labelledby="featured-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 id="featured-heading" className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700" aria-hidden="true" />
              <span>Top trusted providers near campus</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare up to 3 providers side-by-side or send a request directly
            </p>
          </div>
          {compareIds.length > 0 && (
            <button
              type="button"
              onClick={onOpenCompare}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              Compare selected ({compareIds.length}/3)
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredProviders.map((provider) => (
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
      </section>
    </div>
  );
}
