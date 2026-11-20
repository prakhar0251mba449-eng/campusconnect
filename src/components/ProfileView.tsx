import { FormEvent, useState } from 'react';
import { CheckCircle2, RotateCcw, Shield, UserPlus, Users } from 'lucide-react';
import {
  ACCOMMODATION_TYPES,
  DEHRADUN_AREAS,
  DEHRADUN_COLLEGES,
} from '../config';
import { AccommodationType, Student } from '../types';
import { validateStudentInput } from '../utils/campusLogic';

interface ProfileViewProps {
  student: Student;
  allStudents: Student[];
  onUpdateStudent: (updated: Student) => void;
  onSwitchStudent: (studentId: string) => void;
  onSignOutToOnboarding: () => void;
  onOpenAdminPinModal: () => void;
  onResetSeedData: () => void;
}

export function ProfileView({
  student,
  allStudents,
  onUpdateStudent,
  onSwitchStudent,
  onSignOutToOnboarding,
  onOpenAdminPinModal,
  onResetSeedData,
}: ProfileViewProps) {
  const [name, setName] = useState(student.name);
  const [phone, setPhone] = useState(student.phone);
  const [college, setCollege] = useState(student.college);
  const [area, setArea] = useState(student.area);
  const [accommodationType, setAccommodationType] = useState<AccommodationType>(
    student.accommodationType
  );
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const err = validateStudentInput({ name, phone, college, area });
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onUpdateStudent({
      ...student,
      name: name.trim(),
      phone: phone.trim(),
      college: college.trim(),
      area: area.trim(),
      accommodationType,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Student Profile & Settings
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Keep your hostel/PG details updated so service requests pre-fill automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Your Details
          </h2>

          {error && (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {savedNotice && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>Profile updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="prof-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                id="prof-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label htmlFor="prof-phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                WhatsApp / Phone Number
              </label>
              <input
                id="prof-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="prof-college" className="block text-sm font-medium text-slate-700 mb-1.5">
                  College
                </label>
                <input
                  id="prof-college"
                  list="prof-colleges"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
                <datalist id="prof-colleges">
                  {DEHRADUN_COLLEGES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div>
                <label htmlFor="prof-area" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Area / Locality
                </label>
                <input
                  id="prof-area"
                  list="prof-areas"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
                <datalist id="prof-areas">
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
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[46px] px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-colors"
            >
              Save Profile Changes
            </button>
          </form>
        </section>

        <div className="lg:col-span-5 space-y-4">
          {/* Role Switch to Admin */}
          <section className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-700" aria-hidden="true" />
              <h2 className="font-display text-base font-bold text-slate-900">
                Founder / Admin Console
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Manage listed Dehradun providers, update request statuses, view pilot analytics, and export CSV reports. Protected by founder PIN.
            </p>
            <button
              type="button"
              onClick={onOpenAdminPinModal}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
            >
              Switch to Admin View
            </button>
          </section>

          {/* Switch Student Account */}
          <section className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-600" aria-hidden="true" />
                <h2 className="font-display text-base font-bold text-slate-900">
                  Switch Student Profile
                </h2>
              </div>
              <button
                type="button"
                onClick={onSignOutToOnboarding}
                className="text-xs font-semibold text-blue-700 hover:underline inline-flex items-center gap-1 py-1"
              >
                <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                New Sign-up
              </button>
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {allStudents.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onSwitchStudent(s.id);
                    setName(s.name);
                    setPhone(s.phone);
                    setCollege(s.college);
                    setArea(s.area);
                    setAccommodationType(s.accommodationType);
                  }}
                  className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl border text-left transition-colors flex items-center justify-between ${
                    s.id === student.id
                      ? 'border-blue-700 bg-blue-50 text-blue-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-slate-500">
                      {s.college} · {s.accommodationType}
                    </p>
                  </div>
                  {s.id === student.id && (
                    <span className="text-xs font-semibold text-blue-700">Active</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Reset Demo Data */}
          <section className="bg-white rounded-3xl border border-slate-200 p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Pilot Demo Data</span>
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="text-xs font-semibold text-slate-600 hover:text-red-700 inline-flex items-center gap-1 py-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  Reset seed data
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onResetSeedData();
                      setConfirmReset(false);
                    }}
                    className="text-xs font-semibold text-red-700 hover:underline px-2 py-1"
                  >
                    Confirm reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="text-xs text-slate-500 px-2 py-1"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
