import { ClipboardList, Home, Search, User } from 'lucide-react';
import { StudentTab } from './Header';

interface BottomNavProps {
  activeTab: StudentTab;
  onNavigateTab: (tab: StudentTab) => void;
  activeRequestCount: number;
}

export function BottomNav({
  activeTab,
  onNavigateTab,
  activeRequestCount,
}: BottomNavProps) {
  const items: { id: StudentTab; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'requests', label: 'My Requests', icon: ClipboardList },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 px-2"
    >
      <div className="grid grid-cols-4 h-full items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigateTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`min-h-[44px] flex flex-col items-center justify-center rounded-xl transition-colors relative ${
                isActive ? 'text-blue-800' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`}
                  aria-hidden="true"
                />
                {item.id === 'requests' && activeRequestCount > 0 && (
                  <span
                    data-testid="mobile-requests-badge"
                    aria-label={`${activeRequestCount} pending or updated requests`}
                    className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-600 text-white font-mono text-[10px] font-bold flex items-center justify-center tabular-nums leading-none shadow-sm"
                  >
                    {activeRequestCount > 99 ? '99+' : activeRequestCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 tracking-tight whitespace-nowrap ${
                  isActive ? 'font-semibold' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
