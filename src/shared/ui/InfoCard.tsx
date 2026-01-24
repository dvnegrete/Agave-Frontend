import React from 'react';

interface InfoItem {
  label: string;
  value: string | number | React.ReactNode;
  className?: string;
}

interface InfoCardProps {
  items: InfoItem[];
}

export function InfoCard({ items }: InfoCardProps) {
  return (
    <div className="bg-base rounded-lg p-4 mb-6 space-y-2 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between">
          <span className="text-foreground-secondary">{item.label}</span>
          <span className={`font-semibold text-foreground ${item.className || ''}`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
