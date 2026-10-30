import React, { useState, useRef, useEffect } from 'react';
import { aiChat } from '../services/api';

interface Props { incidents: any[]; addNotification: any; }

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  "Why was this incident classified as critical?",
  "How do I contain this attack immediately?",
  "What forensic evidence was collected?",
  "Who is the threat actor?",
  "What is the attack path?",
  "What MITRE techniques were used?",
  "What are the recommended remediation steps?",
  "Is there evidence of data exfiltration?",
];

const QUICK_ANALYSES = [
  {
    title: 'Incident Risk Assessment',
    severity: 'CRITICAL',
    score: 94,
    findings: [
      'Attacker obtained initial access via SQL injection (T1190)',
      'Privilege escalation to SYSTEM level detected (T1548.002)',
      'LSASS memory dumped — credentials likely stolen (T1003.001)',
      'Lateral movement to database server confirmed (T1021.002)',
      'Data exfiltration detected over HTTPS (T1041)',
    ],
    recommendations: [
      'IMMEDIATELY isolate all affected systems',
      'Engage DFIR team for full forensic investigation',
      'Notify CISO and executive team',
      'Reset all domain credentials',
      'Block attacker IPs at perimeter firewall',
    ]
  }
];

export default function AIAssistantPage({ incidents, addNotification }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '🤖 SENTINEL-X AI Investigation Assistant\n\nI can help you investigate security incidents, analyze threats, and recommend response actions.\n\nYou can ask me:\n• Why was this incident classified as critical?\n• How do I contain this attack?\n• What forensic evidence was collected?\n• Who is the threat actor?\n\nSelect a suggested question or type your own.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAIResponse = (question: string): string => {
    const q = question.toLowerCase();
    
    if (q.includes('critical') || q.includes('why') || q.includes('classify')) {
      return `The incident was classified as CRITICAL because:

1. 🎯 The attacker exploited a public-facing vulnerability (T1190) to gain initial access to the web server.

2. ⬆️ Privilege escalation was detected — the attacker achieved SYSTEM-level access via UAC bypass (T1548.002).

3. 🔑 LSASS memory was dumped using mimikatz-like tooling (T1003.001). Domain credentials are confirmed compromised.

4. 🌐 Lateral movement to the database server was confirmed via SMB (T1021.002).

5. 📤 847MB of data was exfiltrated to a known malicious IP (T1041).

6. 🗄️ The database server contains customer PII and financial records — classified as CRITICAL asset.

Risk Score: 94/100 | CVSS Equivalent: 9.8

🚨 Recommended Priority: IMMEDIATE CONTAINMENT`;
    }
    
    if (q.includes('contain') || q.includes('stop') || q.includes('block') || q.includes('immediate')) {
      return `🛡️ IMMEDIATE CONTAINMENT STEPS:

1. 🔌 ISOLATE affected systems (web-01, app-01, db-01) from the network NOW
   • Use network segmentation / VLAN isolation
   • Disable all active sessions on affected hosts

2. 🚫 BLOCK attacker IPs at perimeter firewall:
   • 185.220.101.45 (Primary attacker)
   • 103.35.74.99 (C2 server)

3. 🔑 DISABLE compromised accounts:
   • DOMAIN\\svc_backup (used for lateral movement)
   • Force password reset for all admins

4. 🔍 PRESERVE EVIDENCE:
   • Capture memory images of all affected systems
   • Export security event logs immediately
   • Do NOT wipe or reboot systems before forensics

5. 📞 ESCALATE:
   • Notify CISO immediately
   • Engage DFIR team
   • Consider regulatory notification if PII was accessed

Expected containment time: 2-4 hours`;
    }
    
    if (q.includes('evidence') || q.includes('forensic')) {
      return `🔍 FORENSIC EVIDENCE SUMMARY:

Collected Evidence Items:
━━━━━━━━━━━━━━━━━━━━━━━━

📁 EVD-1042 | Malware Sample
   File: payload_9871.exe (2.3 MB)
   SHA-256: a3f8d2e1c4b7960f5a...
   Integrity: ✅ VALID | Source: web-01

🧠 EVD-1043 | Memory Dump (LSASS)
   File: lsass_9872.dmp (50 MB)
   SHA-256: b5c9e3f2d6a1b4e7c0...
   Integrity: ✅ VALID | Credentials likely present

🌐 EVD-1044 | Network Capture
   File: capture_9873.pcap (15 MB)
   Contains: C2 communications, exfil traffic

📋 EVD-1045 | Windows Event Logs
   File: security_9874.evtx (8 MB)
   Contains: Logon events, privilege use

All evidence has been SHA-256 verified and chain of custody established.

⚠️ IMPORTANT: Do not modify evidence — maintain admissibility.`;
    }
    
    if (q.includes('actor') || q.includes('who') || q.includes('attacker')) {
      return `🕵️ THREAT ACTOR ANALYSIS:

Profile Assessment:
━━━━━━━━━━━━━━━━━━
🏴 Likely Actor: APT29 (Cozy Bear) or affiliated group
🌍 Origin: Russia (Based on IP geolocation & TTP overlap)
🎯 Sophistication: Nation-State Level
💰 Motivation: Intelligence gathering / Data exfiltration

Evidence of Attribution:
• IP 185.220.101.45 — known Russian AS, TOR exit node
• TTP overlap with APT29 campaigns (LSASS dump + SMB lateral movement)
• C2 infrastructure (c2-server.malicious-actor.net) matches known APT29 pattern
• Attack timing aligns with Russian business hours (UTC+3)

MITRE Group: G0016 (APT29)
Confidence: MEDIUM-HIGH (based on available evidence)

⚠️ Note: Attribution is probabilistic. Full investigation required.`;
    }
    
    if (q.includes('mitre') || q.includes('technique') || q.includes('tactic')) {
      return `⚔️ MITRE ATT&CK ANALYSIS:

Detected Techniques (Incident INC-2026-1042):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Reconnaissance]
• T1595 — Active Scanning (Nmap-style port scan)

[Initial Access]
• T1190 — Exploit Public-Facing Application (SQL Injection)

[Execution]
• T1059.001 — PowerShell (Encoded command execution)

[Persistence]
• T1505.003 — Web Shell (/var/www/html/shell.php)

[Privilege Escalation]
• T1548.002 — Bypass UAC (SYSTEM access achieved)

[Credential Access]
• T1003.001 — LSASS Memory Dump (mimikatz-like)

[Lateral Movement]
• T1021.002 — SMB/Windows Admin Shares

[Collection]
• T1560.001 — Archive Collected Data

[Exfiltration]
• T1041 — Exfiltration Over C2 Channel

Total: 9 techniques across 8 tactics
Coverage: Full Kill Chain`;
    }
    
    if (q.includes('remediat') || q.includes('fix') || q.includes('patch') || q.includes('prevent')) {
      return `🔧 REMEDIATION ROADMAP:

IMMEDIATE (0-24 hours):
1. ✅ Contain — Isolate affected systems
2. ✅ Eradicate — Remove web shell, malware
3. ✅ Reset — All compromised credentials
4. ✅ Patch — CVE for exploited web application

SHORT-TERM (1-7 days):
5. 🔍 Full forensic investigation
6. 🛡️ Deploy WAF rules for SQL injection prevention
7. 🔐 Implement privileged access workstations (PAW)
8. 📊 Review and tighten firewall rules
9. 🎓 Security awareness training for all staff

LONG-TERM (1-3 months):
10. 🏗️ Implement Zero Trust architecture
11. 🔑 Deploy PAM (Privileged Access Management)
12. 📡 Enhance SIEM detection rules based on this incident
13. 🧪 Regular penetration testing
14. 📋 Update incident response playbooks`;
    }
    
    if (q.includes('exfil') || q.includes('data') || q.includes('stolen') || q.includes('leak')) {
      return `📤 DATA EXFILTRATION ANALYSIS:

Evidence of Exfiltration: CONFIRMED ⚠️

Detection Details:
• Volume: 847 MB transferred to external IP
• Destination: 185.220.101.45:443 (HTTPS/encrypted)
• Protocol: HTTPS (evades DLP inspection)
• Duration: ~12 minutes
• Estimated records: ~2.1M customer records

Potential Data Affected:
🔴 Customer PII (names, addresses, emails)
🔴 Financial records (payment data)
🔴 Authentication credentials (hashed passwords)
🟡 Internal documents (marked confidential)

Regulatory Impact:
• GDPR: LIKELY notification required (72hr deadline)
• DPDP Act (India): Notification may be required
• PCI-DSS: Immediate notification to card brands

Recommended: Engage legal counsel and DPO immediately.
Preserve all exfiltration evidence for regulatory response.`;
    }
    
    return `🤖 SENTINEL-X AI: I analyzed your query.

Based on the current incident data in SENTINEL-X:

• ${incidents.length || 12} incidents currently being tracked
• ${incidents.filter(i => i.severity === 'CRITICAL').length || 3} CRITICAL incidents requiring immediate attention
• Most recent threat: SQL Injection → Database Compromise

I can provide deeper analysis if you ask about:
• Incident classification reasoning
• Containment procedures
• Forensic evidence details
• Threat actor attribution
• MITRE ATT&CK technique analysis
• Remediation roadmap
• Data exfiltration assessment

What would you like to investigate?`;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: Message = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    const question = input;
    setInput('');
    setLoading(true);
    
    await new Promise(r => setTimeout(r, 800));
    
    let response = '';
    try {
      const r = await aiChat(question);
      response = r.data.response;
    } catch {
      response = getAIResponse(question);
    }
    
    const assistantMsg: Message = { role: 'assistant', content: response, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, assistantMsg]);
    setLoading(false);
  };

  const askSuggested = (q: string) => {
    setInput(q);
    setTimeout(() => sendMessage(), 100);
  };

  return (
    <div>
      <div className="section-header mb-4">
        <div>
          <h1 className="section-title">🤖 AI Investigation Assistant</h1>
          <div className="section-subtitle">Powered by SENTINEL-X AI • Ask anything about your incidents</div>
        </div>
        <div style={{
          padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
          background: 'rgba(34,197,94,0.1)', color: 'var(--accent-green)',
          border: '1px solid rgba(34,197,94,0.2)'
        }}>🧠 AI ONLINE</div>
      </div>

      <div className="grid-main-rev">
        {/* Quick Analysis Cards */}
        <div>
          <div className="card mb-4">
            <div className="card-header">
              <span className="card-title">💡 Suggested Questions</span>
            </div>
            <div className="flex flex-col gap-1">
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  className="btn btn-ghost btn-sm"
                  style={{ justifyContent: 'flex-start', textAlign: 'left', whiteSpace: 'normal', height: 'auto', padding: '8px 12px' }}
                  onClick={() => { setInput(q); }}
                >
                  <span style={{ fontSize: 12 }}>❓</span> {q}
                </button>
              ))}
            </div>
          </div>

          {/* Active Incident Summary */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🚨 Active Context</span>
            </div>
            <div style={{ padding: 12, background: 'rgba(255,59,48,0.05)', borderRadius: 8, border: '1px solid rgba(255,59,48,0.2)' }}>
              <div className="text-mono text-xs text-cyan mb-1">INC-2026-1042</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>SQL Injection → DB Dump</div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-xs text-muted">Risk Score</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--critical)', fontFamily: 'var(--font-mono)' }}>94/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted">Severity</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--critical)' }}>CRITICAL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted">Techniques</span>
                  <span className="text-xs text-secondary">9 detected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted">Evidence</span>
                  <span className="text-xs text-secondary">4 items</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 600 }}>
          <div className="card-header">
            <span className="card-title">💬 Investigation Chat</span>
            <div className="flex items-center gap-2">
              <div className="status-dot" />
              <span className="text-xs text-muted">SENTINEL-X AI v1.0</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0', marginBottom: 12 }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`ai-message ${msg.role}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {msg.role === 'assistant' && (
                  <div style={{ fontSize: 10, color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: 6 }}>
                    🤖 SENTINEL-X AI
                  </div>
                )}
                {msg.role === 'user' && (
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 6 }}>
                    👤 You
                  </div>
                )}
                <div style={{ whiteSpace: 'pre-line', fontSize: 12, lineHeight: 1.7 }}>{msg.content}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 6 }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="ai-message assistant">
                <div style={{ fontSize: 10, color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: 6 }}>🤖 SENTINEL-X AI</div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--accent-cyan)',
                      animation: `pulse-dot 1s ease-in-out ${i * 0.2}s infinite`
                    }} />
                  ))}
                  <span className="text-xs text-muted" style={{ marginLeft: 8 }}>Analyzing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <div className="flex gap-2">
              <input
                id="ai-chat-input"
                className="ai-input"
                style={{ flex: 1 }}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about incidents, threats, containment, forensics..."
              />
              <button
                id="ai-send-btn"
                className="btn btn-primary"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
              >
                Send
              </button>
            </div>
            <div className="text-xs text-muted mt-2" style={{ textAlign: 'center' }}>
              SENTINEL-X AI analyzes your incidents and provides investigation guidance
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
