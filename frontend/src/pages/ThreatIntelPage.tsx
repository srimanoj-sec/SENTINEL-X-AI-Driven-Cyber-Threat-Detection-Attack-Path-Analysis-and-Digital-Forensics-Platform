import React, { useState } from 'react';

interface Props { incidents: any[]; addNotification: any; }

const DEMO_IOCS = [
  { type: 'IP', value: '185.220.101.45', threat_score: 98, country: '🇷🇺 Russia', asn: 'AS396303', tags: ['TOR Exit', 'Scanner'], reputation: 'MALICIOUS' },
  { type: 'IP', value: '198.20.69.74', threat_score: 91, country: '🇨🇳 China', asn: 'AS4134', tags: ['Botnet', 'C2'], reputation: 'MALICIOUS' },
  { type: 'IP', value: '91.108.4.168', threat_score: 87, country: '🇩🇪 Germany', asn: 'AS62041', tags: ['Malware Distribution'], reputation: 'MALICIOUS' },
  { type: 'IP', value: '103.35.74.99', threat_score: 95, country: '🇭🇰 Hong Kong', asn: 'AS58461', tags: ['APT Infrastructure', 'C2'], reputation: 'MALICIOUS' },
  { type: 'domain', value: 'c2-server.malicious-actor.net', threat_score: 93, country: 'Unknown', asn: 'N/A', tags: ['C2', 'Malware'], reputation: 'MALICIOUS' },
  { type: 'domain', value: 'exfil-drop.evil-infra.ru', threat_score: 96, country: '🇷🇺 Russia', asn: 'AS49877', tags: ['Exfiltration', 'APT'], reputation: 'MALICIOUS' },
  { type: 'hash', value: 'a3f8d2e1c4b7960f5ad8e3c2b1f7d9e4a5c8b3f1d2e6c9a0b7e4f1c8d3a5e2', threat_score: 99, country: 'N/A', asn: 'N/A', tags: ['Ransomware', 'LockBit'], reputation: 'MALICIOUS' },
  { type: 'hash', value: 'b5c9e3f2d6a1b4e7c0f3d8a2e5c7b0f4d1e8a3c6b9f2d5a0e3c8b1f6d9a2e7', threat_score: 88, country: 'N/A', asn: 'N/A', tags: ['Credential Stealer', 'Mimikatz'], reputation: 'MALICIOUS' },
  { type: 'email', value: 'invoice@suspicious-domain.ru', threat_score: 85, country: '🇷🇺 Russia', asn: 'N/A', tags: ['Phishing', 'Malspam'], reputation: 'SUSPICIOUS' },
  { type: 'URL', value: 'https://evil-cdn.net/payload/dropper.exe', threat_score: 97, country: '🇳🇱 Netherlands', asn: 'AS14061', tags: ['Malware Delivery', 'Drive-by'], reputation: 'MALICIOUS' },
];

const FEEDS = [
  { name: 'AlienVault OTX', status: 'active', iocs: 1247, last_updated: '2 min ago', color: 'var(--accent-green)' },
  { name: 'VirusTotal', status: 'active', iocs: 892, last_updated: '5 min ago', color: 'var(--accent-cyan)' },
  { name: 'MISP', status: 'active', iocs: 3211, last_updated: '1 min ago', color: 'var(--accent-purple)' },
  { name: 'Shodan', status: 'active', iocs: 445, last_updated: '10 min ago', color: 'var(--accent-blue)' },
  { name: 'Abuse.ch', status: 'active', iocs: 678, last_updated: '3 min ago', color: 'var(--high)' },
];

function getScoreColor(score: number) {
  if (score >= 90) return 'var(--critical)';
  if (score >= 75) return 'var(--high)';
  if (score >= 50) return 'var(--medium)';
  return 'var(--low)';
}

export default function ThreatIntelPage({ incidents, addNotification }: Props) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(DEMO_IOCS[0]);

  const filtered = DEMO_IOCS.filter(ioc => {
    const matchType = filter === 'ALL' || ioc.type === filter;
    const matchSearch = !search || ioc.value.toLowerCase().includes(search.toLowerCase()) || ioc.tags.join(' ').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div>
      <div className="section-header mb-4">
        <div>
          <h1 className="section-title">🌐 Threat Intelligence</h1>
          <div className="section-subtitle">IOC enrichment, feed management & threat scoring</div>
        </div>
      </div>

      {/* Feed Status */}
      <div className="card mb-4">
        <div className="card-header">
          <span className="card-title">📡 Active Threat Feeds</span>
          <span style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 600 }}>5 CONNECTED</span>
        </div>
        <div className="flex gap-3 flex-wrap">
          {FEEDS.map(feed => (
            <div key={feed.name} style={{
              flex: 1, minWidth: 140, padding: '12px 16px',
              background: 'rgba(0,0,0,0.3)', borderRadius: 8,
              border: `1px solid ${feed.color}33`,
            }}>
              <div className="flex items-center gap-2 mb-2">
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: feed.color, boxShadow: `0 0 6px ${feed.color}` }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{feed.name}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: feed.color, marginBottom: 2 }}>{feed.iocs.toLocaleString()}</div>
              <div className="text-xs text-muted">Updated {feed.last_updated}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-main">
        {/* IOC List */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🔍 IOC Database</span>
            <span className="text-xs text-muted">{filtered.length} indicators</span>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <input
              className="form-input"
              style={{ flex: 1, minWidth: 200 }}
              placeholder="Search IOCs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {['ALL', 'IP', 'domain', 'hash', 'email', 'URL'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>

          <div className="scrollable">
            {filtered.map((ioc, i) => (
              <div
                key={i}
                className="ioc-item"
                onClick={() => setSelected(ioc)}
                style={{
                  cursor: 'pointer',
                  borderColor: selected?.value === ioc.value ? 'rgba(0,212,255,0.4)' : 'var(--border)',
                  background: selected?.value === ioc.value ? 'rgba(0,212,255,0.05)' : 'rgba(255,255,255,0.02)',
                }}
              >
                <span className="ioc-type-badge">{ioc.type}</span>
                <span className="ioc-value">{ioc.value}</span>
                <div className="flex items-center gap-2">
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: getScoreColor(ioc.threat_score),
                    fontFamily: 'var(--font-mono)'
                  }}>{ioc.threat_score}</span>
                  <span style={{
                    padding: '1px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700,
                    background: ioc.reputation === 'MALICIOUS' ? 'rgba(255,59,48,0.1)' : 'rgba(255,149,0,0.1)',
                    color: ioc.reputation === 'MALICIOUS' ? 'var(--critical)' : 'var(--high)'
                  }}>{ioc.reputation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* IOC Detail */}
        {selected && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">🔎 IOC Enrichment</span>
              <span style={{
                padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                background: 'rgba(255,59,48,0.15)', color: 'var(--critical)', border: '1px solid rgba(255,59,48,0.3)'
              }}>{selected.reputation}</span>
            </div>

            {/* Threat Score Gauge */}
            <div style={{ textAlign: 'center', padding: '20px 0', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
              <div style={{
                fontSize: 56, fontWeight: 900,
                color: getScoreColor(selected.threat_score),
                textShadow: `0 0 20px ${getScoreColor(selected.threat_score)}60`,
                lineHeight: 1,
                fontFamily: 'var(--font-mono)'
              }}>
                {selected.threat_score}
              </div>
              <div className="text-xs text-muted mt-2">Threat Score (0-100)</div>
              <div className="progress-bar mt-2">
                <div className="progress-fill red" style={{ width: `${selected.threat_score}%`, background: getScoreColor(selected.threat_score) }} />
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              {[
                { label: 'Type', value: selected.type },
                { label: 'Value', value: selected.value, mono: true },
                { label: 'Country', value: selected.country },
                { label: 'ASN', value: selected.asn, mono: true },
                { label: 'Reputation', value: selected.reputation },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-start gap-4">
                  <span className="text-xs text-muted">{item.label}</span>
                  <span className={`text-xs ${item.mono ? 'text-mono' : ''}`} style={{ color: 'var(--text-secondary)', textAlign: 'right', wordBreak: 'break-all', maxWidth: 200 }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="mb-3">
              <div className="text-xs text-muted mb-2" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Threat Tags</div>
              <div className="flex gap-1 flex-wrap">
                {selected.tags.map((tag: string) => (
                  <span key={tag} style={{
                    padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                    background: 'rgba(139,92,246,0.1)', color: 'var(--accent-purple)',
                    border: '1px solid rgba(139,92,246,0.2)'
                  }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* WHOIS / Enrichment */}
            <div style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div className="text-xs text-muted mb-2" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Intelligence Summary</div>
              <div className="text-xs text-secondary" style={{ lineHeight: 1.8 }}>
                This indicator has been observed in <strong style={{ color: 'var(--critical)' }}>multiple threat campaigns</strong>. 
                Associated with <strong style={{ color: 'var(--high)' }}>{selected.tags[0]}</strong> activity. 
                First seen in threat feeds 47 days ago. 
                Last active: <strong style={{ color: 'var(--accent-cyan)' }}>2 hours ago</strong>.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
