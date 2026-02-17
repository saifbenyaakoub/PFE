import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function StrengthPassword({ password, setPassword, error, onBlur }) {
  //console.log("🚀 ~ StrengthPassword ~ password:", password) //ctrl+  alt+l
  //console.log("🚀 ~ StrengthPassword ~ password:", password) 0
  const [showPassword, setShowPassword] = useState(false);

  const criteria = [
    { met: password.length >= 6 },
    { met: /[A-Z]/.test(password) },
    { met: /[0-9]/.test(password) },
    { met: /[^A-Za-z0-9]/.test(password) },
  ];
  const strengthScore = criteria.filter((c) => c.met).length;

  const getStatus = () => {
    // État vide
    if (password.length === 0)
      return { border: 'border-gray-200', bg: 'bg-gray-100', ring: 'focus:ring-zinc-100', text: 'text-gray-400', focusBorder: 'focus:border-zinc-900' };

    // Force 1 : Très faible (Rouge)
    if (strengthScore <= 1)
      return { border: 'border-red-500', bg: 'bg-red-500', ring: 'focus:ring-red-50', text: 'text-red-500', focusBorder: 'focus:border-red-500' };

    // Force 2 : Faible (Jaune/Orange)
    if (strengthScore === 2)
      return { border: 'border-yellow-500', bg: 'bg-yellow-500', ring: 'focus:ring-yellow-50', text: 'text-yellow-600', focusBorder: 'focus:border-yellow-500' };

    // Force 3 : Bon (Vert Émeraude Clair)
    if (strengthScore === 3)
      return { border: 'border-emerald-400', bg: 'bg-emerald-400', ring: 'focus:ring-emerald-50', text: 'text-emerald-500', focusBorder: 'focus:border-emerald-400' };

    // Force 4 : Fort (Vert Émeraude Prononcé)
    return { border: 'border-emerald-600', bg: 'bg-emerald-600', ring: 'focus:ring-emerald-100', text: 'text-emerald-700', focusBorder: 'focus:border-emerald-600' };
  };

  const status = getStatus();

  return (
    <div className="w-full mb-6">
      <label className="block text-sm font-semibold text-gray-800 mb-2">
        Password <span className="text-red-500 font-bold">*</span>
      </label>

      <div className="relative mb-3">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onBlur={onBlur}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          className={`
              w-full px-4 py-3 border rounded-lg outline-none
              transition-all duration-300 shadow-sm
              ${status.border}
              ${status.ring}
              ${status.focusBorder}
              ${password.length > 0 ? "ring-1" : ""}
              ${error
                  ? "border-red-500 focus:border-red-500 ring-red-200"
                  : "border-zinc-200 focus:border-zinc-900"
                }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      </div>

      <div className="flex gap-2 h-1.5 px-0.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full w-1/4 rounded-full transition-all duration-500 
              ${step <= strengthScore ? status.bg : 'bg-gray-100'}`}
          />
        ))}
      </div>

      {password.length > 0 && (
        <p className={`text-[11px] mt-2 font-bold uppercase tracking-wider ${status.text}`}>
          {strengthScore <= 1 ? 'Very weak' : strengthScore === 2 ? 'Weak' : strengthScore === 3 ? 'Good' : 'Strong'}
        </p>
      )}
    </div>
  );
}