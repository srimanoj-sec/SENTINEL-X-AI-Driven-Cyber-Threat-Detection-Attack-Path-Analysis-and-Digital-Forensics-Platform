import React, { useState } from 'react';

interface Props { incidents: any[]; addNotification: any; }

const MITRE_TACTICS = [
  {
    tactic: 'Reconnaissance',
    techniques: [
      { id: 'T1595', name: 'Active Scanning', detected: true, count: 3, severity: 'LOW' },
      { id: 'T1592', name: 'Gather Victim Info', detected: false, count: 0, severity: 'LOW' },
      { id: 'T1589', name: 'Gather Victim Identity', detected: false, count: 0, severity: 'LOW' },
    ]
  },
  {
    tactic: 'Initial Access',
    techniques: [
      { id: 'T1190', name: 'Exploit Public App', detected: true, count: 8, severity: 'HIGH' },
      { id: 'T1566', name: 'Phishing', detected: true, count: 3, severity: 'MEDIUM' },
      { id: 'T1078', name: 'Valid Accounts', detected: true, count: 2, severity: 'HIGH' },
      { id: 'T1133', name: 'External Remote Svcs', detected: false, count: 0, severity: 'HIGH' },
    ]
  },
  {
    tactic: 'Execution',
    techniques: [
      { id: 'T1059.001', name: 'PowerShell', detected: true, count: 6, severity: 'HIGH' },
      { id: 'T1059.003', name: 'Windows CMD', detected: true, count: 4, severity: 'MEDIUM' },
      { id: 'T1053.005', name: 'Scheduled Task', detected: false, count: 0, severity: 'MEDIUM' },
    ]
  },
  {
    tactic: 'Persistence',
    techniques: [
      { id: 'T1547.001', name: 'Registry Run Keys', detected: true, count: 2, severity: 'MEDIUM' },
      { id: 'T1505.003', name: 'Web Shell', detected: true, count: 4, severity: 'CRITICAL' },
      { id: 'T1053.005', name: 'Scheduled Task', detected: false, count: 0, severity: 'MEDIUM' },
    ]
  },
  {
    tactic: 'Privilege Escalation',
    techniques: [
      { id: 'T1548.002', name: 'Bypass UAC', detected: true, count: 3, severity: 'HIGH' },
      { id: 'T1055', name: 'Process Injection', detected: true, count: 2, severity: 'HIGH' },
      { id: 'T1134', name: 'Access Token Manip', detected: false, count: 0, severity: 'HIGH' },
    ]
  },
  {
    tactic: 'Credential Access',
    techniques: [
      { id: 'T1003.001', name: 'LSASS Memory', detected: true, count: 5, severity: 'CRITICAL' },
      { id: 'T1110', name: 'Brute Force', detected: true, count: 7, severity: 'HIGH' },
      { id: 'T1555', name: 'Credentials in Files', detected: false, count: 0, severity: 'HIGH' },
    ]
  },
  {
    tactic: 'Lateral Movement',
    techniques: [
      { id: 'T1021.001', name: 'RDP', detected: true, count: 4, severity: 'HIGH' },
      { id: 'T1021.002', name: 'SMB/Admin Shares', detected: true, count: 3, severity: 'HIGH' },
      { id: 'T1550', name: 'Pass the Hash', detected: false, count: 0, severity: 'HIGH' },
    ]
  },
  {
    tactic: 'Collection',
    techniques: [
      { id: 'T1560.001', name: 'Archive Data', detected: true, count: 2, severity: 'MEDIUM' },
      { id: 'T1083', name: 'File Discovery', detected: true, count: 5, severity: 'LOW' },
    ]
  },
  {
    tactic: 'Exfiltration',
    techniques: [
      { id: 'T1041', name: 'Exfil Over C2', detected: true, count: 3, severity: 'CRITICAL' },
      { id: 'T1048', name: 'Exfil Alt Protocol', detected: false, count: 0, severity: 'HIGH' },
    ]
  },
  {
    tactic: 'Impact',
    techniques: [
      { id: 'T1486', name: 'Ransomware', detected: true, count: 2, severity: 'CRITICAL' },
      { id: 'T1485', name: 'Data Destruction', detected: false, count: 0, severity: 'CRITICAL' },
    ]
  },
];

function getSeverityColor(severity: string, detected: boolean, count: number) {
  if (!detected) return { bg: 'rgba(255,255,255,0.02)', border: 'transparent', text: '#475569' };
  const colors: Record<string, any> = {
    CRITICAL: { bg: `rgba(255,59,48,${Math.min(0.3, 0.05 + count * 0.04)})`, border: 'rgba(255,59,48,0.4)', text: '#ff3b30' },
    HIGH: { bg: `rgba(255,149,0,${Math.min(0.3, 0.05 + count * 0.04)})`, border: 'rgba(255,149,0,0.4)', text: '#ff9500' },
    MEDIUM: { bg: `rgba(255,204,0,${Math.min(0.2, 0.05 + count * 0.03)})`, border: 'rgba(255,204,0,0.3)', text: '#ffcc00' },
    LOW: { bg: 'rgba(52,199,89,0.1)', border: 'rgba(52,199,89,0.3)', text: '#34c759' },
  };
  return colors[severity] || colors.MEDIUM;
}

export default function MitrePage({ incidents, addNotification }: Props) {
  const [selectedTechnique, setSelectedTechnique] = useState<any>(null);
  const detectedCount = MITRE_TACTICS.flatMap(t => t.techniques).filter(t => t.detected).length;
  const totalCount = MITRE_TACTICS.flatMap(t => t.techniques).length;

  return (
    <div>
      <div className="section-header mb-4">
        <div>
          <h1 className="section-title">⚔️ MITRE ATT&CK Matrix</h1>
          <div className="section-subtitle">Enterprise attack technique mapping and detection coverage</div>
        </div>
        <div className="flex gap-3 items-center">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--critical)' }}>{detectedCount}</div>
            <div className="text-xs text-muted">Techniques Detected</div>
          </div>
          <div style={{ width: 60, height: 60, position: 'relative' }}>
            <svg viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
              <circle cx="30" cy="30" r="25" fill="none" stroke="var(--critical)" strokeWidth="5"
                strokeDasharray={`${(detectedCount / totalCount) * 157} 157`}
                strokeLinecap="round" transform="rotate(-90 30 30)" />
              <text x="30" y="35" textAnchor="middle" fontSize="10" fill="var(--critical)" fontWeight="700">
                {Math.round(detectedCount / totalCount * 100)}%
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {[
          { label: 'CRITICAL (detected)', color: '#ff3b30' },
          { label: 'HIGH (detected)', color: '#ff9500' },
          { label: 'MEDIUM (detected)', color: '#ffcc00' },
          { label: 'LOW (detected)', color: '#34c759' },
          { label: 'Not detected', color: '#475569' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
            <span className="text-xs text-muted">{item.label}</span>
          </div>
        ))}
      </div>

      {/* MITRE Matrix */}
      <div className="card mb-4">
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${MITRE_TACTICS.length}, 1fr)`, gap: 4, minWidth: 900 }}>
            {MITRE_TACTICS.map(tactic => (
              <div key={tactic.tactic} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{
                  padding: '8px 6px', background: 'rgba(0,212,255,0.08)',
                  borderBottom: '1px solid var(--border)', textAlign: 'center',
                  fontSize: 9, fontWeight: 700, color: 'var(--accent-cyan)',
                  textTransform: 'uppercase', letterSpacing: 0.5
                }}>
                  {tactic.tactic}
                </div>
                {tactic.techniques.map(tech => {
                  const colors = getSeverityColor(tech.severity, tech.detected, tech.count);
                  return (
                    <div
                      key={tech.id}
                      onClick={() => setSelectedTechnique(tech)}
                      style={{
                        padding: '5px 6px', background: colors.bg,
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        borderLeft: tech.detected ? `2px solid ${colors.border}` : 'none',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        fontSize: 8, color: colors.text,
                        fontFamily: 'var(--font-mono)',
                      }}
                      title={`${tech.id}: ${tech.name} (${tech.detected ? `Detected ${tech.count}x` : 'Not detected'})`}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 1 }}>{tech.id}</div>
                      <div style={{ fontSize: 8, color: tech.detected ? colors.text : '#475569', lineHeight: 1.3 }}>{tech.name}</div>
                      {tech.detected && (
                        <div style={{ fontSize: 8, marginTop: 1, color: '#94a3b8' }}>×{tech.count}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technique Detail */}
      {selectedTechnique && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">📋 Technique Detail: {selectedTechnique.id}</span>
            {selectedTechnique.detected ? (
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                background: 'rgba(255,59,48,0.15)', color: 'var(--critical)', border: '1px solid rgba(255,59,48,0.3)'
              }}>DETECTED ×{selectedTechnique.count}</span>
            ) : (
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                background: 'rgba(34,197,94,0.1)', color: 'var(--accent-green)', border: '1px solid rgba(34,197,94,0.2)'
              }}>NOT DETECTED</span>
            )}
          </div>
          <div className="grid-3">
            <div>
              <div className="text-xs text-muted mb-1">Technique ID</div>
              <div className="text-mono font-bold" style={{ color: 'var(--accent-cyan)' }}>{selectedTechnique.id}</div>
            </div>
            <div>
              <div className="text-xs text-muted mb-1">Name</div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{selectedTechnique.name}</div>
            </div>
            <div>
              <div className="text-xs text-muted mb-1">Severity</div>
              <div style={{
                display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: getSeverityColor(selectedTechnique.severity, true, 5).bg,
                color: getSeverityColor(selectedTechnique.severity, true, 5).text,
                border: `1px solid ${getSeverityColor(selectedTechnique.severity, true, 5).border}`
              }}>{selectedTechnique.severity}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
