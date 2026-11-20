import { MapPin, Shield } from 'lucide-react';
import { APP_CONFIG } from '../config';

export type StudentTab = 'home' | 'search' | 'requests' | 'profile';

interface HeaderProps {
  mode: 'student' | 'admin';
  activeTab: StudentTab;
  onNavigateTab: (tab: StudentTab) => void;
  onRequestAdminMode: () => void;
  onExitAdminMode: () => void;
  requestCountBadge?: number;
}

export function Header({
  mode,
  activeTab,
  onNavigateTab,
  onRequestAdminMode,
  onExitAdminMode,
  requestCountBadge = 0,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Desktop Top Bar: 3-zone contract */}
      <div className="hidden md:flex max-w-6xl mx-auto px-6 h-16 items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => {
            if (mode === 'admin') {
              onExitAdminMode();
            }
            onNavigateTab('home');
          }}
          className="font-display text-xl font-bold tracking-tight text-blue-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-700 rounded"
        >
          {APP_CONFIG.appName}
        </button>

        {mode === 'student' ? (
          <nav aria-label="Primary navigation" className="flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => onNavigateTab('home')}
              className={`py-2 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                activeTab === 'home'
                  ? 'border-blue-700 text-blue-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('search')}
              className={`py-2 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                activeTab === 'search'
                  ? 'border-blue-700 text-blue-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Explore
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('requests')}
              className={`py-2 whitespace-nowrap shrink-0 border-b-2 transition-colors inline-flex items-center gap-2 ${
                activeTab === 'requests'
                  ? 'border-blue-700 text-blue-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <span>My Requests</span>
              {requestCountBadge > 0 && (
                <span
                  data-testid="desktop-requests-badge"
                  aria-label={`${requestCountBadge} pending or updated requests`}
                  className="min-w-[20px] h-5 px-1.5 rounded-full bg-orange-600 text-white font-mono text-[11px] font-bold inline-flex items-center justify-center tabular-nums leading-none"
                >
                  {requestCountBadge > 99 ? '99+' : requestCountBadge}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('profile')}
              className={`py-2 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-blue-700 text-blue-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Profile
            </button>
          </nav>
        ) : (
          <div className="text-sm font-medium text-slate-600 whitespace-nowrap shrink-0">
            Founder Operations Console
          </div>
        )}

        <div className="flex items-center gap-4 shrink-0">
          <span className="inline-flex items-center gap-1 text-sm text-slate-600 whitespace-nowrap shrink-0">
            <MapPin className="w-4 h-4 text-orange-600" aria-hidden="true" />
            <span>{APP_CONFIG.city}</span>
          </span>
          {mode === 'student' ? (
            <button
              type="button"
              onClick={onRequestAdminMode}
              className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
              <span>Admin View</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onExitAdminMode}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
            >
              Student View
            </button>
          )}
        </div>
      </div>

      {/* Mobile Compact Header (52px height) */}
      <div className="flex md:hidden px-4 h-[52px] items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            if (mode === 'admin') {
              onExitAdminMode();
            }
            onNavigateTab('home');
          }}
          className="font-display text-lg font-bold tracking-tight text-blue-900 whitespace-nowrap shrink-0"
        >
          {APP_CONFIG.appName}
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 whitespace-nowrap">
            <MapPin className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
            <span>{APP_CONFIG.city}</span>
          </span>
          {mode === 'admin' && (
            <button
              type="button"
              onClick={onExitAdminMode}
              className="min-h-[36px] px-3 py-1 rounded-lg bg-blue-700 text-white text-xs font-semibold whitespace-nowrap"
            >
              Student View
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
