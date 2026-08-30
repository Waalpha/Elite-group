import React from 'react';
import {
  ShieldCheck,
  Database,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useSchoolSettings } from '../../../contexts/SettingsContext';

export const SystemStatusBar: React.FC = () => {
  const { settings } = useSchoolSettings();

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 px-5 py-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 font-bold text-slate-900">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{settings.schoolName || 'Uwezo Elite School'}</span>
        </div>

        <span className="text-slate-300 hidden sm:inline">•</span>

        <div className="flex items-center gap-1 text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{settings.address || 'Nairobi Campus, Kenya'}</span>
        </div>

        <span className="text-slate-300 hidden sm:inline">•</span>

        <div className="flex items-center gap-1 text-emerald-700 font-semibold">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>Authoritative Cloud Firestore Sync</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>RBAC 256-bit Secured</span>
        </span>
        <span>•</span>
        <span>Version 3.2 Enterprise</span>
      </div>
    </div>
  );
};
