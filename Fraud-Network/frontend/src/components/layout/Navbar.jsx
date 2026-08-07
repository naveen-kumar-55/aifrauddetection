import React from 'react';
import { Search, Filter, Calendar, Download, Bell } from 'lucide-react';

export default function Navbar({ collapsed }) {
  return (
    <header className={`fixed top-0 right-0 h-16 bg-[#111827]/90 backdrop-blur-md z-40 border-b border-[#1e293b] flex items-center justify-between px-6 transition-all duration-300 ${
      collapsed ? 'left-16' : 'left-64'
    }`}>
      {/* Search Input */}
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
          <input
            type="text"
            placeholder="Search accounts, fraud rings, or transaction IDs..."
            className="w-full bg-[#1e293b] text-[#f8fafc] text-xs py-2 pl-10 pr-4 rounded-xl border border-[#1e293b] focus:border-[#2563eb] focus:outline-none transition-all placeholder:text-[#94a3b8]"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 ml-6">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e293b] text-[#94a3b8] text-xs border border-[#1e293b]">
          <Calendar size={14} />
          <span>Last 24 Hours</span>
        </div>

        <button className="px-3 py-1.5 rounded-lg bg-[#2563eb] text-[#ffffff] font-semibold text-xs hover:bg-[#1d4ed8] transition-colors flex items-center gap-1.5">
          <Download size={14} />
          <span>Export Report</span>
        </button>

        <div className="h-5 w-px bg-[#1e293b] mx-1" />

        <button className="p-2 text-[#94a3b8] hover:text-[#f8fafc] transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#ef4444] rounded-full" />
        </button>

        <div className="w-8 h-8 rounded-lg bg-[#1e293b] border border-[#334155] flex items-center justify-center font-bold text-xs text-[#f8fafc] cursor-pointer">
          FA
        </div>
      </div>
    </header>
  );
}
