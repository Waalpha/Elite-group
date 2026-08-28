import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'emerald' | 'blue' | 'indigo' | 'amber' | 'rose' | 'purple';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'emerald',
  onClick,
}) => {
  const colorMap = {
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
      trendBg: 'text-emerald-700 bg-emerald-50 border-emerald-100',
      accent: 'border-l-emerald-600',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
      trendBg: 'text-blue-700 bg-blue-50 border-blue-100',
      accent: 'border-l-blue-600',
    },
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
      trendBg: 'text-indigo-700 bg-indigo-50 border-indigo-100',
      accent: 'border-l-indigo-600',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
      trendBg: 'text-amber-700 bg-amber-50 border-amber-100',
      accent: 'border-l-amber-500',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white',
      trendBg: 'text-rose-700 bg-rose-50 border-rose-100',
      accent: 'border-l-rose-500',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
      trendBg: 'text-purple-700 bg-purple-50 border-purple-100',
      accent: 'border-l-purple-600',
    },
  }[color];

  return (
    <div
      id={id}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/70 shadow-xs hover:shadow-sm hover:border-slate-300/80 transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">{title}</p>
          <h4 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none font-sans">
            {value}
          </h4>
          {subtitle && (
            <p className="mt-1.5 text-xs text-slate-500 font-medium truncate">{subtitle}</p>
          )}
        </div>
        <div
          className={`p-2.5 rounded-xl shrink-0 transition-all duration-200 ${colorMap.iconBg}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-xs">
          <span
            className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md border text-[11px] ${
              trend.isPositive
                ? 'text-emerald-700 bg-emerald-50/80 border-emerald-200/60'
                : 'text-rose-700 bg-rose-50/80 border-rose-200/60'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3 text-emerald-600" />
            ) : (
              <TrendingDown className="w-3 h-3 text-rose-600" />
            )}
            {trend.value}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">vs last term</span>
        </div>
      )}
    </div>
  );
};

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'emerald' | 'blue' | 'amber' | 'rose' | 'purple' | 'slate' | 'indigo';
  size?: 'sm' | 'md';
}> = ({ children, variant = 'slate', size = 'md' }) => {
  const styles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/70',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/70',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/70',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/70',
    slate: 'bg-slate-100 text-slate-700 border-slate-200/70',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
  }[variant];

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md border ${styles} ${sizeStyles}`}
    >
      {children}
    </span>
  );
};

