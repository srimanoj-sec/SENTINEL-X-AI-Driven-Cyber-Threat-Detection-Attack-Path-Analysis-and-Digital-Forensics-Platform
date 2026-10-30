import React from 'react';
import type { Notification } from '../types';

interface Props {
  notifications: Notification[];
}

export function NotificationContainer({ notifications }: Props) {
  return (
    <div className="notification-toast">
      {notifications.map(n => (
        <div key={n.id} className={`toast ${n.type}`}>
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 12 }}>
            {n.type === 'critical' ? '🚨 CRITICAL ALERT' : 'ℹ️ SENTINEL-X'}
          </div>
          <div style={{ fontSize: 12 }}>{n.message}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            {new Date(n.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}

// Reusable components
export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span className={`severity-badge ${severity}`}>
      {severity === 'CRITICAL' && '⬤ '}
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`status-badge ${status}`}>{status}</span>;
}

export function RiskScore({ score }: { score: number }) {
  const level = score >= 85 ? 'critical' : score >= 70 ? 'high' : score >= 50 ? 'medium' : 'low';
  const color = score >= 85 ? 'var(--critical)' : score >= 70 ? 'var(--high)' : score >= 50 ? 'var(--medium)' : 'var(--low)';
  
  return (
    <div className={`risk-score ${level}`}>
      <div className="risk-bar">
        <div className="risk-bar-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      {score}/100
    </div>
  );
}

export function MitreBadge({ id, name }: { id: string; name: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 4, fontSize: 10,
      background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      fontFamily: 'var(--font-mono)', fontWeight: 600
    }}>
      {id}
    </span>
  );
}
