import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Network, Brain, Cpu, TrendingUp, Activity, FileText, Settings, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
  { path: '/network', label: 'Fraud Network Explorer', icon: Network },
  { path: '/intelligence', label: 'AI Intelligence', icon: Cpu },
  { path: '/investigation', label: 'Investigation Center', icon: Brain },
  { path: '/prediction', label: 'Predictions', icon: TrendingUp },
  { path: '/intervention', label: 'Intervention Simulator', icon: Activity },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside 
      className={`fixed top-0 left-0 bottom-0 z-50 bg-[#0f172a] border-r border-[#1e293b] flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 mb-2 shrink-0 border-b border-[#1e293b]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563eb] to-[#00f5d4] text-[#ffffff] flex items-center justify-center font-bold text-base shrink-0 shadow-lg shadow-[#2563eb]/20">
          <Zap size={20} className="fill-[#ffffff] stroke-none" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-wider text-[#f8fafc] font-heading leading-tight">
              DATASPHERE
            </span>
            <span className="text-[10px] text-[#00f5d4] font-semibold uppercase tracking-widest">
              AI Fraud Intelligence
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive 
                  ? 'bg-[#2563eb] text-[#ffffff] shadow-md shadow-[#2563eb]/25' 
                  : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b]/60'
              } ${collapsed ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-[#1e293b] shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center py-2 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b] rounded-xl transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
