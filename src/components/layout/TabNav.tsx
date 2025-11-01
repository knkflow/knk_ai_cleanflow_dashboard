// src/components/layout/TabNav.tsx
import { NavLink } from 'react-router-dom';

interface Tab {
  to: string;
  label: string;
}

interface TabNavProps {
  tabs: Tab[];
}

export function TabNav({ tabs }: TabNavProps) {
  return (
    <nav className="bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                [
                  'px-4 py-3 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                ].join(' ')
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
