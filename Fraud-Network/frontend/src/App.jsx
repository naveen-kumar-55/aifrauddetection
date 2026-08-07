import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Network from './pages/Network';
import Analytics from './pages/Analytics';
import Investigation from './pages/Investigation';
import Communities from './pages/Communities';
import CycleDetection from './pages/CycleDetection';
import RiskIntelligence from './pages/RiskIntelligence';
import HighRiskAccounts from './pages/HighRiskAccounts';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="network" element={<Network />} />
          <Route path="transaction-network" element={<Network />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="investigation" element={<Investigation />} />
          <Route path="risk-intelligence" element={<RiskIntelligence />} />
          <Route path="communities" element={<Communities />} />
          <Route path="community-detection" element={<Communities />} />
          <Route path="high-risk" element={<HighRiskAccounts />} />
          <Route path="high-risk-accounts" element={<HighRiskAccounts />} />
          <Route path="cycles" element={<CycleDetection />} />
          <Route path="cycle-detection" element={<CycleDetection />} />
          <Route path="intervention" element={<Investigation />} />
          <Route path="intervention-simulator" element={<Investigation />} />
          <Route path="reports" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

