import React from 'react';
import { cn } from '../../utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  padding?: boolean;
}

export function Card({ className, children, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-lg shadow-sm',
        padding && 'p-5',
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: string; up?: boolean };
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray';
  onClick?: () => void;
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
  gray: 'bg-gray-100 text-gray-600',
};

export function StatCard({ label, value, icon, trend, color = 'blue', onClick }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-lg p-5 shadow-sm',
        onClick && 'cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-150'
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-xs mt-1',
                trend.up === undefined
                  ? 'text-gray-500'
                  : trend.up
                  ? 'text-emerald-600'
                  : 'text-red-600'
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div className={cn('p-2.5 rounded-lg', colorMap[color])}>{icon}</div>
      </div>
    </div>
  );
}
