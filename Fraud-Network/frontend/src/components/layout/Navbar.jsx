import React from 'react';
import { Search, Filter, Calendar, Download, Bell } from 'lucide-react';

export default function Navbar({ collapsed }) {
  return (
    <header className={`fixed top-0 right-0 h-16 bg-[#12151e]/90 backdrop-blur-md z-40 border-b border-[#222738] flex items-center justify-between px-6 transition-all duration-300 ${
      collapsed ? 'left-16' : 'left-72'
    }`}>
      {/* Search Input */}
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e9bae]" size={16} />
          <input
            type="text"
            placeholder="Search network, nodes, or transactions..."
            className="w-full bg-[#1a1e2e] text-[#f8fafc] text-sm py-2 pl-10 pr-4 rounded-full border border-[#2e354b] focus:border-[#00f5d4] focus:outline-none transition-all placeholder:text-[#8e9bae]"
          />
        </div>
      </div>


      {/* Action Buttons */}
      <div className="flex items-center gap-3 ml-6">
        <button className="btn-outline">
          <Filter size={14} />
          <span className="font-semibold uppercase tracking-wider text-xs">Filter</span>
        </button>

        <div className="btn-outline cursor-default">
          <Calendar size={14} className="text-[#c4c7c8]" />
          <span className="font-semibold uppercase tracking-wider text-xs text-[#c4c7c8]">Last 24 Hours</span>
        </div>

        <button className="btn-primary py-1.5 px-3 text-xs">
          <Download size={14} />
          <span className="font-semibold uppercase tracking-wider text-xs">Export</span>
        </button>

        <div className="h-6 w-px bg-[#444748] mx-1" />

        <button className="p-2 text-[#c4c7c8] hover:text-[#ffffff] transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#ffb4ab] rounded-full" />
        </button>

        <div className="w-8 h-8 rounded-full border border-[#444748] bg-[#2a2a2a] flex items-center justify-center font-bold text-xs text-[#ffffff] cursor-pointer hover:ring-2 hover:ring-[#4cd7f6]/50 transition-all ml-1">
          JD
        </div>
      </div>
    </header>
  );
}
