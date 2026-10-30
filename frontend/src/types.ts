// SENTINEL-X shared types
export type Page = 'dashboard' | 'incidents' | 'forensics' | 'threat-intel' | 'attack-paths' | 'mitre' | 'cyber-range' | 'ai-assistant';

export interface Notification {
  id: string;
  type: 'critical' | 'info' | 'warning';
  message: string;
  timestamp: string;
}
