import { useState, useEffect } from 'react';

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

export function useSystemMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/metrics`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMetrics(data);
      } catch (err) {
        console.error('Failed to parse metrics data:', err);
      }
    };

    socket.onerror = (event) => {
      setError('Failed to connect to metrics service');
      setIsConnected(false);
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  return {
    metrics,
    error,
    isConnected
  };
}
