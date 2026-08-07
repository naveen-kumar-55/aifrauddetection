import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Network, Users, Brain, AlertTriangle, RotateCcw, Activity, FileText, Settings, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/network', label: 'Transaction Network', icon: Network },
  { path: '/communities', label: 'Community Detection', icon: Users },
  { path: '/investigation', label: 'Risk Intelligence', icon: Brain },
  { path: '/high-risk', label: 'High-Risk Accounts', icon: AlertTriangle },
  { path: '/cycles', label: 'Cycle Detection', icon: RotateCcw },
  { path: '/intervention', label: 'Intervention Simulator', icon: Activity },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside 
      className={`fixed top-0 left-0 bottom-0 z-50 bg-[#1c1b1b] border-r border-[#444748]/30 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 mb-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#ffffff] text-[#141313] flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
          <Zap size={18} className="fill-[#141313] stroke-none" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-lg tracking-tight text-[#ffffff] font-heading">
            FraudLens AI
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-[#444748]/30 shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center py-2 text-[#c4c7c8] hover:text-[#ffffff] hover:bg-[#2a2a2a] rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
