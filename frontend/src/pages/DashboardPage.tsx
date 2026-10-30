import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getDashboardStats, generateIncident } from '../services/api';
import { SeverityBadge, StatusBadge, RiskScore } from '../components/Notifications';

interface Props { incidents: any[]; addNotification: any; }

const COLORS = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#00d4ff', '#8b5cf6'];

// Simulated data for when backend is offline
function generateSimulatedData() {
  const now = new Date();
  const trend = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    critical: Math.floor(Math.random() * 4),
    high: Math.floor(Math.random() * 6),
    medium: Math.floor(Math.random() * 9),
    low: Math.floor(Math.random() * 12),
  }));

  const attackDist = [
    { name: 'SQL Injection', value: 3 },
    { name: 'Ransomware', value: 2 },
    { name: 'Brute Force', value: 4 },
    { name: 'Web Shell', value: 2 },
    { name: 'APT Exfil', value: 1 },
    { name: 'Phishing', value: 3 },
  ];

  const topIPs = [
    { ip: '185.220.101.45', country: '🇷🇺 Russia', count: 147, reputation: 'MALICIOUS' },
    { ip: '198.20.69.74', country: '🇨🇳 China', count: 89, reputation: 'MALICIOUS' },
    { ip: '91.108.4.168', country: '🇩🇪 Germany', count: 63, reputation: 'MALICIOUS' },
    { ip: '103.35.74.99', country: '🇭🇰 Hong Kong', count: 41, reputation: 'MALICIOUS' },
    { ip: '5.188.206.26', country: '🇷🇺 Russia', count: 38, reputation: 'MALICIOUS' },
  ];

  const mitreData = [
    { id: 'T1190', name: 'Exploit Public App', tactic: 'Initial Access', count: 8, severity: 'HIGH' },
    { id: 'T1059.001', name: 'PowerShell', tactic: 'Execution', count: 6, severity: 'HIGH' },
    { id: 'T1003.001', name: 'LSASS Memory', tactic: 'Credential Access', count: 5, severity: 'CRITICAL' },
    { id: 'T1021.001', name: 'RDP', tactic: 'Lateral Movement', count: 4, severity: 'HIGH' },
    { id: 'T1041', name: 'C2 Exfiltration', tactic: 'Exfiltration', count: 3, severity: 'CRITICAL' },
    { id: 'T1486', name: 'Ransomware', tactic: 'Impact', count: 2, severity: 'CRITICAL' },
    { id: 'T1505.003', name: 'Web Shell', tactic: 'Persistence', count: 4, severity: 'CRITICAL' },
    { id: 'T1110', name: 'Brute Force', tactic: 'Cred Access', count: 7, severity: 'HIGH' },
  ];

  return { trend, attackDist, topIPs, mitreData };
}

const simData = generateSimulatedData();

export default function DashboardPage({ incidents, addNotification }: Props) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    getDashboardStats()
      .then(r => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [incidents.length]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const r = await generateIncident();
      addNotification({
        type: r.data.severity === 'CRITICAL' ? 'critical' : 'info',
        message: `New incident generated: ${r.data.title}`,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      addNotification({ type: 'info', message: 'Incident simulation triggered', timestamp: new Date().toISOString() });
    }
    setGenerating(false);
  };

  // Use real stats or simulated
  const summary = stats?.summary || {
    total_incidents: incidents.length || 12,
    critical: incidents.filter(i => i.severity === 'CRITICAL').length || 3,
    high: incidents.filter(i => i.severity === 'HIGH').length || 5,
    medium: incidents.filter(i => i.severity === 'MEDIUM').length || 4,
    open: incidents.filter(i => i.status === 'OPEN').length || 8,
    resolved: 4,
  };
  
  const trend = stats?.threat_trend || simData.trend;
  const topIPs = stats?.top_attacking_ips || simData.topIPs;
  const mitreData = stats?.mitre_heatmap || simData.mitreData;
  const attackDist = stats?.attack_distribution || simData.attackDist;
  const recentIncidents = [...incidents].sort((a,b) => (b.risk_score||0) - (a.risk_score||0)).slice(0, 8);

  return (
    <div>
      {/* Header */}
      <div className="section-header mb-6">
        <div>
          <h1 className="section-title">🛡️ Security Operations Center</h1>
          <div className="section-subtitle">Real-time threat monitoring and incident management</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>↺ Refresh</button>
          <button 
            id="generate-incident-btn"
            className="btn btn-danger btn-sm" 
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? '⏳ Generating...' : '⚡ Simulate Attack'}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card critical">
          <div className="stat-icon red">🚨</div>
          <div className="stat-value red">{summary.critical}</div>
          <div className="stat-label">Critical Incidents</div>
          <div className="stat-change up">▲ Requires immediate action</div>
        </div>
        <div className="stat-card high">
          <div className="stat-icon orange">⚠️</div>
          <div className="stat-value orange">{summary.high}</div>
          <div className="stat-label">High Severity</div>
          <div className="stat-change up">▲ Investigate within 2h</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon cyan">📋</div>
          <div className="stat-value cyan">{summary.total_incidents}</div>
          <div className="stat-label">Total Incidents</div>
          <div className="stat-change" style={{color:'var(--text-muted)'}}>↔ {summary.open} open</div>
        </div>
        <div className="stat-card low">
          <div className="stat-icon green">✅</div>
          <div className="stat-value green">{summary.resolved}</div>
          <div className="stat-label">Resolved</div>
          <div className="stat-change down">▼ Closed successfully</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid-2 mb-4">
        {/* Threat Trend */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📈 24-Hour Threat Trend</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="gradCrit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff3b30" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff3b30" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff9500" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff9500" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#475569' }} interval={3} />
              <YAxis tick={{ fontSize: 9, fill: '#475569' }} />
              <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="critical" stroke="#ff3b30" fill="url(#gradCrit)" strokeWidth={2} />
              <Area type="monotone" dataKey="high" stroke="#ff9500" fill="url(#gradHigh)" strokeWidth={2} />
              <Area type="monotone" dataKey="medium" stroke="#ffcc00" fill="none" strokeWidth={1} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Attack Distribution */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🎯 Attack Distribution</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={attackDist}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {attackDist.map((entry: any, index: number) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10, color: 'var(--text-secondary)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-main mb-4">
        {/* Recent Incidents */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🚨 Active Incidents</span>
            <span className="text-xs text-muted">{summary.open} open</span>
          </div>
          <div className="scrollable" style={{ maxHeight: 320 }}>
            <table className="incident-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Incident</th>
                  <th>Severity</th>
                  <th>Risk</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentIncidents.length > 0 ? recentIncidents.map((inc: any) => (
                  <tr key={inc.id}>
                    <td>
                      <span className="text-mono text-xs text-cyan">{inc.id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 12, marginBottom: 2 }}>{inc.title}</div>
                      <div className="text-xs text-muted truncate" style={{ maxWidth: 200 }}>{inc.attacker_ip}</div>
                    </td>
                    <td><SeverityBadge severity={inc.severity} /></td>
                    <td><RiskScore score={inc.risk_score || 50} /></td>
                    <td><StatusBadge status={inc.status} /></td>
                  </tr>
                )) : (
                  // Placeholder data
                  [
                    { id: 'INC-2026-1042', title: 'SQL Injection → DB Dump', severity: 'CRITICAL', risk_score: 94, status: 'OPEN', attacker_ip: '185.220.101.45' },
                    { id: 'INC-2026-1041', title: 'Phishing → Ransomware', severity: 'CRITICAL', risk_score: 91, status: 'INVESTIGATING', attacker_ip: '198.20.69.74' },
                    { id: 'INC-2026-1040', title: 'Web Shell → Privilege Escalation', severity: 'CRITICAL', risk_score: 88, status: 'OPEN', attacker_ip: '91.108.4.168' },
                    { id: 'INC-2026-1039', title: 'Brute Force → Lateral Movement', severity: 'HIGH', risk_score: 76, status: 'OPEN', attacker_ip: '5.188.206.26' },
                    { id: 'INC-2026-1038', title: 'APT Data Exfiltration', severity: 'HIGH', risk_score: 72, status: 'INVESTIGATING', attacker_ip: '103.35.74.99' },
                  ].map((inc: any) => (
                    <tr key={inc.id}>
                      <td><span className="text-mono text-xs text-cyan">{inc.id}</span></td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 12, marginBottom: 2 }}>{inc.title}</div>
                        <div className="text-xs text-muted">{inc.attacker_ip}</div>
                      </td>
                      <td><SeverityBadge severity={inc.severity} /></td>
                      <td><RiskScore score={inc.risk_score} /></td>
                      <td><StatusBadge status={inc.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Attacking IPs */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🌐 Top Attacking IPs</span>
          </div>
          <div className="scrollable-sm">
            {topIPs.map((ip: any, i: number) => (
              <div key={ip.ip || i} style={{ marginBottom: 12 }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-mono text-xs" style={{ color: 'var(--critical)' }}>{ip.ip}</span>
                  <span className="text-xs text-muted">{ip.count || ip.incidents || 0} hits</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted">{ip.country}</span>
                  <span style={{
                    padding: '1px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700,
                    background: 'rgba(255,59,48,0.1)', color: 'var(--critical)'
                  }}>{ip.reputation || 'MALICIOUS'}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill red" style={{ width: `${Math.min(100, (ip.count || 40) / 1.5)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MITRE Heatmap */}
      <div className="card mb-4">
        <div className="card-header">
          <span className="card-title">⚔️ MITRE ATT&CK — Detected Techniques</span>
          <span className="text-xs text-muted">Top {mitreData.slice(0, 8).length} active techniques</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={mitreData.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 9, fill: '#475569' }} />
            <YAxis dataKey="id" type="category" tick={{ fontSize: 9, fill: '#94a3b8', fontFamily: 'var(--font-mono)' }} width={80} />
            <Tooltip
              contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, fontSize: 11 }}
              formatter={(v: any, _: any, p: any) => [v, `${p.payload.name} (${p.payload.tactic})`]}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {mitreData.slice(0, 8).map((entry: any, index: number) => (
                <Cell key={index} fill={entry.severity === 'CRITICAL' ? '#ff3b30' : entry.severity === 'HIGH' ? '#ff9500' : '#ffcc00'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Stats Row */}
      <div className="grid-3">
        <div className="card">
          <div className="card-header"><span className="card-title">🔍 IOC Intelligence</span></div>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Malicious IPs', value: stats?.ioc_stats?.malicious_ips || 7, color: 'red' },
              { label: 'Malicious Domains', value: stats?.ioc_stats?.malicious_domains || 4, color: 'orange' },
              { label: 'Malware Hashes', value: stats?.ioc_stats?.malware_hashes || 12, color: 'cyan' },
              { label: 'Total IOCs', value: stats?.ioc_stats?.total || 23, color: 'purple' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-xs text-secondary">{item.label}</span>
                <span className={`text-sm font-bold text-${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">🗂️ Forensic Evidence</span></div>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Evidence Items', value: stats?.forensics_stats?.total_evidence || 16, color: 'cyan' },
              { label: 'Verified Integrity', value: stats?.forensics_stats?.verified || 16, color: 'green' },
              { label: 'Memory Dumps', value: 4, color: 'orange' },
              { label: 'Network PCAPs', value: 3, color: 'purple' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-xs text-secondary">{item.label}</span>
                <span className={`text-sm font-bold text-${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">🎯 Threat Feeds</span></div>
          <div className="flex flex-col gap-2">
            {[
              { name: 'AlienVault OTX', iocs: 1247, status: 'active' },
              { name: 'VirusTotal', iocs: 892, status: 'active' },
              { name: 'MISP', iocs: 3211, status: 'active' },
              { name: 'Shodan', iocs: 445, status: 'active' },
            ].map(feed => (
              <div key={feed.name} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="status-dot" style={{ width: 6, height: 6 }} />
                  <span className="text-xs text-secondary">{feed.name}</span>
                </div>
                <span className="text-xs text-cyan font-mono">{feed.iocs.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
