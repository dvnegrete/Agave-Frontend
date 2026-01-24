export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
  color?: 'blue' | 'green' | 'yellow' | 'orange' | 'red';
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabColorStyles: Record<string, string> = {
  blue: 'border-blue-600 text-blue-600',
  green: 'border-green-600 text-green-600',
  yellow: 'border-yellow-600 text-yellow-600',
  orange: 'border-orange-600 text-orange-600',
  red: 'border-red-600 text-red-600',
};

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex gap-2 mb-6 border-b overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 font-medium cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === tab.id
              ? `border-b-2 ${tabColorStyles[tab.color || 'blue']}`
              : ''
          }`}
        >
          {tab.icon && <span className="mr-1">{tab.icon}</span>}
          {tab.label}
          {tab.badge !== undefined && (
            <span className="ml-2 bg-gray-300 text-gray-800 text-xs rounded-full px-2 py-0.5">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
