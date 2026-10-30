import React, { useState, useEffect, useRef } from 'react';

interface Props { incidents: any[]; addNotification: any; }

const ATTACK_SCENARIOS = [
  'Port Scan', 'Brute Force Attack', 'SQL Injection', 'Web Shell Deployment',
  'Privilege Escalation', 'Lateral Movement', 'Data Exfiltration', 'Ransomware'
];

const CYBER_RANGE_ASSETS = [
  { id: 'internet', name: 'Internet', ip: 'External', type: 'external', status: 'active' },
  { id: 'web', name: 'Web Server', ip: '10.0.1.10', type: 'web', status: 'active' },
  { id: 'api', name: 'API Server', ip: '10.0.1.30', type: 'api', status: 'active' },
  { id: 'db', name: 'Database', ip: '10.0.2.10', type: 'database', status: 'active' },
  { id: 'linux', name: 'Linux Server', ip: '10.0.1.40', type: 'linux', status: 'active' },
  { id: 'windows', name: 'Win Simulation', ip: '10.0.4.10', type: 'windows', status: 'active' },
  { id: 'attacker', name: 'Attacker Node', ip: '185.220.101.45', type: 'attacker', status: 'simulating' },
];

function generateEvent(scenarioName: string): any {
  const events: Record<string, any> = {
    'Port Scan': {
      type: 'detection', severity: 'LOW',
      message: 'Port scan detected: 185.220.101.45 → 10.0.1.10',
      technique: 'T1595', detail: 'Ports: 22,80,443,3389,8080,8443'
    },
    'Brute Force Attack': {
      type: 'alert', severity: 'HIGH',
      message: '347 failed login attempts from 185.220.101.45',
      technique: 'T1110', detail: 'Target: SSH/10.0.1.10 | Rate: 45/sec'
    },
    'SQL Injection': {
      type: 'alert', severity: 'HIGH',
      message: 'SQL injection detected in web request',
      technique: 'T1190', detail: "Payload: ' OR 1=1-- | Status: 200 OK"
    },
    'Web Shell Deployment': {
      type: 'incident', severity: 'CRITICAL',
      message: 'Web shell installed: /var/www/html/shell.php',
      technique: 'T1505.003', detail: 'SHA256: a3f8d2e1... | Remote execution achieved'
    },
    'Privilege Escalation': {
      type: 'incident', severity: 'CRITICAL',
      message: 'SYSTEM privilege escalation via UAC bypass',
      technique: 'T1548.002', detail: 'Process: cmd.exe (SYSTEM) spawned by svchost.exe'
    },
    'Lateral Movement': {
      type: 'incident', severity: 'HIGH',
      message: 'SMB lateral movement: 10.0.1.10 → 10.0.3.10',
      technique: 'T1021.002', detail: 'Connected to ADMIN$ share | User: DOMAIN\\svc_backup'
    },
    'Data Exfiltration': {
      type: 'incident', severity: 'CRITICAL',
      message: 'Large data transfer detected: 847MB to external IP',
      technique: 'T1041', detail: 'Destination: 185.220.101.45:443 | Proto: HTTPS'
    },
    'Ransomware': {
      type: 'incident', severity: 'CRITICAL',
      message: '🔐 RANSOMWARE DETECTED: Files being encrypted',
      technique: 'T1486', detail: 'Files affected: *.docx, *.xlsx, *.pdf | Ransom note dropped'
    },
  };
  return events[scenarioName] || events['Port Scan'];
}

export default function CyberRangePage({ incidents, addNotification }: Props) {
  const [logs, setLogs] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [currentScenario, setCurrentScenario] = useState('');
  const [triggeredCount, setTriggeredCount] = useState(0);
  const intervalRef = useRef<any>(null);
  const logsEndRef = useRef<any>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const triggerScenario = (scenario: string) => {
    const event = generateEvent(scenario);
    const log = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      scenario,
      ...event,
    };
    setLogs(prev => [...prev, log]);
    setTriggeredCount(c => c + 1);
    addNotification({
      type: event.severity === 'CRITICAL' ? 'critical' : 'info',
      message: `[Cyber Range] ${event.message}`,
      timestamp: new Date().toISOString()
    });
  };

  const startAutoSimulation = () => {
    setRunning(true);
    let i = 0;
    intervalRef.current = setInterval(() => {
      const scenario = ATTACK_SCENARIOS[i % ATTACK_SCENARIOS.length];
      setCurrentScenario(scenario);
      triggerScenario(scenario);
      i++;
    }, 2500);
  };

  const stopSimulation = () => {
    setRunning(false);
    setCurrentScenario('');
    clearInterval(intervalRef.current);
  };

  const clearLogs = () => {
    setLogs([]);
    setTriggeredCount(0);
  };

  const getLogColor = (severity: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'var(--critical)', HIGH: 'var(--high)', MEDIUM: 'var(--medium)', LOW: 'var(--low)'
    };
    return colors[severity] || 'var(--text-secondary)';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = { detection: '🔍', alert: '⚠️', incident: '🚨' };
    return icons[type] || '📋';
  };

  return (
    <div>
      <div className="section-header mb-4">
        <div>
          <h1 className="section-title">🎯 Cyber Range Simulator</h1>
          <div className="section-subtitle">Controlled attack simulation environment</div>
        </div>
        <div className="flex gap-2 items-center">
          {running && (
            <div className="live-badge" style={{ padding: '6px 12px' }}>
              <div className="live-dot" />
              SIMULATION ACTIVE
            </div>
          )}
          <span className="text-xs text-muted">{triggeredCount} events generated</span>
        </div>
      </div>

      {/* Network Topology */}
      <div className="card mb-4">
        <div className="card-header">
          <span className="card-title">🌐 Cyber Range Network</span>
          <span className="text-xs text-muted">Isolated simulation environment</span>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {CYBER_RANGE_ASSETS.map(asset => (
            <div key={asset.id} style={{
              padding: '10px 14px', borderRadius: 8, flex: '1 0 120px',
              background: asset.type === 'attacker' 
                ? 'rgba(255,59,48,0.1)' 
                : 'rgba(0,212,255,0.05)',
              border: `1px solid ${asset.type === 'attacker' ? 'rgba(255,59,48,0.3)' : 'rgba(0,212,255,0.2)'}`,
              position: 'relative'
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>
                {asset.type === 'attacker' ? '💀' : asset.type === 'web' ? '🌐' : asset.type === 'database' ? '🗄️' : asset.type === 'linux' ? '🐧' : asset.type === 'windows' ? '💻' : asset.type === 'api' ? '🔧' : '🌍'}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: asset.type === 'attacker' ? 'var(--critical)' : 'var(--text-primary)', marginBottom: 2 }}>
                {asset.name}
              </div>
              <div className="text-mono" style={{ fontSize: 9, color: 'var(--text-muted)' }}>{asset.ip}</div>
              <div style={{ position: 'absolute', top: 8, right: 8 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: running && asset.id === 'attacker' ? 'var(--critical)' : 'var(--accent-green)',
                  animation: running && asset.id === 'attacker' ? 'pulse-dot 0.5s infinite' : 'pulse-dot 2s infinite'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-main-rev">
        {/* Controls */}
        <div>
          <div className="card mb-4">
            <div className="card-header">
              <span className="card-title">⚡ Simulation Controls</span>
            </div>
            <div className="flex gap-2 mb-4">
              <button
                id="start-simulation-btn"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={startAutoSimulation}
                disabled={running}
              >
                ▶ Start Auto-Sim
              </button>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={stopSimulation}
                disabled={!running}
              >
                ■ Stop
              </button>
            </div>

            <div className="text-xs text-muted mb-2" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              Manual Scenarios
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {ATTACK_SCENARIOS.map(scenario => (
                <button
                  key={scenario}
                  id={`scenario-${scenario.replace(/\s+/g, '-').toLowerCase()}`}
                  className="btn btn-ghost btn-sm"
                  style={{ justifyContent: 'flex-start', fontSize: 11 }}
                  onClick={() => triggerScenario(scenario)}
                >
                  {scenario === 'Ransomware' ? '🔐' : scenario === 'Port Scan' ? '🔍' : scenario === 'Brute Force Attack' ? '💪' : '⚡'} {scenario}
                </button>
              ))}
            </div>
          </div>

          {/* Current Status */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📊 Range Statistics</span>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Events Generated', value: triggeredCount, color: 'cyan' },
                { label: 'Incidents Detected', value: logs.filter(l => l.type === 'incident').length, color: 'red' },
                { label: 'Alerts Raised', value: logs.filter(l => l.type === 'alert').length, color: 'orange' },
                { label: 'Detection Rate', value: triggeredCount > 0 ? '100%' : '—', color: 'green' },
              ].map(s => (
                <div key={s.label} className="flex justify-between">
                  <span className="text-xs text-secondary">{s.label}</span>
                  <span className={`text-sm font-bold text-${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Event Log */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📋 Detection Log</span>
            <button className="btn btn-ghost btn-sm" onClick={clearLogs}>Clear</button>
          </div>
          <div style={{
            height: 500, overflowY: 'auto', fontFamily: 'var(--font-mono)',
            fontSize: 11, background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: 12
          }}>
            {logs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 40 }}>
                Start simulation or trigger a scenario to see events
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} style={{ marginBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                      {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                    </span>
                    <span>{getTypeIcon(log.type)}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
                      background: `${getLogColor(log.severity)}22`, color: getLogColor(log.severity) }}>
                      {log.severity}
                    </span>
                    <span style={{ color: 'var(--accent-purple)', fontSize: 9 }}>{log.technique}</span>
                  </div>
                  <div style={{ color: getLogColor(log.severity), fontWeight: log.severity === 'CRITICAL' ? 700 : 400 }}>
                    {log.message}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 2 }}>{log.detail}</div>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
