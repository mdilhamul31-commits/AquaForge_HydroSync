import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TelemetryData, 
  TelemetryHistoryPoint, 
  SystemHealthStatus, 
  AlertItem, 
  TimeWindow,
  SerialLogMessage,
  WaterUsageMetrics,
  SdCardLogRow
} from '../types/telemetry';
import { 
  sensorService, 
  ConnectionMode, 
  DEFAULT_MQTT_BROKER_WSS, 
  DEFAULT_MQTT_TOPIC_ROOT,
  WOKWI_PROJECT_ID,
  WOKWI_PROJECT_URL
} from '../services/sensorService';

const MAX_HISTORY_POINTS = 300;
const MAX_SERIAL_LOGS = 150;
const MAX_SD_ROWS = 100;

export function useSensorData() {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    soilMoisture: 45.0,
    tankLevel: 75.0,
    temperature: 24.5,
    humidity: 62.0,
    pumpStatus: false,
    lowTankWarning: false,
    systemStatus: 'NORMAL',
    mode: 'AUTO',
    manualRequest: false,
    sdOk: true,
    dhtOk: true,
    uptimeMs: 142000,
    timestamp: new Date().toLocaleTimeString(),
    source: 'demo',
    isStale: false,
    freshnessSeconds: 0
  });

  const [history, setHistory] = useState<TelemetryHistoryPoint[]>([]);
  const [health, setHealth] = useState<SystemHealthStatus>({
    esp32: 'CONNECTED',
    dht22: 'HEALTHY',
    soilSensor: 'HEALTHY',
    tankSensor: 'HEALTHY',
    pumpIndicator: 'STANDBY',
    sdLogger: 'LOGGING',
    mqttBroker: 'DISCONNECTED',
    latencyMs: 18,
    wifiRssi: -58
  });

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'init-1',
      type: 'INFO',
      title: 'HYDROSYNC Controller Online',
      message: 'ESP32 Stage 4 firmware initialized. Local control authoritative.',
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString()
    },
    {
      id: 'init-2',
      type: 'SUCCESS',
      title: 'Sensor Subsystems Calibrated',
      message: 'Soil moisture ADC (GPIO34), tank sensor (GPIO35), and DHT22 operational.',
      timestamp: new Date(Date.now() - 30000).toLocaleTimeString()
    }
  ]);

  const [serialLogs, setSerialLogs] = useState<SerialLogMessage[]>([
    {
      id: 's-1',
      timestamp: new Date(Date.now() - 15000).toLocaleTimeString(),
      raw: '[BOOT] HYDROSYNC Stage 4 firmware booted. Local control authoritative.',
      type: 'INFO'
    },
    {
      id: 's-2',
      timestamp: new Date(Date.now() - 12000).toLocaleTimeString(),
      raw: '[SD] MicroSD initialized; /hydrosync_log.csv opened in append mode.',
      type: 'INFO'
    },
    {
      id: 's-3',
      timestamp: new Date(Date.now() - 9000).toLocaleTimeString(),
      raw: '[WIFI] Connected to Wokwi-GUEST. IP: 10.0.1.15',
      type: 'INFO'
    },
    {
      id: 's-4',
      timestamp: new Date(Date.now() - 6000).toLocaleTimeString(),
      raw: '[MQTT] Connected to broker.hivemq.com:1883.',
      type: 'INFO'
    }
  ]);

  const [waterMetrics, setWaterMetrics] = useState<WaterUsageMetrics>({
    totalPumpActiveMs: 42000,
    totalWaterPumpedLitres: 1.26,
    todayCyclesCompleted: 2,
    currentFlowRateLpm: 0,
    waterSavingsPercentage: 38.5
  });

  const [sdCardRows, setSdCardRows] = useState<SdCardLogRow[]>([
    {
      elapsedMs: 140000,
      recordType: 'TELEMETRY',
      detail: 'Boot baseline',
      soilPct: 45.0,
      tankPct: 75.0,
      tempC: 24.5,
      humidityPct: 62.0,
      mode: 'AUTO',
      pump: 'OFF',
      tankState: 'OK'
    }
  ]);

  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('demo');
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [connectionDetail, setConnectionDetail] = useState<string>('Realistic Simulated Telemetry (Demo Mode)');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('5m');

  const historyRef = useRef<TelemetryHistoryPoint[]>([]);

  useEffect(() => {
    const initialHistory: TelemetryHistoryPoint[] = [];
    const now = Date.now();
    for (let i = 25; i >= 0; i--) {
      const t = now - i * 3000;
      const date = new Date(t);
      initialHistory.push({
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timestamp: t,
        soilMoisture: Math.max(10, Math.min(95, 45 + Math.sin(i / 3) * 12)),
        tankLevel: Math.max(15, Math.min(95, 75 - i * 0.4)),
        temperature: 24 + Math.sin(i / 5) * 1.5,
        humidity: 60 + Math.cos(i / 4) * 5,
        pumpStatus: false
      });
    }
    historyRef.current = initialHistory;
    setHistory(initialHistory);

    const unsubscribe = sensorService.subscribe({
      onTelemetry: (data) => {
        setTelemetry(data);
        const point: TelemetryHistoryPoint = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          timestamp: Date.now(),
          soilMoisture: data.soilMoisture,
          tankLevel: data.tankLevel,
          temperature: data.temperature,
          humidity: data.humidity,
          pumpStatus: data.pumpStatus
        };

        historyRef.current = [...historyRef.current.slice(-MAX_HISTORY_POINTS), point];
        setHistory(historyRef.current);
      },
      onAlert: (alert) => {
        setAlerts(prev => [alert, ...prev.slice(0, 49)]);
      },
      onHealthUpdate: (h) => {
        setHealth(h);
      },
      onConnectionChange: (mode, connected, detail) => {
        setConnectionMode(mode);
        setIsLiveConnected(connected);
        setConnectionDetail(detail);
      },
      onSerialMessage: (msg) => {
        setSerialLogs(prev => [...prev.slice(-MAX_SERIAL_LOGS), msg]);
      },
      onWaterMetricsUpdate: (metrics) => {
        setWaterMetrics(metrics);
      },
      onSdCardRowLogged: (row) => {
        setSdCardRows(prev => [row, ...prev.slice(0, MAX_SD_ROWS - 1)]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const switchMode = useCallback((newMode: ConnectionMode) => {
    sensorService.setMode(newMode);
  }, []);

  const updateTestbench = useCallback((values: Partial<TelemetryData>) => {
    sensorService.setTestbenchValues(values);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const clearSerialLogs = useCallback(() => {
    setSerialLogs([]);
  }, []);

  const exportCsv = useCallback(() => {
    const headers = 'elapsed_ms,record_type,detail,soil_pct,tank_pct,temp_c,humidity_pct,mode,pump,tank_state\n';
    const rows = history.map((pt, idx) => {
      const elapsed = idx * 3000;
      const pump = pt.pumpStatus ? 'ON' : 'OFF';
      const lockout = pt.tankLevel < 15 ? 'LOCKOUT' : 'OK';
      return `${elapsed},TELEMETRY,"Live Snapshot",${pt.soilMoisture.toFixed(1)},${pt.tankLevel.toFixed(1)},${pt.temperature.toFixed(1)},${pt.humidity.toFixed(1)},AUTO,${pump},${lockout}`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hydrosync_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [history]);

  const filteredHistory = history.filter(pt => {
    const ageMs = Date.now() - pt.timestamp;
    if (timeWindow === '1m') return ageMs <= 60 * 1000;
    if (timeWindow === '5m') return ageMs <= 5 * 60 * 1000;
    return ageMs <= 30 * 60 * 1000;
  });

  return {
    telemetry,
    history: filteredHistory,
    allHistoryCount: history.length,
    health,
    alerts,
    serialLogs,
    waterMetrics,
    sdCardRows,
    connectionMode,
    isLiveConnected,
    connectionDetail,
    timeWindow,
    setTimeWindow,
    switchMode,
    updateTestbench,
    clearAlerts,
    clearSerialLogs,
    exportCsv,
    wokwiInfo: {
      projectId: WOKWI_PROJECT_ID,
      projectUrl: WOKWI_PROJECT_URL,
      mqttBrokerWss: DEFAULT_MQTT_BROKER_WSS,
      mqttTopicRoot: DEFAULT_MQTT_TOPIC_ROOT
    }
  };
}
