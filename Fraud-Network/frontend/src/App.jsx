import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Network from './pages/Network';
import Investigation from './pages/Investigation';
import FeatureEngineering from './pages/FeatureEngineering';
import Prediction from './pages/Prediction';
import Intervention from './pages/Intervention';
import ModelPerformance from './pages/ModelPerformance';
import Pipeline from './pages/Pipeline';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="network" element={<Network />} />
          <Route path="transaction-network" element={<Network />} />
          <Route path="intelligence" element={<FeatureEngineering />} />
          <Route path="features" element={<FeatureEngineering />} />
          <Route path="investigation" element={<Investigation />} />
          <Route path="ai-investigation" element={<Investigation />} />
          <Route path="prediction" element={<Prediction />} />
          <Route path="models" element={<ModelPerformance />} />
          <Route path="intervention" element={<Intervention />} />
          <Route path="reports" element={<Reports />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
