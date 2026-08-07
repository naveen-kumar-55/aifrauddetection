import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge';

export default function CommunityDrawer({ community, onClose }) {
  if (!community) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 bottom-0 w-[420px] z-50 bg-[#1c1b1b] border-l border-[#444748]/30 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#444748]/30 flex items-center justify-between shrink-0 bg-[#201f1f]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg border bg-[#4cd7f6]/10 border-[#4cd7f6]/30 text-[#4cd7f6]">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#c4c7c8] uppercase tracking-wider">Community Cluster</p>
              <h3 className="text-base font-bold text-[#ffffff]">Cluster #{community.id || community.community_id}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-[#2a2a2a] text-[#c4c7c8] hover:text-[#ffffff] hover:bg-[#353434] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#201f1f] p-3 rounded-xl border border-[#444748]/30">
              <span className="text-[10px] text-[#c4c7c8] uppercase font-semibold">Total Accounts</span>
              <p className="text-lg font-bold text-[#ffffff]">{community.count || community.accounts?.length || 0}</p>
            </div>
            <div className="bg-[#201f1f] p-3 rounded-xl border border-[#444748]/30">
              <span className="text-[10px] text-[#c4c7c8] uppercase font-semibold">Risk Status</span>
              <div className="mt-1">
                <Badge variant={community.isFraud ? 'danger' : 'success'}>
                  {community.isFraud ? 'Suspicious Ring' : 'Normal Cluster'}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#c4c7c8] uppercase tracking-wider mb-3">Member Accounts</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {(community.accounts || []).map((acc, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-[#201f1f] border border-[#444748]/20 flex justify-between items-center text-xs">
                  <span className="font-mono text-[#ffffff]">{acc.id || acc}</span>
                  <span className="text-[#c4c7c8]">{acc.accountType || 'Account'}</span>
                </div>
              ))}
              {(!community.accounts || community.accounts.length === 0) && (
                <p className="text-xs text-[#c4c7c8] italic">No detailed member records loaded.</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
