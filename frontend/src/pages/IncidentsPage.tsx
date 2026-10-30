import React, { useState } from 'react';
import { SeverityBadge, StatusBadge, RiskScore, MitreBadge } from '../components/Notifications';

interface Props { incidents: any[]; addNotification: any; }

const DEMO_INCIDENTS = [
  {
    id: 'INC-2026-1042', title: 'SQL Injection → DB Dump', severity: 'CRITICAL', risk_score: 94,
    status: 'OPEN', attacker_ip: '185.220.101.45', created_at: new Date(Date.now() - 3600000).toISOString(),
    threat_actor: { name: 'APT29 (Cozy Bear)', origin: 'Russia', sophistication: 'Nation-State' },
    target_asset: { name: 'Web Server', ip: '10.0.1.10', criticality: 'HIGH' },
    techniques: [
      { id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'Initial Access', severity: 'HIGH' },
      { id: 'T1059.003', name: 'Windows Command Shell', tactic: 'Execution', severity: 'MEDIUM' },
      { id: 'T1003.001', name: 'LSASS Memory', tactic: 'Credential Access', severity: 'CRITICAL' },
      { id: 'T1041', name: 'Exfiltration Over C2 Channel', tactic: 'Exfiltration', severity: 'CRITICAL' },
    ],
    timeline: [
      { timestamp: new Date(Date.now() - 3600000).toISOString(), event: 'Port Scan Detected', technique_id: 'T1595', severity: 'LOW' },
      { timestamp: new Date(Date.now() - 3540000).toISOString(), event: 'SQL Injection Attempt', technique_id: 'T1190', severity: 'HIGH' },
      { timestamp: new Date(Date.now() - 3480000).toISOString(), event: 'Web Shell Installed', technique_id: 'T1505.003', severity: 'CRITICAL' },
      { timestamp: new Date(Date.now() - 3420000).toISOString(), event: 'Privilege Escalation', technique_id: 'T1548.002', severity: 'HIGH' },
      { timestamp: new Date(Date.now() - 3360000).toISOString(), event: 'LSASS Credential Dump', technique_id: 'T1003.001', severity: 'CRITICAL' },
      { timestamp: new Date(Date.now() - 3300000).toISOString(), event: 'Data Collection', technique_id: 'T1560.001', severity: 'MEDIUM' },
      { timestamp: new Date(Date.now() - 3240000).toISOString(), event: 'Data Exfiltration', technique_id: 'T1041', severity: 'CRITICAL' },
    ],
    iocs: [
      { type: 'IP', value: '185.220.101.45', threat_score: 98, tags: ['malicious', 'attacker'] },
      { type: 'hash', value: 'a1b2c3d4e5f6789012345678901234567890abcdef', threat_score: 95, tags: ['malware'] },
      { type: 'domain', value: 'c2-server.malicious-actor.net', threat_score: 92, tags: ['c2'] },
    ],
  },
  {
    id: 'INC-2026-1041', title: 'Phishing → Ransomware', severity: 'CRITICAL', risk_score: 91,
    status: 'INVESTIGATING', attacker_ip: '198.20.69.74', created_at: new Date(Date.now() - 7200000).toISOString(),
    threat_actor: { name: 'LockBit', origin: 'Unknown', sophistication: 'Criminal' },
    target_asset: { name: 'Workstation-HR', ip: '10.0.4.10', criticality: 'MEDIUM' },
    techniques: [
      { id: 'T1566', name: 'Phishing', tactic: 'Initial Access', severity: 'MEDIUM' },
      { id: 'T1059.001', name: 'PowerShell', tactic: 'Execution', severity: 'HIGH' },
      { id: 'T1547.001', name: 'Registry Run Keys', tactic: 'Persistence', severity: 'MEDIUM' },
      { id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact', severity: 'CRITICAL' },
    ],
    timeline: [
      { timestamp: new Date(Date.now() - 7200000).toISOString(), event: 'Phishing Email Received', technique_id: 'T1566', severity: 'MEDIUM' },
      { timestamp: new Date(Date.now() - 7140000).toISOString(), event: 'Malicious Macro Executed', technique_id: 'T1059.001', severity: 'HIGH' },
      { timestamp: new Date(Date.now() - 7080000).toISOString(), event: 'Registry Persistence Set', technique_id: 'T1547.001', severity: 'MEDIUM' },
      { timestamp: new Date(Date.now() - 7020000).toISOString(), event: 'Ransomware Encryption Started', technique_id: 'T1486', severity: 'CRITICAL' },
    ],
    iocs: [
      { type: 'IP', value: '198.20.69.74', threat_score: 91, tags: ['malicious'] },
      { type: 'email', value: 'invoice@suspicious-domain.ru', threat_score: 88, tags: ['phishing'] },
    ],
  },
];

export default function IncidentsPage({ incidents, addNotification }: Props) {
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [filter, setFilter] = useState('ALL');
  
  const allIncidents = incidents.length > 0 ? incidents : DEMO_INCIDENTS;
  const filtered = filter === 'ALL' ? allIncidents : allIncidents.filter(i => i.severity === filter);

  const inc = selectedIncident || DEMO_INCIDENTS[0];

  return (
    <div>
      <div className="section-header mb-4">
        <div>
          <h1 className="section-title">🚨 Incident Management</h1>
          <div className="section-subtitle">{allIncidents.length} incidents detected</div>
        </div>
        <div className="flex gap-2">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-main">
        {/* Incidents List */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Incident Queue</span>
            <span className="text-xs text-muted">{filtered.length} incidents</span>
          </div>
          <div className="scrollable">
            {filtered.map((inc: any) => (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                style={{
                  padding: 12, borderRadius: 8, marginBottom: 6, cursor: 'pointer',
                  background: selectedIncident?.id === inc.id ? 'rgba(0,212,255,0.05)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selectedIncident?.id === inc.id ? 'rgba(0,212,255,0.3)' : 'var(--border)'}`,
                  transition: 'all 0.2s ease'
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-mono text-xs text-cyan">{inc.id}</span>
                  <SeverityBadge severity={inc.severity} />
                </div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{inc.title}</div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted">{inc.attacker_ip}</span>
                  <div className="flex gap-2 items-center">
                    <RiskScore score={inc.risk_score || 50} />
                    <StatusBadge status={inc.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incident Detail */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📋 Incident Detail</span>
            <StatusBadge status={inc.status} />
          </div>
          
          <div className="scrollable">
            {/* Header */}
            <div style={{ marginBottom: 16, padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div className="text-mono text-xs text-cyan mb-1">{inc.id}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{inc.title}</div>
              <div className="flex gap-2 flex-wrap">
                <SeverityBadge severity={inc.severity} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Risk: {inc.risk_score}/100</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inc.threat_actor?.name}</span>
              </div>
            </div>

            {/* MITRE Techniques */}
            <div style={{ marginBottom: 12 }}>
              <div className="text-xs text-muted mb-2" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>MITRE ATT&CK Techniques</div>
              <div className="flex gap-1 flex-wrap">
                {inc.techniques?.map((t: any) => (
                  <div key={t.id} style={{ marginBottom: 4 }}>
                    <MitreBadge id={t.id} name={t.name} />
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 4 }}>{t.tactic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attack Timeline */}
            <div style={{ marginBottom: 12 }}>
              <div className="text-xs text-muted mb-2" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Attack Timeline</div>
              <div className="timeline">
                {inc.timeline?.map((event: any, i: number) => (
                  <div key={i} className={`timeline-item ${event.severity}`}>
                    <div className="timeline-time">{new Date(event.timestamp).toLocaleTimeString()}</div>
                    <div className="timeline-event">{event.event}</div>
                    <div className="timeline-technique">{event.technique_id}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* IOCs */}
            <div>
              <div className="text-xs text-muted mb-2" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Indicators of Compromise</div>
              {inc.iocs?.map((ioc: any, i: number) => (
                <div key={i} className="ioc-item">
                  <span className="ioc-type-badge">{ioc.type}</span>
                  <span className="ioc-value">{ioc.value}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                    background: 'rgba(255,59,48,0.1)', color: 'var(--critical)'
                  }}>{ioc.threat_score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
