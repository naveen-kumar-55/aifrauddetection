export function getRiskTier(score) {
  if (score >= 80) return { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', label: 'Critical', tier: 'fraud' };
  if (score >= 50) return { color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)', label: 'High', tier: 'high' };
  if (score >= 20) return { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', label: 'Medium', tier: 'medium' };
  return { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', label: 'Low', tier: 'low' };
}

export function getRiskColor(score) {
  return getRiskTier(score).color;
}

export function getRiskLabel(score) {
  return getRiskTier(score).label;
}

export const RISK_TIERS = [
  { key: 'low', label: 'Normal', color: '#3B82F6', min: 0, max: 20 },
  { key: 'medium', label: 'Medium', color: '#F59E0B', min: 20, max: 50 },
  { key: 'high', label: 'High', color: '#F97316', min: 50, max: 80 },
  { key: 'fraud', label: 'Critical', color: '#EF4444', min: 80, max: 100 },
];
