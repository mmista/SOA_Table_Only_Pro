import React from 'react';

interface StatsBadgeProps {
  icon: React.ReactNode;
  count: number;
  label: string;
  colorClass: string;
}

export const StatsBadge: React.FC<StatsBadgeProps> = ({
  icon,
  count,
  label,
  colorClass
}) => {
  if (count === 0) return null;

  return (
    <div className={`flex items-center space-x-1 text-sm px-2 py-1 rounded-full ${colorClass}`}>
      {icon}
      <span>{count} {label}{count !== 1 ? 's' : ''}</span>
    </div>
  );
};