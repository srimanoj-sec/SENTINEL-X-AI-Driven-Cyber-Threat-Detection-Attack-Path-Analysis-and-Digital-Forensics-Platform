import React, { useState, useRef, useEffect } from 'react';

interface Props { incidents: any[]; addNotification: any; }

// SVG-based attack path visualization
const ATTACK_SCENARIOS = [
  {
    id: 'apt-exfil',
    name: 'APT Data Exfiltration',
    severity: 'CRITICAL',
    risk_score: 94,
    nodes: [
      { id: 'internet', x: 60, y: 160, label: 'Attacker\n(Russia)', type: 'attacker', ip: '185.220.101.45' },
      { id: 'web', x: 220, y: 100, label: 'Web Server\n10.0.1.10', type: 'server', criticality: 'HIGH' },
      { id: 'app', x: 380, y: 160, label: 'App Server\n10.0.1.20', type: 'server', criticality: 'HIGH' },
      { id: 'svc', x: 380, y: 260, label: 'Service\nAccount', type: 'account', criticality: 'HIGH' },
      { id: 'db', x: 540, y: 160, label: 'Database\n10.0.2.10', type: 'database', criticality: 'CRITICAL' },
      { id: 'data', x: 680, y: 160, label: 'Sensitive\nData', type: 'data', criticality: 'CRITICAL' },
    ],
    edges: [
      { source: 'internet', target: 'web', technique: 'T1190', label: 'Exploit' },
      { source: 'web', target: 'app', technique: 'T1059.001', label: 'PowerShell' },
      { source: 'app', target: 'svc', technique: 'T1003.001', label: 'LSASS Dump' },
      { source: 'svc', target: 'db', technique: 'T1021.002', label: 'SMB Move' },
      { source: 'db', target: 'data', technique: 'T1041', label: 'Exfil' },
    ]
  },
  {
    id: 'ransomware',
    name: 'Ransomware Attack Path',
    severity: 'CRITICAL',
    risk_score: 91,
    nodes: [
      { id: 'email', x: 60, y: 160, label: 'Phishing\nEmail', type: 'attacker', ip: '198.20.69.74' },
      { id: 'ws', x: 220, y: 160, label: 'Workstation\n10.0.4.10', type: 'workstation', criticality: 'MEDIUM' },
      { id: 'fs', x: 380, y: 100, label: 'File Server\n10.0.3.20', type: 'server', criticality: 'HIGH' },
      { id: 'ad', x: 380, y: 220, label: 'Active Directory\n10.0.3.10', type: 'server', criticality: 'CRITICAL' },
      { id: 'files', x: 540, y: 160, label: 'All Files\nEncrypted', type: 'data', criticality: 'CRITICAL' },
    ],
    edges: [
      { source: 'email', target: 'ws', technique: 'T1566', label: 'Phishing' },
      { source: 'ws', target: 'fs', technique: 'T1021.002', label: 'Lateral Move' },
      { source: 'ws', target: 'ad', technique: 'T1021.001', label: 'RDP' },
      { source: 'ad', target: 'files', technique: 'T1486', label: 'Ransomware' },
      { source: 'fs', target: 'files', technique: 'T1486', label: 'Encryption' },
    ]
  }
];

const NODE_COLORS: Record<string, string> = {
  attacker: '#ff3b30', server: '#3b82f6', database: '#8b5cf6',
  workstation: '#ff9500', data: '#ef4444', account: '#eab308'
};

const NODE_ICONS: Record<string, string> = {
  attacker: '💀', server: '🖥️', database: '🗄️',
  workstation: '💻', data: '📂', account: '👤'
};

function AttackGraph({ scenario }: { scenario: typeof ATTACK_SCENARIOS[0] }) {
  const getNodeById = (id: string) => scenario.nodes.find(n => n.id === id);

  return (
    <svg width="100%" viewBox="0 0 760 320" style={{ overflow: 'visible' }}>
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="rgba(0,212,255,0.6)" />
        </marker>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Grid */}
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,212,255,0.05)" strokeWidth="1" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Edges */}
      {scenario.edges.map((edge, i) => {
        const src = getNodeById(edge.source);
        const tgt = getNodeById(edge.target);
        if (!src || !tgt) return null;
        const mx = (src.x + tgt.x) / 2;
        const my = (src.y + tgt.y) / 2;
        return (
          <g key={i}>
            <line
              x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
              stroke="rgba(0,212,255,0.4)" strokeWidth="2"
              strokeDasharray="6,3"
              markerEnd="url(#arrowhead)"
            />
            <rect x={mx - 30} y={my - 10} width={60} height={18} rx={9}
              fill="rgba(10,15,30,0.9)" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
            <text x={mx} y={my + 3} textAnchor="middle" fontSize="8" fill="#94a3b8" fontFamily="var(--font-mono)">
              {edge.label}
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {scenario.nodes.map(node => (
        <g key={node.id} filter="url(#glow)">
          <circle cx={node.x} cy={node.y} r={30}
            fill={`${NODE_COLORS[node.type] || '#3b82f6'}22`}
            stroke={NODE_COLORS[node.type] || '#3b82f6'}
            strokeWidth="2"
          />
          <text x={node.x} y={node.y + 5} textAnchor="middle" fontSize="18">{NODE_ICONS[node.type]}</text>
          {node.label.split('\n').map((line, i) => (
            <text key={i} x={node.x} y={node.y + 42 + i * 12} textAnchor="middle"
              fontSize="9" fill={i === 0 ? '#f1f5f9' : '#94a3b8'} fontWeight={i === 0 ? '600' : '400'}>
              {line}
            </text>
          ))}
        </g>
      ))}
    </svg>
  );
}

export default function AttackPathPage({ incidents, addNotification }: Props) {
  const [selected, setSelected] = useState(ATTACK_SCENARIOS[0]);

  return (
    <div>
      <div className="section-header mb-4">
        <div>
          <h1 className="section-title">🗺️ Attack Path Analysis</h1>
          <div className="section-subtitle">Visualize attacker movement through your network</div>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="flex gap-3 mb-4">
        {ATTACK_SCENARIOS.map(s => (
          <div
            key={s.id}
            onClick={() => setSelected(s)}
            style={{
              padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
              background: selected.id === s.id ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${selected.id === s.id ? 'rgba(0,212,255,0.4)' : 'var(--border)'}`,
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: selected.id === s.id ? 'var(--accent-cyan)' : 'var(--text-primary)', marginBottom: 4 }}>
              {s.name}
            </div>
            <div className="flex gap-2">
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
                background: 'rgba(255,59,48,0.15)', color: 'var(--critical)'
              }}>{s.severity}</span>
              <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Risk: {s.risk_score}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Attack Graph */}
      <div className="card mb-4">
        <div className="card-header">
          <span className="card-title">⚡ {selected.name}</span>
          <div className="flex gap-2 items-center">
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Risk Score:</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--critical)', fontFamily: 'var(--font-mono)' }}>
              {selected.risk_score}/100
            </span>
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: 16, overflow: 'auto' }}>
          <AttackGraph scenario={selected} />
        </div>
        
        {/* Legend */}
        <div className="flex gap-4 mt-3 flex-wrap">
          {Object.entries(NODE_ICONS).map(([type, icon]) => (
            <div key={type} className="flex items-center gap-2">
              <span style={{ fontSize: 14 }}>{icon}</span>
              <span className="text-xs text-muted" style={{ textTransform: 'capitalize' }}>{type}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div style={{ width: 20, height: 2, background: 'rgba(0,212,255,0.4)', borderRadius: 1 }} />
            <span className="text-xs text-muted">Attack Edge</span>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Attack Steps */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📋 Attack Chain Techniques</span>
          </div>
          <div>
            {selected.edges.map((edge, i) => {
              const src = selected.nodes.find(n => n.id === edge.source);
              const tgt = selected.nodes.find(n => n.id === edge.target);
              return (
                <div key={i} style={{
                  padding: '10px 12px', borderRadius: 8, marginBottom: 6,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)'
                }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted">{src?.label?.split('\n')[0]} → {tgt?.label?.split('\n')[0]}</span>
                    <span className="text-mono text-xs" style={{ color: 'var(--accent-purple)' }}>{edge.technique}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{edge.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">⚠️ Risk Assessment</span>
          </div>
          <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
            <div style={{
              fontSize: 64, fontWeight: 900, color: 'var(--critical)',
              textShadow: '0 0 20px rgba(255,59,48,0.4)',
              fontFamily: 'var(--font-mono)', lineHeight: 1
            }}>{selected.risk_score}</div>
            <div className="text-xs text-muted mt-1">Risk Score / 100</div>
            <div style={{ display: 'inline-block', padding: '4px 16px', borderRadius: 20, marginTop: 8,
              background: 'rgba(255,59,48,0.15)', color: 'var(--critical)', border: '1px solid rgba(255,59,48,0.3)',
              fontWeight: 700, fontSize: 12 }}>CRITICAL</div>
          </div>
          
          <div className="flex flex-col gap-3">
            {[
              { label: 'Internet-Facing Asset', icon: '🌐', risk: 'HIGH' },
              { label: 'Privileged Account Involved', icon: '👤', risk: 'CRITICAL' },
              { label: 'Database Reachable', icon: '🗄️', risk: 'CRITICAL' },
              { label: 'Sensitive Data Exposed', icon: '📂', risk: 'CRITICAL' },
              { label: 'Multi-Stage Attack Chain', icon: '⛓️', risk: 'HIGH' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="text-xs text-secondary">{item.label}</span>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                  background: item.risk === 'CRITICAL' ? 'rgba(255,59,48,0.15)' : 'rgba(255,149,0,0.15)',
                  color: item.risk === 'CRITICAL' ? 'var(--critical)' : 'var(--high)',
                  border: `1px solid ${item.risk === 'CRITICAL' ? 'rgba(255,59,48,0.3)' : 'rgba(255,149,0,0.3)'}`
                }}>{item.risk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
