import React, { useState, useEffect } from 'react';
import { getForensicEvidence } from '../services/api';

interface Props { incidents: any[]; addNotification: any; }

const DEMO_EVIDENCE = [
  {
    id: 'EVD-1042', incident_id: 'INC-2026-1042', type: 'Malware Sample',
    filename: 'payload_9871.exe', sha256: 'a3f8d2e1c4b7960f5ad8e3c2b1f7d9e4a5c8b3f1d2e6c9a0b7e4f1c8d3a5e2',
    md5: 'abc123def456789012', size: 2457600, collected_at: new Date(Date.now() - 3600000).toISOString(),
    source_ip: '10.0.1.10', integrity: 'VALID',
    chain_of_custody: [
      { action: 'Acquired', by: 'SENTINEL-X Auto-Collector', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { action: 'Hashed (SHA-256)', by: 'Forensics Engine', timestamp: new Date(Date.now() - 3595000).toISOString() },
      { action: 'Quarantined', by: 'SOC Analyst', timestamp: new Date(Date.now() - 3590000).toISOString() },
    ],
    metadata: { created: new Date(Date.now() - 86400000).toISOString(), category: 'executable', ioc_extracted: true }
  },
  {
    id: 'EVD-1043', incident_id: 'INC-2026-1042', type: 'Memory Dump',
    filename: 'lsass_9872.dmp', sha256: 'b5c9e3f2d6a1b4e7c0f3d8a2e5c7b0f4d1e8a3c6b9f2d5a0e3c8b1f6d9a2e7',
    md5: 'fed987cba654321098', size: 52428800, collected_at: new Date(Date.now() - 3500000).toISOString(),
    source_ip: '10.0.1.10', integrity: 'VALID',
    chain_of_custody: [
      { action: 'Acquired', by: 'SENTINEL-X Auto-Collector', timestamp: new Date(Date.now() - 3500000).toISOString() },
      { action: 'Hashed (SHA-256)', by: 'Forensics Engine', timestamp: new Date(Date.now() - 3495000).toISOString() },
    ],
    metadata: { created: new Date(Date.now() - 3500000).toISOString(), category: 'memory', ioc_extracted: true }
  },
  {
    id: 'EVD-1044', incident_id: 'INC-2026-1042', type: 'Network Capture',
    filename: 'capture_9873.pcap', sha256: 'c7d1a5e8f2b6c9d3a0e4b7f1c8d5a2e6b3f0d4a7e1b8c2f5d9a3e6b0f4d7a1',
    md5: 'aabbccddeeff11223344', size: 15728640, collected_at: new Date(Date.now() - 3400000).toISOString(),
    source_ip: 'Network Tap', integrity: 'VALID',
    chain_of_custody: [
      { action: 'Captured', by: 'IDS Sensor', timestamp: new Date(Date.now() - 3400000).toISOString() },
      { action: 'Hashed (SHA-256)', by: 'Forensics Engine', timestamp: new Date(Date.now() - 3395000).toISOString() },
    ],
    metadata: { created: new Date(Date.now() - 3400000).toISOString(), category: 'network', ioc_extracted: false }
  },
  {
    id: 'EVD-1045', incident_id: 'INC-2026-1041', type: 'Log File',
    filename: 'security_9874.evtx', sha256: 'd9e2f6a1b5c8d3e7f0a4b8c1d5e9f2a6b0c4d7e1f5a9b3c6d0e4f8a2b6c9d3',
    md5: '112233445566778899aa', size: 8388608, collected_at: new Date(Date.now() - 7200000).toISOString(),
    source_ip: '10.0.3.10', integrity: 'VALID',
    chain_of_custody: [
      { action: 'Exported', by: 'SENTINEL-X Log Collector', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { action: 'Hashed (SHA-256)', by: 'Forensics Engine', timestamp: new Date(Date.now() - 7195000).toISOString() },
    ],
    metadata: { created: new Date(Date.now() - 7200000).toISOString(), category: 'log', ioc_extracted: true }
  },
];

function formatFileSize(bytes: number) {
  if (bytes > 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes > 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function getCategoryIcon(category: string) {
  const icons: Record<string, string> = {
    executable: '💾', memory: '🧠', network: '🌐', log: '📋', registry: '🔑'
  };
  return icons[category] || '📄';
}

export default function ForensicsPage({ incidents, addNotification }: Props) {
  const [evidence, setEvidence] = useState(DEMO_EVIDENCE);
  const [selected, setSelected] = useState<any>(DEMO_EVIDENCE[0]);
  const [hashInput, setHashInput] = useState('');
  const [hashResult, setHashResult] = useState<any>(null);

  useEffect(() => {
    getForensicEvidence()
      .then(r => { if (r.data.evidence?.length) setEvidence([...DEMO_EVIDENCE, ...r.data.evidence]); })
      .catch(() => {});
  }, []);

  const handleHash = async () => {
    if (!hashInput) return;
    const sha256 = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(hashInput))
      .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));
    setHashResult({ input: hashInput, sha256, integrity: 'COMPUTED', timestamp: new Date().toISOString() });
  };

  return (
    <div>
      <div className="section-header mb-4">
        <div>
          <h1 className="section-title">🔍 Digital Forensics</h1>
          <div className="section-subtitle">Evidence management, chain of custody & forensic analysis</div>
        </div>
        <div className="flex gap-2 items-center">
          <div style={{ fontSize: 12, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="status-dot" /> {evidence.filter(e => e.integrity === 'VALID').length} Verified
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{evidence.length} Total Items</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid-4 mb-4">
        {[
          { label: 'Total Evidence', value: evidence.length, color: 'cyan', icon: '📦' },
          { label: 'Verified (SHA-256)', value: evidence.filter(e => e.integrity === 'VALID').length, color: 'green', icon: '✅' },
          { label: 'Incidents Covered', value: [...new Set(evidence.map(e => e.incident_id))].length, color: 'purple', icon: '🚨' },
          { label: 'IOCs Extracted', value: evidence.filter(e => e.metadata?.ioc_extracted).length, color: 'orange', icon: '🔍' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-icon" style={{ background: `rgba(var(--${s.color}-rgb, 0,212,255),0.15)` }}>{s.icon}</div>
            <div className={`stat-value ${s.color}`}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-main mb-4">
        {/* Evidence List */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📦 Evidence Repository</span>
          </div>
          <div className="scrollable">
            {evidence.map((ev: any) => (
              <div
                key={ev.id}
                className="evidence-card"
                onClick={() => setSelected(ev)}
                style={{
                  borderColor: selected?.id === ev.id ? 'rgba(0,212,255,0.4)' : 'var(--border)',
                  cursor: 'pointer'
                }}
              >
                <div className="evidence-header">
                  <div className="evidence-id">{ev.id}</div>
                  <div className="evidence-integrity">✅ {ev.integrity}</div>
                </div>
                <div className="evidence-filename">
                  {getCategoryIcon(ev.metadata?.category)} {ev.filename}
                </div>
                <div className="evidence-hash">SHA256: {ev.sha256?.substring(0, 32)}...</div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted">{formatFileSize(ev.size)}</span>
                  <span className="text-xs text-muted">{new Date(ev.collected_at).toLocaleString()}</span>
                  <span className="text-xs text-cyan">{ev.incident_id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Detail */}
        {selected && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">🔎 Evidence Detail</span>
              <div className="evidence-integrity">✅ {selected.integrity}</div>
            </div>
            <div className="scrollable">
              {/* Metadata */}
              <div style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 8, marginBottom: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                  {getCategoryIcon(selected.metadata?.category)} {selected.filename}
                </div>
                <div className="flex flex-col gap-1">
                  {[
                    { label: 'Evidence ID', value: selected.id, mono: true, color: 'var(--accent-cyan)' },
                    { label: 'Incident', value: selected.incident_id, mono: true, color: 'var(--accent-orange)' },
                    { label: 'Type', value: selected.type },
                    { label: 'Size', value: formatFileSize(selected.size) },
                    { label: 'Source', value: selected.source_ip },
                    { label: 'Collected', value: new Date(selected.collected_at).toLocaleString() },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between">
                      <span className="text-xs text-muted">{item.label}</span>
                      <span className="text-xs" style={{ fontFamily: item.mono ? 'var(--font-mono)' : undefined, color: item.color || 'var(--text-secondary)' }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hashes */}
              <div style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 8, marginBottom: 12, border: '1px solid var(--border)' }}>
                <div className="text-xs text-muted mb-2" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>File Hashes</div>
                <div className="flex flex-col gap-2">
                  <div>
                    <div className="text-xs text-secondary mb-1">SHA-256</div>
                    <div className="text-mono" style={{ fontSize: 9, color: 'var(--accent-cyan)', wordBreak: 'break-all' }}>{selected.sha256}</div>
                  </div>
                  <div>
                    <div className="text-xs text-secondary mb-1">MD5</div>
                    <div className="text-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{selected.md5}</div>
                  </div>
                </div>
              </div>

              {/* Chain of Custody */}
              <div>
                <div className="text-xs text-muted mb-2" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Chain of Custody</div>
                <div className="timeline">
                  {selected.chain_of_custody?.map((entry: any, i: number) => (
                    <div key={i} className="timeline-item">
                      <div className="timeline-time">{new Date(entry.timestamp).toLocaleString()}</div>
                      <div className="timeline-event">{entry.action}</div>
                      <div className="timeline-technique">{entry.by}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SHA-256 Hash Tool */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">🔐 SHA-256 Integrity Verifier</span>
        </div>
        <div className="flex gap-2 mb-3">
          <input
            className="form-input"
            style={{ flex: 1 }}
            placeholder="Enter file content or string to hash..."
            value={hashInput}
            onChange={e => setHashInput(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleHash}>Compute Hash</button>
        </div>
        {hashResult && (
          <div style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid rgba(0,212,255,0.2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green font-bold text-xs">✅ COMPUTED</span>
              <span className="text-xs text-muted">{hashResult.timestamp}</span>
            </div>
            <div className="text-xs text-secondary mb-1">SHA-256:</div>
            <div className="text-mono" style={{ fontSize: 11, color: 'var(--accent-cyan)', wordBreak: 'break-all' }}>{hashResult.sha256}</div>
          </div>
        )}
      </div>
    </div>
  );
}
