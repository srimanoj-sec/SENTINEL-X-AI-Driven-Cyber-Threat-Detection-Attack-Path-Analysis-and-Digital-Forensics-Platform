import React, { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardPage from './pages/DashboardPage';
import IncidentsPage from './pages/IncidentsPage';
import ForensicsPage from './pages/ForensicsPage';
import ThreatIntelPage from './pages/ThreatIntelPage';
import AttackPathPage from './pages/AttackPathPage';
import MitrePage from './pages/MitrePage';
import CyberRangePage from './pages/CyberRangePage';
import AIAssistantPage from './pages/AIAssistantPage';
import LoginPage from './pages/LoginPage';
import { NotificationContainer } from './components/Notifications';
import type { Page, Notification } from './types';

export type { Page, Notification };

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [incidents, setIncidents] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const addNotification = useCallback((notif: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev.slice(-4), { ...notif, id }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const connect = () => {
      try {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${wsProtocol}//${window.location.host}/ws`);
        wsRef.current = ws;
        ws.onopen = () => {
          setWsConnected(true);
          ws.send(JSON.stringify({ type: 'subscribe', channel: 'all' }));
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'new_incident') {
              setIncidents(prev => [data.incident, ...prev.slice(0, 49)]);
              addNotification({
                type: data.incident.severity === 'CRITICAL' ? 'critical' : 'info',
                message: data.message || `New incident: ${data.incident.title}`,
                timestamp: new Date().toISOString()
              });
            }
          } catch (e) {}
        };
        ws.onclose = () => { setWsConnected(false); setTimeout(connect, 5000); };
        ws.onerror = () => { ws.close(); };
      } catch (e) {}
    };
    connect();
    return () => { wsRef.current?.close(); };
  }, [isLoggedIn, addNotification]);

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  const pageProps = { incidents, addNotification };

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} incidents={incidents} />
      <div className="main-content">
        <TopBar page={currentPage} wsConnected={wsConnected} />
        <div className="page-content animate-fade">
          {currentPage === 'dashboard' && <DashboardPage {...pageProps} />}
          {currentPage === 'incidents' && <IncidentsPage {...pageProps} />}
          {currentPage === 'forensics' && <ForensicsPage {...pageProps} />}
          {currentPage === 'threat-intel' && <ThreatIntelPage {...pageProps} />}
          {currentPage === 'attack-paths' && <AttackPathPage {...pageProps} />}
          {currentPage === 'mitre' && <MitrePage {...pageProps} />}
          {currentPage === 'cyber-range' && <CyberRangePage {...pageProps} />}
          {currentPage === 'ai-assistant' && <AIAssistantPage {...pageProps} />}
        </div>
      </div>
      <NotificationContainer notifications={notifications} />
    </div>
  );
}

export default App;
