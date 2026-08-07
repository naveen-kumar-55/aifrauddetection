import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Cpu, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

export default function ModelPerformance() {
  const models = [
    { name: 'XGBoost Classifier (Selected)', accuracy: '98.2%', precision: '97.8%', recall: '98.5%', f1: '98.1%', status: 'Active Model', color: 'border-t-[#00f5d4]' },
    { name: 'LightGBM Model', accuracy: '97.4%', precision: '96.5%', recall: '97.2%', f1: '96.8%', status: 'Challenger', color: 'border-t-[#2563eb]' },
    { name: 'Random Forest Baseline', accuracy: '95.1%', precision: '94.2%', recall: '95.0%', f1: '94.6%', status: 'Baseline', color: 'border-t-[#f59e0b]' },
  ];

  // Mock ROC Curve Data
  const rocData = [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.02, tpr: 0.85 },
    { fpr: 0.05, tpr: 0.94 },
    { fpr: 0.10, tpr: 0.98 },
    { fpr: 0.20, tpr: 0.99 },
    { fpr: 1.0, tpr: 1.0 },
  ];

  // Precision, Recall, F1 Bar Data
  const metricsData = [
    { model: 'XGBoost', precision: 97.8, recall: 98.5, f1: 98.1 },
    { model: 'LightGBM', precision: 96.5, recall: 97.2, f1: 96.8 },
    { model: 'Random Forest', precision: 94.2, recall: 95.0, f1: 94.6 },
  ];

  return (
    <div className="flex flex-col w-full px-6 pb-12 gap-8 max-w-[1700px] mx-auto bg-[#020617] text-[#f8fafc]">
      
      {/* HEADER */}
      <div className="border-b border-[#1e293b] pb-4 pt-2">
        <div className="flex items-center gap-2 text-[#2563eb] text-xs font-bold uppercase tracking-widest mb-1">
          <BarChart2 size={16} className="text-[#00f5d4]" />
          <span>Ensemble Machine Learning & Evaluation Suite</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-[#f8fafc]">
          Model Performance <span className="text-[#94a3b8] font-light">| Benchmark & Metrics</span>
        </h1>
        <p className="text-xs text-[#94a3b8] mt-1">
          Comparative performance evaluation across Random Forest, XGBoost, and LightGBM models.
        </p>
      </div>

      {/* 3 MODEL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b] shadow-xl flex flex-col justify-between border-t-4 ${m.color}`}
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#1e293b] text-[#00f5d4]">
                  {m.status}
                </span>
                <ShieldCheck size={18} className="text-[#00f5d4]" />
              </div>
              <h3 className="text-base font-bold text-[#f8fafc]">{m.name}</h3>
              <p className="text-3xl font-black text-[#f8fafc] mt-2 mb-4">{m.accuracy}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1e293b] text-center text-xs">
              <div>
                <span className="text-[10px] text-[#94a3b8] block">Precision</span>
                <span className="font-bold text-[#f8fafc]">{m.precision}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#94a3b8] block">Recall</span>
                <span className="font-bold text-[#f8fafc]">{m.recall}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#94a3b8] block">F1 Score</span>
                <span className="font-bold text-[#00f5d4]">{m.f1}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ROC Curve Chart */}
        <div className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#f8fafc]">Receiver Operating Characteristic (ROC Curve)</h3>
            <p className="text-xs text-[#94a3b8]">AUC-ROC score: 0.994 (XGBoost GNN ensemble)</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="fpr" stroke="#94a3b8" fontSize={11} name="False Positive Rate" />
                <YAxis stroke="#94a3b8" fontSize={11} name="True Positive Rate" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                <Line type="monotone" dataKey="tpr" stroke="#00f5d4" strokeWidth={3} dot={{ r: 4 }} name="True Positive Rate" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Precision / Recall / F1 Bar Chart */}
        <div className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#f8fafc]">Precision, Recall & F1 Comparison</h3>
            <p className="text-xs text-[#94a3b8]">Performance metrics breakdown across all 3 classifiers</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="model" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[80, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                <Bar dataKey="precision" fill="#2563eb" name="Precision %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recall" fill="#f59e0b" name="Recall %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="f1" fill="#00f5d4" name="F1 Score %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* CONFUSION MATRIX CARD */}
      <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] p-6 shadow-xl">
        <h3 className="text-base font-bold text-[#f8fafc] mb-4">Confusio Matrix (XGBoost Production Model)</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-[#10b981]/10 border border-[#10b981]/30 p-4 rounded-xl">
            <span className="text-[10px] text-[#94a3b8] uppercase font-bold block">True Negative (Safe)</span>
            <span className="text-2xl font-black text-[#10b981]">1,247,200</span>
          </div>

          <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 p-4 rounded-xl">
            <span className="text-[10px] text-[#94a3b8] uppercase font-bold block">False Positive</span>
            <span className="text-2xl font-black text-[#f59e0b]">224</span>
          </div>

          <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 p-4 rounded-xl">
            <span className="text-[10px] text-[#94a3b8] uppercase font-bold block">False Negative</span>
            <span className="text-2xl font-black text-[#ef4444]">48</span>
          </div>

          <div className="bg-[#00f5d4]/10 border border-[#00f5d4]/30 p-4 rounded-xl">
            <span className="text-[10px] text-[#94a3b8] uppercase font-bold block">True Positive (Fraud)</span>
            <span className="text-2xl font-black text-[#00f5d4]">3,170</span>
          </div>
        </div>
      </div>

    </div>
  );
}
