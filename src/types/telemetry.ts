export interface TelemetryData {
  soilMoisture: number; // 0 - 100 %
  tankLevel: number;    // 0 - 100 %
  temperature: number;  // °C
  humidity: number;     // %
  pumpStatus: boolean;  // true = ON, false = OFF
  lowTankWarning: boolean;
  systemStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'LOCKOUT';
  mode: 'AUTO' | 'MANUAL';
  manualRequest: boolean;
  sdOk: boolean;
  dhtOk: boolean;
  uptimeMs: number;
  timestamp: string;
  source: 'live-mqtt' | 'demo' | 'testbench' | 'http';
  isStale?: boolean;
  freshnessSeconds?: number;
}

export interface TelemetryHistoryPoint {
  time: string;
  timestamp: number;
  soilMoisture: number;
  tankLevel: number;
  temperature: number;
  humidity: number;
  pumpStatus: boolean;
}

export interface SystemHealthStatus {
  esp32: 'CONNECTED' | 'OFFLINE' | 'DEGRADED';
  dht22: 'HEALTHY' | 'ERROR' | 'UNAVAILABLE';
  soilSensor: 'HEALTHY' | 'ERROR';
  tankSensor: 'HEALTHY' | 'LOW_LEVEL' | 'ERROR';
  pumpIndicator: 'ACTIVE' | 'STANDBY' | 'LOCKOUT';
  sdLogger: 'LOGGING' | 'UNAVAILABLE' | 'FULL';
  mqttBroker: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';
  latencyMs: number;
  wifiRssi: number;
}

export interface AlertItem {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
  title: string;
  message: string;
  timestamp: string;
  cleared?: boolean;
}

export type TimeWindow = '1m' | '5m' | '30m';

export interface AcceptanceTestCase {
  id: string;
  category: 'firmware' | 'mqtt' | 'interlock' | 'backend' | 'safety';
  name: string;
  description: string;
  expectedResult: string;
  status: 'PENDING' | 'PASS' | 'FAIL' | 'RUNNING';
  verifiedDetail?: string;
}

export interface SerialLogMessage {
  id: string;
  timestamp: string;
  raw: string;
  type: 'INFO' | 'TELEMETRY' | 'EVENT' | 'WARN' | 'ERROR';
}

export interface WaterUsageMetrics {
  totalPumpActiveMs: number;
  totalWaterPumpedLitres: number;
  todayCyclesCompleted: number;
  currentFlowRateLpm: number;
  waterSavingsPercentage: number;
}

export interface SdCardLogRow {
  elapsedMs: number;
  recordType: string;
  detail: string;
  soilPct: number;
  tankPct: number;
  tempC: number | string;
  humidityPct: number | string;
  mode: string;
  pump: string;
  tankState: string;
}
