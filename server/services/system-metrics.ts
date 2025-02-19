import { WebSocketServer, WebSocket } from 'ws';
import os from 'os';

interface SystemMetric {
  name: string;
  value: string | number;
  percentage?: number;
  status?: 'healthy' | 'warning' | 'error';
}

interface SystemMetrics {
  resources: SystemMetric[];
  health: SystemMetric[];
  timestamp: number;
}

// Collection of connected WebSocket clients
const clients = new Set<WebSocket>();

// Get system resource metrics
function getResourceMetrics(): SystemMetric[] {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memoryPercentage = (usedMem / totalMem) * 100;

  const cpuUsage = os.loadavg()[0] * 100 / os.cpus().length;
  
  return [
    {
      name: 'Memory Usage',
      value: `${Math.round(usedMem / 1024 / 1024 / 1024 * 100) / 100} GB / ${Math.round(totalMem / 1024 / 1024 / 1024 * 100) / 100} GB`,
      percentage: Math.round(memoryPercentage * 100) / 100
    },
    {
      name: 'CPU Usage',
      value: `${Math.round(cpuUsage * 100) / 100}%`,
      percentage: Math.round(cpuUsage * 100) / 100
    },
    {
      name: 'Uptime',
      value: `${Math.round(os.uptime() / 3600 * 100) / 100} hours`,
      percentage: 100
    }
  ];
}

// Get system health metrics
function getHealthMetrics(): SystemMetric[] {
  const memoryHealth = os.freemem() / os.totalmem() > 0.2 ? 'healthy' : 'warning';
  const cpuHealth = os.loadavg()[0] < os.cpus().length * 0.8 ? 'healthy' : 'warning';
  
  return [
    {
      name: 'Memory Status',
      status: memoryHealth,
      value: memoryHealth
    },
    {
      name: 'CPU Status',
      status: cpuHealth,
      value: cpuHealth
    },
    {
      name: 'System Status',
      status: 'healthy',
      value: 'healthy'
    }
  ];
}

// Get all system metrics
function getSystemMetrics(): SystemMetrics {
  return {
    resources: getResourceMetrics(),
    health: getHealthMetrics(),
    timestamp: Date.now()
  };
}

// Broadcast metrics to all connected clients
function broadcastMetrics() {
  const metrics = getSystemMetrics();
  const data = JSON.stringify(metrics);
  
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Initialize WebSocket server
export function initializeMetricsWebSocket(server: any) {
  const wss = new WebSocketServer({ server, path: '/ws/metrics' });

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);
    
    // Send initial metrics
    ws.send(JSON.stringify(getSystemMetrics()));

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  // Broadcast metrics every 5 seconds
  setInterval(broadcastMetrics, 5000);
}

// Get current metrics (for REST API)
export function getCurrentMetrics(): SystemMetrics {
  return getSystemMetrics();
}
