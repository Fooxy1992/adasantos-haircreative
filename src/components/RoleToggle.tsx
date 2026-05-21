import React from 'react';
import { useApp } from '../AppContext';

export default function RoleToggle() {
  const { userRole, setUserRole } = useApp();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg border border-[#efe0d4] flex items-center gap-3 hover:scale-[1.01] transition-all duration-300">
      <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-primary shrink-0 hidden sm:inline">Modo:</span>
      <div className="flex bg-[#faebdf] rounded-full p-1 border border-[#efe0d4]">
        <button
          onClick={() => setUserRole('customer')}
          className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
            userRole === 'customer'
              ? 'bg-brand-primary text-white shadow-xs'
              : 'text-brand-on-surface-variant hover:text-brand-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">face</span>
          Cliente
        </button>
        <button
          onClick={() => setUserRole('staff')}
          className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
            userRole === 'staff'
              ? 'bg-brand-primary text-white shadow-xs'
              : 'text-brand-on-surface-variant hover:text-brand-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">badge</span>
          Staff
        </button>
        <button
          onClick={() => setUserRole('admin')}
          className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
            userRole === 'admin'
              ? 'bg-brand-primary text-white shadow-xs'
              : 'text-brand-on-surface-variant hover:text-brand-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">settings</span>
          Admin
        </button>
      </div>
    </div>
  );
}
