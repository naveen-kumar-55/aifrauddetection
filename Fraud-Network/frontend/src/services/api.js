import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

export const fetchSummary = () => api.get('/summary').then(r => r.data);

export const fetchAnalytics = () => api.get('/analytics').then(r => r.data);

export const fetchGraphData = (params = {}) => api.get('/graph-data', { params }).then(r => r.data);

export const fetchGraphFeatures = () => api.get('/graph-features').then(r => r.data);

export const fetchCommunities = () => api.get('/communities').then(r => r.data);

export const fetchCycles = () => api.get('/cycles').then(r => r.data);

export const fetchRiskScores = () => api.get('/risk-scores').then(r => r.data);

export const fetchAdvancedFeatures = () => api.get('/advanced-features').then(r => r.data);

export const fetchAiInvestigation = (accountId) => api.get(`/ai-investigation/${accountId}`).then(r => r.data);

export const fetchAccountTransactions = (accountId) => api.get(`/account-transactions/${accountId}`).then(r => r.data);

export const fetchSimulateIntervention = (accountId) => api.get(`/simulate-intervention/${accountId}`).then(r => r.data);

export const fetchHighRiskAccounts = () => api.get('/high-risk-accounts').then(r => r.data);

export const fetchFraudIntelligence = () => api.get('/fraud-intelligence').then(r => r.data);

export const fetchFraudTrend = () => api.get('/fraud-trend').then(r => r.data);


export const fetchTransactionTypes = () => api.get('/transaction-types').then(r => r.data);

export const fetchChannels = () => api.get('/channels').then(r => r.data);

export const fetchCountries = () => api.get('/countries').then(r => r.data);

export default api;

