import mqtt, { MqttClient } from 'mqtt';
import { 
  TelemetryData, 
  SystemHealthStatus, 
  AlertItem, 
  SerialLogMessage, 
  WaterUsageMetrics, 
  SdCardLogRow 
} from '../types/telemetry';
import { 
  evaluateIrrigationLogic, 
  SOIL_ON_THRESHOLD, 
  SOIL_OFF_THRESHOLD, 
  TANK_LOCKOUT_THRESHOLD, 
  TANK_RECOVERY_THRESHOLD 
} from './irrigationLogic';

export const GITHUB_REPO_URL = 'https://github.com/ayankunduixb-pixel/AquaForge-HYDROSYNC-Smart-IoT-Based-Irrigation-and-Monitoring-System';
export const WOKWI_PROJECT_ID = '479928426260819969';
export const WOKWI_PROJECT_URL = `https://wokwi.com/projects/${WOKWI_PROJECT_ID}`;
export const DEFAULT_MQTT_BROKER_WSS = 'wss://broker.hivemq.com:8884/mqtt';
export const DEFAULT_MQTT_TOPIC_ROOT = `aquaforge/hydrosync/aqua5-${WOKWI_PROJECT_ID}`;
export const STALE_AFTER_SECONDS = 20;

export type ConnectionMode = 'live-mqtt' | 'demo' | 'testbench';

export interface SensorServiceListener {
  onTelemetry: (data: TelemetryData) => void;
  onAlert: (alert: AlertItem) => void;
  onHealthUpdate: (health: SystemHealthStatus) => void;
  onConnectionChange: (mode: ConnectionMode, connected: boolean, detail: string) => void;
  onSerialMessage?: (msg: SerialLogMessage) => void;
  onWaterMetricsUpdate?: (metrics: WaterUsageMetrics) => void;
  onSdCardRowLogged?: (row: SdCardLogRow) => void;
}

export class SensorService {
  private mode: ConnectionMode = 'demo';
  private mqttClient: MqttClient | null = null;
  private demoInterval: number | null = null;
  private staleCheckInterval: number | null = null;
  private listeners: Set<SensorServiceListener> = new Set();
  
  // Current in-memory state
  private currentState: TelemetryData = {
    soilMoisture: 42.0,
    tankLevel: 68.0,
    temperature: 24.8,
    humidity: 58.0,
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
  };

  private healthState: SystemHealthStatus = {
    esp32: 'CONNECTED',
    dht22: 'HEALTHY',
    soilSensor: 'HEALTHY',
    tankSensor: 'HEALTHY',
    pumpIndicator: 'STANDBY',
    sdLogger: 'LOGGING',
    mqttBroker: 'DISCONNECTED',
    latencyMs: 18,
    wifiRssi: -58
  };

  private waterMetrics: WaterUsageMetrics = {
    totalPumpActiveMs: 34000,
    totalWaterPumpedLitres: 1.02,
    todayCyclesCompleted: 2,
    currentFlowRateLpm: 0,
    waterSavingsPercentage: 38.5
  };

  private lastHeartbeat = Date.now();
  private isConnectedToMqtt = false;
  private pumpStartTime: number | null = null;

  constructor() {
    this.startDemoMode();
    this.startStaleChecker();
  }

  public subscribe(listener: SensorServiceListener): () => void {
    this.listeners.add(listener);
    listener.onTelemetry({ ...this.currentState });
    listener.onHealthUpdate({ ...this.healthState });
    listener.onConnectionChange(this.mode, this.isConnectedToMqtt, this.getConnectionDetail());
    if (listener.onWaterMetricsUpdate) {
      listener.onWaterMetricsUpdate({ ...this.waterMetrics });
    }
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getMode(): ConnectionMode {
    return this.mode;
  }

  public setMode(mode: ConnectionMode) {
    if (this.mode === mode) return;
    this.mode = mode;

    this.logSerial(`[MODE] Switched connection mode to: ${mode.toUpperCase()}`, 'INFO');

    if (mode === 'live-mqtt') {
      this.stopDemoMode();
      this.connectMqtt();
    } else if (mode === 'demo') {
      this.disconnectMqtt();
      this.startDemoMode();
    } else if (mode === 'testbench') {
      this.stopDemoMode();
      this.disconnectMqtt();
      this.currentState.source = 'testbench';
      this.currentState.isStale = false;
      this.currentState.freshnessSeconds = 0;
      this.notifyTelemetry();
      this.notifyConnectionChange();
    }
  }

  public setTestbenchValues(values: Partial<TelemetryData>) {
    if (this.mode !== 'testbench') {
      this.setMode('testbench');
    }

    const soil = values.soilMoisture !== undefined ? values.soilMoisture : this.currentState.soilMoisture;
    const tank = values.tankLevel !== undefined ? values.tankLevel : this.currentState.tankLevel;
    const mode = values.mode !== undefined ? values.mode : this.currentState.mode;
    const manualReq = values.manualRequest !== undefined ? values.manualRequest : this.currentState.manualRequest;

    const decision = evaluateIrrigationLogic(
      soil, 
      tank, 
      mode, 
      manualReq,
      this.currentState.pumpStatus,
      this.currentState.lowTankWarning
    );

    const prevPump = this.currentState.pumpStatus;

    this.currentState = {
      ...this.currentState,
      ...values,
      soilMoisture: Math.max(0, Math.min(100, soil)),
      tankLevel: Math.max(0, Math.min(100, tank)),
      temperature: values.temperature !== undefined ? values.temperature : this.currentState.temperature,
      humidity: values.humidity !== undefined ? values.humidity : this.currentState.humidity,
      pumpStatus: decision.pumpOn,
      lowTankWarning: decision.lowTankWarning,
      systemStatus: decision.systemStatus,
      mode,
      manualRequest: manualReq,
      timestamp: new Date().toLocaleTimeString(),
      source: 'testbench',
      isStale: false,
      freshnessSeconds: 0
    };

    this.updatePumpTracking(prevPump, decision.pumpOn);
    this.lastHeartbeat = Date.now();
    this.updateHealthFromState();
    this.notifyTelemetry();

    this.logSerial(
      `[TWIN] soil=${soil.toFixed(1)}% tank=${tank.toFixed(1)}% pump=${decision.pumpOn ? 'ON' : 'OFF'} lockout=${decision.tankLockout ? 'LOCK' : 'OK'}`,
      decision.pumpOn ? 'EVENT' : 'TELEMETRY'
    );
  }

  public connectMqtt(brokerUrl: string = DEFAULT_MQTT_BROKER_WSS, topicRoot: string = DEFAULT_MQTT_TOPIC_ROOT) {
    this.disconnectMqtt();

    this.healthState.mqttBroker = 'CONNECTING';
    this.notifyHealth();
    this.notifyConnectionChange();

    this.logSerial(`[MQTT] Connecting to ${brokerUrl}...`, 'INFO');

    try {
      const clientId = `hydro-dash-${Math.random().toString(16).substring(2, 10)}`;
      this.mqttClient = mqtt.connect(brokerUrl, {
        clientId,
        clean: true,
        connectTimeout: 8000,
        reconnectPeriod: 5000,
        rejectUnauthorized: false
      });

      this.mqttClient.on('connect', () => {
        this.isConnectedToMqtt = true;
        this.healthState.mqttBroker = 'CONNECTED';
        this.healthState.esp32 = 'CONNECTED';
        this.lastHeartbeat = Date.now();
        this.notifyHealth();
        this.notifyConnectionChange();

        this.logSerial(`[MQTT] Connected to broker. Subscribed to ${topicRoot}/#`, 'INFO');

        this.notifyAlert({
          id: `mqtt-conn-${Date.now()}`,
          type: 'SUCCESS',
          title: 'HiveMQ Broker Connected',
          message: `Connected to WSS broker. Subscribing to ${topicRoot}/#`,
          timestamp: new Date().toLocaleTimeString()
        });

        this.mqttClient?.subscribe([
          `${topicRoot}/telemetry`,
          `${topicRoot}/status`,
          `${topicRoot}/events`
        ]);
      });

      this.mqttClient.on('message', (topic, payload) => {
        try {
          const str = payload.toString();
          if (str.length > 4096) {
            console.warn('Rejected oversized MQTT payload (>4KiB)');
            return;
          }
          const parsed = JSON.parse(str);
          this.handleIncomingRawPayload(topic, parsed);
        } catch (e) {
          console.warn('Failed to parse MQTT message payload:', e);
        }
      });

      this.mqttClient.on('error', (err) => {
        this.healthState.mqttBroker = 'DISCONNECTED';
        this.isConnectedToMqtt = false;
        this.notifyHealth();
        this.notifyConnectionChange();
        this.logSerial(`[MQTT ERROR] ${err.message}`, 'ERROR');
      });

      this.mqttClient.on('offline', () => {
        this.isConnectedToMqtt = false;
        this.healthState.mqttBroker = 'DISCONNECTED';
        this.healthState.esp32 = 'OFFLINE';
        this.notifyHealth();
        this.notifyConnectionChange();
        this.logSerial(`[MQTT] Broker connection went offline.`, 'WARN');
      });
    } catch (e) {
      console.error('Error initializing MQTT client:', e);
      this.healthState.mqttBroker = 'DISCONNECTED';
      this.notifyHealth();
    }
  }

  public disconnectMqtt() {
    if (this.mqttClient) {
      try {
        this.mqttClient.end(true);
      } catch (e) {
        // ignore
      }
      this.mqttClient = null;
    }
    this.isConnectedToMqtt = false;
    this.healthState.mqttBroker = 'DISCONNECTED';
    this.notifyHealth();
  }

  public handleIncomingRawPayload(topic: string, data: any) {
    this.lastHeartbeat = Date.now();
    this.healthState.esp32 = 'CONNECTED';

    if (topic.endsWith('/status')) {
      const isOnline = data === 'online' || data.status === 'online';
      this.healthState.esp32 = isOnline ? 'CONNECTED' : 'OFFLINE';
      this.logSerial(`[STATUS] Device reported: ${isOnline ? 'ONLINE' : 'OFFLINE (LWT)'}`, isOnline ? 'INFO' : 'ERROR');
      this.notifyAlert({
        id: `status-${Date.now()}`,
        type: isOnline ? 'SUCCESS' : 'CRITICAL',
        title: isOnline ? 'Device Status: ONLINE' : 'Device Status: OFFLINE (LWT)',
        message: isOnline ? 'ESP32 heartbeat validated.' : 'Last Will and Testament received. Controller disconnected.',
        timestamp: new Date().toLocaleTimeString()
      });
      this.notifyHealth();
      return;
    }

    if (topic.endsWith('/events')) {
      const eventKind = data.kind || 'STATE_TRANSITION';
      const eventDetail = data.detail || JSON.stringify(data);
      this.logSerial(`[EVENT] ${eventKind}: ${eventDetail}`, 'EVENT');
      this.notifyAlert({
        id: `event-${Date.now()}-${Math.random()}`,
        type: eventKind.includes('WARN') || eventKind.includes('LOCKOUT') ? 'WARNING' : 'INFO',
        title: `ESP32 Event: ${eventKind}`,
        message: eventDetail,
        timestamp: new Date().toLocaleTimeString()
      });
      return;
    }

    let soil = this.currentState.soilMoisture;
    if (typeof data.soil_pct === 'number') soil = data.soil_pct;
    else if (typeof data.soilMoisture === 'number') soil = data.soilMoisture;

    let tank = this.currentState.tankLevel;
    if (typeof data.tank_pct === 'number') tank = data.tank_pct;
    else if (typeof data.tankLevel === 'number') tank = data.tankLevel;

    let temp = this.currentState.temperature;
    if (typeof data.temp_c === 'number') temp = data.temp_c;
    else if (typeof data.temperature === 'number') temp = data.temperature;

    let humidity = this.currentState.humidity;
    if (typeof data.humidity_pct === 'number') humidity = data.humidity_pct;
    else if (typeof data.humidity === 'number') humidity = data.humidity;

    let mode: 'AUTO' | 'MANUAL' = this.currentState.mode;
    if (data.mode === 'AUTO' || data.mode === 'MANUAL') mode = data.mode;

    let manualReq = this.currentState.manualRequest;
    if (typeof data.manual_request === 'boolean') manualReq = data.manual_request;

    const decision = evaluateIrrigationLogic(
      soil, 
      tank, 
      mode, 
      manualReq,
      this.currentState.pumpStatus,
      this.currentState.lowTankWarning
    );

    let pumpStatus = decision.pumpOn;
    if (typeof data.pump === 'string') {
      pumpStatus = data.pump === 'ON';
    } else if (typeof data.pumpStatus === 'boolean') {
      pumpStatus = data.pumpStatus;
    }

    const prevPump = this.currentState.pumpStatus;
    const prevLockout = this.currentState.lowTankWarning;

    this.currentState = {
      soilMoisture: Number(soil.toFixed(1)),
      tankLevel: Number(tank.toFixed(1)),
      temperature: temp !== null && !isNaN(temp) ? Number(temp.toFixed(1)) : 24.0,
      humidity: humidity !== null && !isNaN(humidity) ? Number(humidity.toFixed(1)) : 50.0,
      pumpStatus,
      lowTankWarning: decision.lowTankWarning || Boolean(data.tank_lockout),
      systemStatus: decision.systemStatus,
      mode,
      manualRequest: manualReq,
      sdOk: data.sd_ok !== undefined ? Boolean(data.sd_ok) : true,
      dhtOk: data.dht_ok !== undefined ? Boolean(data.dht_ok) : true,
      uptimeMs: data.uptime_ms || (this.currentState.uptimeMs + 3000),
      timestamp: new Date().toLocaleTimeString(),
      source: 'live-mqtt',
      isStale: false,
      freshnessSeconds: 0
    };

    this.updatePumpTracking(prevPump, pumpStatus);

    this.logSerial(
      `[TELEMETRY] soil=${soil.toFixed(1)}% tank=${tank.toFixed(1)}% temp=${temp !== null ? temp.toFixed(1) : 'NA'}C hum=${humidity !== null ? humidity.toFixed(1) : 'NA'}% pump=${pumpStatus ? 'ON' : 'OFF'} mode=${mode}`,
      'TELEMETRY'
    );

    this.logSdRow({
      elapsedMs: this.currentState.uptimeMs,
      recordType: 'TELEMETRY',
      detail: 'Periodic MQTT packet',
      soilPct: this.currentState.soilMoisture,
      tankPct: this.currentState.tankLevel,
      tempC: this.currentState.temperature,
      humidityPct: this.currentState.humidity,
      mode: this.currentState.mode,
      pump: pumpStatus ? 'ON' : 'OFF',
      tankState: decision.tankLockout ? 'LOCKOUT' : 'OK'
    });

    if (!prevPump && pumpStatus) {
      this.notifyAlert({
        id: `pump-on-${Date.now()}`,
        type: 'INFO',
        title: 'Irrigation Activated',
        message: `Soil <= 30% (${soil.toFixed(1)}%). Relay closed. Pump running until 45% target.`,
        timestamp: new Date().toLocaleTimeString()
      });
    } else if (prevPump && !pumpStatus) {
      this.notifyAlert({
        id: `pump-off-${Date.now()}`,
        type: 'SUCCESS',
        title: 'Irrigation Stopped',
        message: decision.tankLockout 
          ? `Pump halted: Low water tank lockout (<15%).` 
          : `Target moisture reached (>= 45%). Pump returned to standby.`,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    if (!prevLockout && decision.lowTankWarning) {
      this.notifyAlert({
        id: `tank-warn-${Date.now()}`,
        type: 'CRITICAL',
        title: 'Low Tank Water Lockout',
        message: `Tank level dropped to ${tank.toFixed(1)}% (<15%). Safety interlock locked out.`,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    this.updateHealthFromState();
    this.notifyTelemetry();
  }

  private startDemoMode() {
    this.stopDemoMode();
    this.currentState.source = 'demo';
    this.lastHeartbeat = Date.now();

    this.logSerial('[BOOT] HYDROSYNC Stage 4 firmware booted. Local control authoritative.', 'INFO');
    this.logSerial('[SD] MicroSD initialized; /hydrosync_log.csv mounted.', 'INFO');
    this.logSerial('[WIFI] Connected to Wokwi-GUEST. IP: 10.0.1.15', 'INFO');
    this.logSerial('[MQTT] Connected to broker.hivemq.com:1883.', 'INFO');

    this.demoInterval = window.setInterval(() => {
      this.lastHeartbeat = Date.now();
      let { soilMoisture, tankLevel, temperature, humidity, mode, manualRequest } = this.currentState;

      if (this.currentState.pumpStatus) {
        soilMoisture = Math.min(100, soilMoisture + 1.25);
        tankLevel = Math.max(0, tankLevel - 0.75);
      } else {
        soilMoisture = Math.max(8, soilMoisture - 0.4);

        if (tankLevel < 20 && Math.random() > 0.4) {
          tankLevel = Math.min(100, tankLevel + 2.5);
        }
      }

      temperature += (Math.random() - 0.49) * 0.15;
      temperature = Math.max(18, Math.min(38, temperature));

      humidity += (Math.random() - 0.5) * 0.3;
      humidity = Math.max(30, Math.min(90, humidity));

      const decision = evaluateIrrigationLogic(
        soilMoisture, 
        tankLevel, 
        mode, 
        manualRequest,
        this.currentState.pumpStatus,
        this.currentState.lowTankWarning
      );

      const prevPump = this.currentState.pumpStatus;
      const prevLockout = this.currentState.lowTankWarning;

      this.currentState = {
        soilMoisture: Number(soilMoisture.toFixed(1)),
        tankLevel: Number(tankLevel.toFixed(1)),
        temperature: Number(temperature.toFixed(1)),
        humidity: Number(humidity.toFixed(1)),
        pumpStatus: decision.pumpOn,
        lowTankWarning: decision.lowTankWarning,
        systemStatus: decision.systemStatus,
        mode,
        manualRequest,
        sdOk: true,
        dhtOk: true,
        uptimeMs: this.currentState.uptimeMs + 2000,
        timestamp: new Date().toLocaleTimeString(),
        source: 'demo',
        isStale: false,
        freshnessSeconds: 0
      };

      this.updatePumpTracking(prevPump, decision.pumpOn);

      this.logSerial(
        `[TELEMETRY] soil=${soilMoisture.toFixed(1)}% tank=${tankLevel.toFixed(1)}% temp=${temperature.toFixed(1)}C hum=${humidity.toFixed(1)}% pump=${decision.pumpOn ? 'ON' : 'OFF'} mode=${mode}`,
        decision.pumpOn ? 'EVENT' : 'TELEMETRY'
      );

      this.logSdRow({
        elapsedMs: this.currentState.uptimeMs,
        recordType: 'TELEMETRY',
        detail: 'Simulated tick',
        soilPct: this.currentState.soilMoisture,
        tankPct: this.currentState.tankLevel,
        tempC: this.currentState.temperature,
        humidityPct: this.currentState.humidity,
        mode: this.currentState.mode,
        pump: decision.pumpOn ? 'ON' : 'OFF',
        tankState: decision.tankLockout ? 'LOCKOUT' : 'OK'
      });

      if (!prevPump && decision.pumpOn) {
        this.notifyAlert({
          id: `demo-on-${Date.now()}`,
          type: 'INFO',
          title: 'Irrigation Activated (Demo)',
          message: `Soil <= 30% (${soilMoisture.toFixed(1)}%). Relay energized. Pump running.`,
          timestamp: new Date().toLocaleTimeString()
        });
      } else if (prevPump && !decision.pumpOn) {
        this.notifyAlert({
          id: `demo-off-${Date.now()}`,
          type: 'SUCCESS',
          title: 'Irrigation Stopped (Demo)',
          message: decision.tankLockout 
            ? 'Stopped: Tank level below 15% safety limit.' 
            : 'Stopped: Soil moisture normalized (>= 45%).',
          timestamp: new Date().toLocaleTimeString()
        });
      }

      if (!prevLockout && decision.lowTankWarning) {
        this.notifyAlert({
          id: `demo-lockout-${Date.now()}`,
          type: 'CRITICAL',
          title: 'Low Water Level Alert',
          message: `Tank level (${tankLevel.toFixed(1)}%) is under 15%. Pump protected against dry burn.`,
          timestamp: new Date().toLocaleTimeString()
        });
      }

      this.updateHealthFromState();
      this.notifyTelemetry();
    }, 2000);
  }

  private stopDemoMode() {
    if (this.demoInterval !== null) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private updatePumpTracking(prevPump: boolean, currentPump: boolean) {
    if (!prevPump && currentPump) {
      this.pumpStartTime = Date.now();
      this.waterMetrics.todayCyclesCompleted++;
      this.waterMetrics.currentFlowRateLpm = 1.8;
    } else if (prevPump && !currentPump) {
      if (this.pumpStartTime) {
        const duration = Date.now() - this.pumpStartTime;
        this.waterMetrics.totalPumpActiveMs += duration;
        this.waterMetrics.totalWaterPumpedLitres += (duration / 1000) * 0.03; // ~1.8 L/min
      }
      this.pumpStartTime = null;
      this.waterMetrics.currentFlowRateLpm = 0;
    } else if (currentPump && this.pumpStartTime) {
      this.waterMetrics.totalPumpActiveMs += 2000;
      this.waterMetrics.totalWaterPumpedLitres += 2 * 0.03;
      this.waterMetrics.currentFlowRateLpm = 1.8;
    }

    this.waterMetrics.totalWaterPumpedLitres = Number(this.waterMetrics.totalWaterPumpedLitres.toFixed(2));
    this.listeners.forEach(l => l.onWaterMetricsUpdate && l.onWaterMetricsUpdate({ ...this.waterMetrics }));
  }

  private startStaleChecker() {
    this.staleCheckInterval = window.setInterval(() => {
      const ageSeconds = Math.floor((Date.now() - this.lastHeartbeat) / 1000);
      const isStale = ageSeconds > STALE_AFTER_SECONDS;

      if (this.currentState.isStale !== isStale || this.currentState.freshnessSeconds !== ageSeconds) {
        this.currentState.isStale = isStale;
        this.currentState.freshnessSeconds = ageSeconds;
        
        if (this.mode === 'live-mqtt') {
          this.healthState.esp32 = isStale ? 'DEGRADED' : 'CONNECTED';
          this.notifyHealth();
        }
        this.notifyTelemetry();
      }
    }, 1000);
  }

  private updateHealthFromState() {
    this.healthState.dht22 = this.currentState.dhtOk ? 'HEALTHY' : 'ERROR';
    this.healthState.soilSensor = 'HEALTHY';
    this.healthState.tankSensor = this.currentState.lowTankWarning ? 'LOW_LEVEL' : 'HEALTHY';
    this.healthState.pumpIndicator = this.currentState.lowTankWarning 
      ? 'LOCKOUT' 
      : (this.currentState.pumpStatus ? 'ACTIVE' : 'STANDBY');
    this.healthState.sdLogger = this.currentState.sdOk ? 'LOGGING' : 'UNAVAILABLE';

    if (this.mode === 'live-mqtt') {
      const timeSinceHeartbeat = Date.now() - this.lastHeartbeat;
      this.healthState.esp32 = timeSinceHeartbeat > 20000 ? 'OFFLINE' : (timeSinceHeartbeat > 10000 ? 'DEGRADED' : 'CONNECTED');
    } else {
      this.healthState.esp32 = 'CONNECTED';
    }

    this.notifyHealth();
  }

  private logSerial(raw: string, type: SerialLogMessage['type'] = 'INFO') {
    const msg: SerialLogMessage = {
      id: `serial-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      raw,
      type
    };
    this.listeners.forEach(l => l.onSerialMessage && l.onSerialMessage(msg));
  }

  private logSdRow(row: SdCardLogRow) {
    this.listeners.forEach(l => l.onSdCardRowLogged && l.onSdCardRowLogged(row));
  }

  private getConnectionDetail(): string {
    if (this.mode === 'live-mqtt') {
      return this.isConnectedToMqtt 
        ? `MQTT Live (${DEFAULT_MQTT_TOPIC_ROOT})` 
        : 'Connecting to HiveMQ Broker...';
    }
    if (this.mode === 'testbench') {
      return 'Interactive Digital Twin / Hardware Testbench';
    }
    return 'Realistic Simulated Telemetry (Demo Mode)';
  }

  private notifyTelemetry() {
    const data = { ...this.currentState };
    this.listeners.forEach(l => l.onTelemetry(data));
  }

  private notifyAlert(alert: AlertItem) {
    this.listeners.forEach(l => l.onAlert(alert));
  }

  private notifyHealth() {
    const health = { ...this.healthState };
    this.listeners.forEach(l => l.onHealthUpdate(health));
  }

  private notifyConnectionChange() {
    const mode = this.mode;
    const connected = this.mode === 'live-mqtt' ? this.isConnectedToMqtt : true;
    const detail = this.getConnectionDetail();
    this.listeners.forEach(l => l.onConnectionChange(mode, connected, detail));
  }
}

export const sensorService = new SensorService();
