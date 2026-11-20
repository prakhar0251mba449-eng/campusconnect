import { FormEvent, useState } from 'react';
import { Lock, X } from 'lucide-react';
import { APP_CONFIG } from '../config';

interface AdminPinModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminPinModal({ onClose, onSuccess }: AdminPinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pin.trim() === APP_CONFIG.adminPin) {
      setError(null);
      onSuccess();
    } else {
      setError('Incorrect PIN. Please check the founder pilot PIN (1234).');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-pin-title"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white w-full max-w-sm rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-700" aria-hidden="true" />
            <h2 id="admin-pin-title" className="font-display text-lg font-bold text-slate-900">
              Admin PIN Required
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close PIN modal"
            className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Enter the founder PIN to manage Dehradun providers, requests, and pilot metrics. (Pilot default PIN: <span className="font-mono font-semibold">1234</span>)
        </p>

        {error && (
          <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-pin-input" className="sr-only">
              Admin PIN
            </label>
            <input
              id="admin-pin-input"
              type="password"
              inputMode="numeric"
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter 4-digit PIN"
              className="w-full min-h-[48px] px-4 py-2 rounded-xl border border-slate-300 text-center font-mono text-lg tracking-widest focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
            />
          </div>

          <button
            type="submit"
            className="w-full min-h-[46px] rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-colors"
          >
            Unlock Admin Console
          </button>
        </form>
      </div>
    </div>
  );
}
