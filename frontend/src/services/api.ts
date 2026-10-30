// SENTINEL-X API Service Layer
import axios from 'axios';

const API_BASE = '/api';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Dashboard APIs
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getIncidents = (limit = 50) => api.get(`/dashboard/incidents?limit=${limit}`);
export const getIncident = (id: string) => api.get(`/dashboard/incidents/${id}`);
export const updateIncidentStatus = (id: string, status: string) => 
  api.patch(`/dashboard/incidents/${id}/status?status=${status}`);
export const getTimeline = () => api.get('/dashboard/timeline');
export const getEvidence = () => api.get('/dashboard/evidence');
export const getIOCs = () => api.get('/dashboard/iocs');
export const getAttackPaths = () => api.get('/dashboard/attack-paths');

// AI Assistant
export const aiChat = (question: string, incidentId?: string) =>
  api.post(`/ai/chat?question=${encodeURIComponent(question)}${incidentId ? `&incident_id=${incidentId}` : ''}`);
export const investigateIncident = (incidentId: string) =>
  api.post(`/ai/investigate?incident_id=${incidentId}`);

// Threat Intel
export const getIOCList = () => api.get('/threat-intel/iocs');
export const enrichIP = (ip: string) => api.post(`/threat-intel/enrich-ip?ip=${ip}`);
export const getThreatFeeds = () => api.get('/threat-intel/feeds');

// Risk Engine
export const getRiskScores = () => api.get('/risk/scores');
export const getAssetRisk = () => api.get('/risk/asset-risk');

// Forensics
export const getForensicEvidence = () => api.get('/forensics/evidence');
export const getForensicTimeline = (incidentId: string) => api.get(`/forensics/timeline/${incidentId}`);

// Cyber Range
export const getCyberRangeStatus = () => api.get('/cyber-range/status');
export const triggerAttack = (scenario: string) => api.post(`/cyber-range/trigger/${encodeURIComponent(scenario)}`);

// Generate new incident
export const generateIncident = () => api.post('/incidents/generate');

// Health check
export const getHealth = () => api.get('/health');
