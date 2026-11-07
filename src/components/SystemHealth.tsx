import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Wifi, 
  HardDrive, 
  Cpu, 
  ShieldCheck, 
  ShieldAlert, 
  Activity,
  Layers
} from 'lucide-react';
import { SystemHealthStatus, TelemetryData } from '../types/telemetry';

interface SystemHealthProps {
  health: SystemHealthStatus;
  telemetry: TelemetryData;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ health, telemetry }) => {
  const isTankLocked = telemetry.lowTankWarning;

  return (
    <div className="bg-[#111A17] border border-[#1C2D27] rounded-2xl p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1C2D27]">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#7F9E96]">
            Hardware Diagnostics
          </span>
          <h3 className="text-lg font-semibold text-[#E6F2EE] mt-0.5">
            System Health &amp; Storage
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          <span className="text-xs font-mono font-medium text-[#10B981]">
            SUBSYSTEMS NOMINAL
          </span>
        </div>
      </div>

      {/* Diagnostic Rows */}
      <div className="space-y-3.5 mt-5 font-mono text-xs">
        
        {/* Tank Interlock */}
        <div className="flex items-center justify-between py-2 border-b border-[#1C2D27]/60">
          <div className="flex items-center gap-2.5">
            {isTankLocked ? (
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            )}
            <span className="text-[#E6F2EE]">Tank Interlock (GPIO35)</span>
          </div>
          <span className={`font-semibold ${isTankLocked ? 'text-rose-400' : 'text-[#10B981]'}`}>
            {isTankLocked ? 'LOCKOUT (<15%)' : 'NORMAL'}
          </span>
        </div>

        {/* SD Card Logger */}
        <div className="flex items-center justify-between py-2 border-b border-[#1C2D27]/60">
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-4 h-4 text-[#06B6D4]" />
            <span className="text-[#E6F2EE]">MicroSD CSV Logger (SPI GPIO5)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#7F9E96]">/hydrosync_log.csv</span>
            <span className="font-semibold text-[#10B981]">AVAILABLE</span>
          </div>
        </div>

        {/* DHT22 Sensor */}
        <div className="flex items-center justify-between py-2 border-b border-[#1C2D27]/60">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-amber-400" />
            <span className="text-[#E6F2EE]">DHT22 Temp &amp; Hum (GPIO15)</span>
          </div>
          <span className={`font-semibold ${telemetry.dhtOk ? 'text-[#10B981]' : 'text-rose-400'}`}>
            {telemetry.dhtOk ? 'HEALTHY' : 'READ ERROR'}
          </span>
        </div>

        {/* Soil Moisture ADC */}
        <div className="flex items-center justify-between py-2 border-b border-[#1C2D27]/60">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-[#10B981]" />
            <span className="text-[#E6F2EE]">Soil Moisture Capacitive (GPIO34)</span>
          </div>
          <span className="font-semibold text-[#10B981]">
            CALIBRATED (12-bit ADC)
          </span>
        </div>

        {/* Pump Relay & Indicator LED */}
        <div className="flex items-center justify-between py-2 border-b border-[#1C2D27]/60">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-[#10B981]" />
            <span className="text-[#E6F2EE]">Pump Relay &amp; Indicator (GPIO22/25)</span>
          </div>
          <span className={`font-semibold ${telemetry.pumpStatus ? 'text-[#10B981]' : 'text-[#7F9E96]'}`}>
            {telemetry.pumpStatus ? 'ENERGIZED (ON)' : 'STANDBY (OFF)'}
          </span>
        </div>

        {/* Wi-Fi & MQTT Broker */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2.5">
            <Wifi className="w-4 h-4 text-[#06B6D4]" />
            <span className="text-[#E6F2EE]">Wi-Fi &amp; MQTT Telemetry (HiveMQ)</span>
          </div>
          <span className="font-semibold text-[#06B6D4]">
            {health.mqttBroker === 'CONNECTED' 
              ? 'DEVICE + BROKER ONLINE' 
              : (health.mqttBroker === 'CONNECTING' ? 'CONNECTING...' : 'STANDBY READY')}
          </span>
        </div>

      </div>

      {/* Firmware & Hardware Spec Footnote */}
      <div className="mt-5 pt-4 border-t border-[#1C2D27] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
        <div className="p-2 rounded-lg bg-[#0B0F0E]">
          <span className="text-[10px] text-[#7F9E96] uppercase block">Uptime</span>
          <span className="text-xs font-semibold text-[#E6F2EE]">
            {Math.floor(telemetry.uptimeMs / 60000)}m {Math.floor((telemetry.uptimeMs % 60000) / 1000)}s
          </span>
        </div>
        <div className="p-2 rounded-lg bg-[#0B0F0E]">
          <span className="text-[10px] text-[#7F9E96] uppercase block">MCU</span>
          <span className="text-xs font-semibold text-[#E6F2EE]">ESP32-WROOM</span>
        </div>
        <div className="p-2 rounded-lg bg-[#0B0F0E]">
          <span className="text-[10px] text-[#7F9E96] uppercase block">Sampling Rate</span>
          <span className="text-xs font-semibold text-[#E6F2EE]">2.5s DHT / 5s CSV</span>
        </div>
        <div className="p-2 rounded-lg bg-[#0B0F0E]">
          <span className="text-[10px] text-[#7F9E96] uppercase block">Interlock</span>
          <span className={`text-xs font-semibold ${isTankLocked ? 'text-rose-400' : 'text-[#10B981]'}`}>
            {isTankLocked ? 'TRIPPED' : 'ARMED'}
          </span>
        </div>
      </div>

    </div>
  );
};
