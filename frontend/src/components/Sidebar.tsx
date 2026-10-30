import React from 'react';
import type { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  incidents: any[];
}

const navItems = [
  {
    section: 'Operations',
    items: [
      { id: 'dashboard', label: 'SOC Dashboard', icon: '📊', badge: null },
      { id: 'incidents', label: 'Incidents', icon: '🚨', badgeKey: 'critical', color: 'red' },
    ]
  },
  {
    section: 'Detection & Analysis',
    items: [
      { id: 'threat-intel', label: 'Threat Intelligence', icon: '🌐', badge: null },
      { id: 'attack-paths', label: 'Attack Path Analysis', icon: '🗺️', badge: null },
      { id: 'mitre', label: 'MITRE ATT&CK', icon: '⚔️', badge: null },
    ]
  },
  {
    section: 'Investigation',
    items: [
      { id: 'forensics', label: 'Digital Forensics', icon: '🔍', badge: null },
      { id: 'ai-assistant', label: 'AI Assistant', icon: '🤖', badge: null },
    ]
  },
  {
    section: 'Simulation',
    items: [
      { id: 'cyber-range', label: 'Cyber Range', icon: '🎯', badge: 'LIVE', color: 'green' },
    ]
  }
];

export default function Sidebar({ currentPage, onNavigate, incidents }: SidebarProps) {
  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;
  const openCount = incidents.filter(i => i.status === 'OPEN').length;

  const getBadge = (item: any) => {
    if (item.id === 'incidents' && openCount > 0) {
      return <span className="nav-badge">{openCount}</span>;
    }
    if (item.badge === 'LIVE') {
      return <span className="nav-badge green">LIVE</span>;
    }
    return null;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🛡️</div>
        <div className="logo-title">SENTINEL-X</div>
        <div className="logo-subtitle">Cyber Defense Platform</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(section => (
          <div key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map(item => (
              <div
                key={item.id}
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id as Page)}
                id={`nav-${item.id}`}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span>{item.label}</span>
                {getBadge(item)}
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <div className="status-dot" />
          <span className="status-text">All Systems Operational</span>
        </div>
        {criticalCount > 0 && (
          <div style={{ fontSize: 11, color: 'var(--critical)', marginTop: 4 }}>
            ⚠️ {criticalCount} Critical Incident{criticalCount > 1 ? 's' : ''} Active
          </div>
        )}
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
          SENTINEL-X v1.0.0
        </div>
      </div>
    </div>
  );
}
