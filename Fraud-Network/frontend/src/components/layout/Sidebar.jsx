import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Network, Brain, Cpu, Activity, FileText, Settings, ChevronLeft, ChevronRight, Zap, ShieldAlert, LogOut
} from 'lucide-react';

const navGroups = [
  {
    group: 'MONITOR',
    items: [
      { path: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
      { path: '/network', label: 'Fraud Network', icon: Network },
    ]
  },
  {
    group: 'INVESTIGATE',
    items: [
      { path: '/investigation', label: 'AI Investigation', icon: Brain },
      { path: '/intelligence', label: 'AI Intelligence', icon: Cpu },
    ]
  },
  {
    group: 'RESPOND',
    items: [
      { path: '/intervention', label: 'Intervention', icon: Activity },
    ]
  },
  {
    group: 'REPORTING',
    items: [
      { path: '/reports', label: 'Reports', icon: FileText },
    ]
  }
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside 
      className={`fixed top-0 left-0 bottom-0 z-50 bg-[#111827] border-r border-[#1e293b] flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-3 shrink-0 border-b border-[#1e293b]">
        <div className="w-8 h-8 rounded-lg bg-[#2563eb] text-[#ffffff] flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
          <Zap size={18} className="fill-[#ffffff] stroke-none" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-[#f8fafc] font-heading leading-tight">
              FraudLens AI
            </span>
            <span className="text-[10px] text-[#94a3b8] font-medium tracking-wide">
              Enterprise Fraud Intelligence
            </span>
          </div>
        )}
      </div>

      {/* Grouped Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navGroups.map((g, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <span className="px-3 text-[10px] font-bold tracking-wider text-[#64748b] uppercase block mb-1.5">
                {g.group}
              </span>
            )}
            {g.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => 
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-[#2563eb] text-[#ffffff] font-semibold shadow-sm' 
                      : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b]/50'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={16} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom Footer Options */}
      <div className="p-3 border-t border-[#1e293b] shrink-0 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isActive ? 'bg-[#2563eb] text-[#ffffff]' : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b]/50'
            } ${collapsed ? 'justify-center px-0' : ''}`
          }
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={16} className="shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center py-2 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b] rounded-lg transition-colors text-xs"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
