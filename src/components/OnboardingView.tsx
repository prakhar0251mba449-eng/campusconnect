import { FormEvent, useState } from 'react';
import { ArrowRight, MapPin, ShieldCheck, Sparkles, Users } from 'lucide-react';
import {
  ACCOMMODATION_TYPES,
  APP_CONFIG,
  DEHRADUN_AREAS,
  DEHRADUN_COLLEGES,
} from '../config';
import { AccommodationType, Student } from '../types';
import { validateStudentInput } from '../utils/campusLogic';

interface OnboardingViewProps {
  existingStudents: Student[];
  onCreateStudent: (student: Omit<Student, 'id' | 'createdAt'>) => void;
  onSelectExistingStudent: (studentId: string) => void;
  onOpenAdmin: () => void;
}

export function OnboardingView({
  existingStudents,
  onCreateStudent,
  onSelectExistingStudent,
  onOpenAdmin,
}: OnboardingViewProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState(DEHRADUN_COLLEGES[0]);
  const [area, setArea] = useState(DEHRADUN_AREAS[1]);
  const [accommodationType, setAccommodationType] = useState<AccommodationType>('Hostel');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationError = validateStudentInput({ name, phone, college, area });
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onCreateStudent({
      name: name.trim(),
      phone: phone.trim(),
      college: college.trim(),
      area: area.trim(),
      accommodationType,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 h-14 flex items-center justify-between max-w-6xl w-full mx-auto md:bg-transparent md:border-b-0 md:pt-4">
        <span className="font-display text-xl font-bold text-blue-900">
          {APP_CONFIG.appName}
        </span>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-orange-600" aria-hidden="true" />
            {APP_CONFIG.city}
          </span>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="text-xs font-semibold text-slate-600 hover:text-blue-800 py-2 px-3 rounded-lg hover:bg-white transition-colors"
          >
            Admin Login
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-6 space-y-5 lg:pt-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-800">
            <ShieldCheck className="w-4 h-4 text-orange-600" aria-hidden="true" />
            <span>Built for Hostel, PG & Rented Room Students in {APP_CONFIG.city}</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight text-balance leading-[1.12]">
            {APP_CONFIG.tagline}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
            Stop digging through messy WhatsApp groups. Compare verified tiffins,
            laundry, printing shops, stationery, and campus autos near your hostel
            and book in seconds.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-200 max-w-lg">
            <div>
              <p className="font-display text-2xl font-bold text-blue-900 tabular-nums">18+</p>
              <p className="text-xs text-slate-500 mt-0.5">Local Dehradun Vendors</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-blue-900 tabular-nums">6</p>
              <p className="text-xs text-slate-500 mt-0.5">Essential Categories</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-orange-600 tabular-nums">₹0</p>
              <p className="text-xs text-slate-500 mt-0.5">Booking Fee · Pay Direct</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Users className="w-4 h-4 text-blue-700" aria-hidden="true" />
                <span>Quick Pilot Access (Demo Student Profiles)</span>
              </div>
              <span className="text-xs text-slate-500">1-tap sign in</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {existingStudents.slice(0, 3).map((stu) => (
                <button
                  key={stu.id}
                  type="button"
                  onClick={() => onSelectExistingStudent(stu.id)}
                  className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-700 hover:bg-blue-50/60 text-left transition-colors"
                >
                  <span className="block text-sm font-semibold text-slate-900 truncate">{stu.name}</span>
                  <span className="block text-xs text-slate-500 truncate">
                    {stu.college}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm">
          <div className="mb-5">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Join the {APP_CONFIG.city} Student Pilot
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Takes 20 seconds. We use your area & hostel info to pre-fill pickup and delivery details.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="onb-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                id="onb-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Prakhar Raheja"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
              />
            </div>

            <div>
              <label htmlFor="onb-phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                WhatsApp / Phone Number
              </label>
              <input
                id="onb-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-mono focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="onb-college" className="block text-sm font-medium text-slate-700 mb-1.5">
                  College / University
                </label>
                <input
                  id="onb-college"
                  list="dehradun-colleges"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="Select or type college"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                />
                <datalist id="dehradun-colleges">
                  {DEHRADUN_COLLEGES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label htmlFor="onb-area" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Hostel / PG Area
                </label>
                <input
                  id="onb-area"
                  list="dehradun-areas"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Bidholi, Clement Town"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                />
                <datalist id="dehradun-areas">
                  {DEHRADUN_AREAS.map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-slate-700 mb-1.5">
                Accommodation Type
              </span>
              <div className="grid grid-cols-3 gap-2">
                {ACCOMMODATION_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAccommodationType(type)}
                    className={`min-h-[44px] rounded-xl border text-sm font-medium transition-colors ${
                      accommodationType === type
                        ? 'border-blue-700 bg-blue-50 text-blue-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>Start Exploring {APP_CONFIG.city} Services</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
              Direct cash / UPI payment to provider
            </span>
            <button
              type="button"
              onClick={() => onSelectExistingStudent(existingStudents[0]?.id ?? 'stu-1')}
              className="font-semibold text-blue-700 hover:underline py-1"
            >
              Continue as Demo Student
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
