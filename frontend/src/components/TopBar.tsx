import React from 'react';
import type { Page } from '../types';

const pageTitles: Record<Page, string> = {
  'dashboard': 'SOC Dashboard',
  'incidents': 'Incident Management',
  'forensics': 'Digital Forensics & Evidence',
  'threat-intel': 'Threat Intelligence',
  'attack-paths': 'Attack Path Analysis',
  'mitre': 'MITRE ATT&CK Matrix',
  'cyber-range': 'Cyber Range Simulator',
  'ai-assistant': 'AI Investigation Assistant',
};

interface TopBarProps {
  page: Page;
  wsConnected: boolean;
}

export default function TopBar({ page, wsConnected }: TopBarProps) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="topbar">
      <div className="topbar-title">{pageTitles[page]}</div>
      <div className="topbar-actions">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {dateStr} • {timeStr}
        </div>
        {wsConnected ? (
          <div className="live-badge">
            <div className="live-dot" />
            LIVE
          </div>
        ) : (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }} />
            Connecting...
          </div>
        )}
        <div className="threat-level-badge critical">THREAT LEVEL: HIGH</div>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #00d4ff, #3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, cursor: 'pointer'
        }}>👤</div>
      </div>
    </div>
  );
}
