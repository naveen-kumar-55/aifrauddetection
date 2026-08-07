import React from 'react';
import GlassCard from '../components/cards/GlassCard';
import { Settings as SettingsIcon, Sliders, Shield } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <GlassCard title="System Settings" subtitle="FraudLens AI Configuration">
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/4 border border-white/6">
            <div className="flex items-center gap-3">
              <Sliders size={20} className="text-white" />
              <div>
                <h4 className="text-sm font-semibold text-slate-200">GNN Model Sensitivity</h4>
                <p className="text-xs text-slate-500">Threshold for auto-flagging high-risk accounts</p>
              </div>
            </div>
            <select className="graph-filter-btn">
              <option>High Precision (0.75)</option>
              <option>Balanced (0.50)</option>
              <option>High Recall (0.25)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/4 border border-white/6">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-emerald-400" />
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Auto-Intervention Mode</h4>
                <p className="text-xs text-slate-500">Automatically trigger node freeze on critical IPS score</p>
              </div>
            </div>
            <input type="checkbox" className="toggle border-white/20" defaultChecked />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
