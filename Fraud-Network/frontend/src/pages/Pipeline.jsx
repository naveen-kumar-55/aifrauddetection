import React from 'react';
import { motion } from 'framer-motion';
import { 
  Database, Filter, BarChart, Network, Cpu, Brain, Search, Target, Activity, LayoutDashboard, ArrowDown 
} from 'lucide-react';

export default function Pipeline() {
  const steps = [
    { title: '1. Dataset Ingestion', icon: Database, color: 'border-l-[#2563eb]', desc: 'Ingestion of 1.25M financial transactions, sender/receiver accounts, and gateway telemetry.' },
    { title: '2. Data Cleaning & Validation', icon: Filter, color: 'border-l-[#00f5d4]', desc: 'Automated deduplication, missing value imputation, and timestamp sequence normalization.' },
    { title: '3. Exploratory Data Analysis (EDA)', icon: BarChart, color: 'border-l-[#f59e0b]', desc: 'Statistical distribution profiling, velocity anomaly checks, and outlier detection.' },
    { title: '4. Graph Network Construction', icon: Network, color: 'border-l-[#ef4444]', desc: 'Cytoscape & NetworkX graph layout mapping accounts as nodes and transfers as weighted edges.' },
    { title: '5. Feature Engineering (FII / BDS / NES / IPS)', icon: Cpu, color: 'border-l-[#8b5cf6]', desc: 'Graph centrality indices, Louvain community detection, and temporal drift scoring.' },
    { title: '6. Machine Learning Ensemble', icon: Brain, color: 'border-l-[#2563eb]', desc: 'Supervised XGBoost & LightGBM training with 98.2% accuracy and 0.994 AUC-ROC.' },
    { title: '7. AI Investigation Engine', icon: Search, color: 'border-l-[#00f5d4]', desc: 'LLM & heuristic reasoning layer generating natural language diagnostic fraud reports.' },
    { title: '8. Next Target Prediction', icon: Target, color: 'border-l-[#f59e0b]', desc: 'Preventive graph contagion algorithm forecasting imminent compromised accounts.' },
    { title: '9. Countermeasure Intervention Simulator', icon: Activity, color: 'border-l-[#ef4444]', desc: 'Interactive node containment simulation showing up to 84% contagion reduction.' },
    { title: '10. Executive Intelligence Dashboard', icon: LayoutDashboard, color: 'border-l-[#10b981]', desc: 'Real-time executive briefing surface for compliance officers and C-suite risk managers.' },
  ];

  return (
    <div className="flex flex-col w-full px-6 pb-12 gap-8 max-w-[1400px] mx-auto bg-[#020617] text-[#f8fafc]">
      
      {/* HEADER */}
      <div className="border-b border-[#1e293b] pb-4 pt-2">
        <div className="flex items-center gap-2 text-[#2563eb] text-xs font-bold uppercase tracking-widest mb-1">
          <Brain size={16} className="text-[#00f5d4]" />
          <span>End-to-End System Architecture</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-[#f8fafc]">
          DATASPHERE Pipeline <span className="text-[#94a3b8] font-light">| End-to-End Workflow</span>
        </h1>
        <p className="text-xs text-[#94a3b8] mt-1">
          Complete data processing, graph neural modeling, AI investigation, and intervention pipeline.
        </p>
      </div>

      {/* ANIMATED PIPELINE STEPS */}
      <div className="space-y-4 relative py-4">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <motion.div
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={`bg-[#0f172a] rounded-2xl p-5 border border-[#1e293b] shadow-xl border-l-4 ${step.color} flex items-start gap-4 hover:border-[#2563eb]/50 transition-all`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#1e293b] flex items-center justify-center shrink-0">
                <step.icon size={20} className="text-[#00f5d4]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#f8fafc]">{step.title}</h3>
                <p className="text-xs text-[#94a3b8] leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>

            {i < steps.length - 1 && (
              <div className="flex justify-center my-1 text-[#2563eb]">
                <ArrowDown size={18} className="animate-bounce" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

    </div>
  );
}
