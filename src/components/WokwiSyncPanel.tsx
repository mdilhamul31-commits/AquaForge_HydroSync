import React, { useState } from 'react';
import { 
  Cpu, 
  Radio, 
  ExternalLink, 
  RefreshCw, 
  Sliders, 
  Zap, 
  ShieldCheck, 
  ShieldAlert, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Check,
  Power,
  HardDrive,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  WifiOff
} from 'lucide-react';
import { TelemetryData, SystemHealthStatus } from '../types/telemetry';
import { ConnectionMode, WOKWI_PROJECT_URL, WOKWI_PROJECT_ID, DEFAULT_MQTT_BROKER_WSS, DEFAULT_MQTT_TOPIC_ROOT } from '../services/sensorService';
import { WokwiWifiFixModal } from './WokwiWifiFixModal';

interface WokwiSyncPanelProps {
  telemetry: TelemetryData;
  health: SystemHealthStatus;
  connectionMode: ConnectionMode;
  isLiveConnected: boolean;
  onModeSwitch: (mode: ConnectionMode) => void;
  onUpdateTestbench: (values: Partial<TelemetryData>) => void;
}

export const WokwiSyncPanel: React.FC<WokwiSyncPanelProps> = ({
  telemetry,
  health,
  connectionMode,
  isLiveConnected,
  onModeSwitch,
  onUpdateTestbench
}) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [copiedTopic, setCopiedTopic] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handleCopyTopic = () => {
    navigator.clipboard.writeText(`${DEFAULT_MQTT_TOPIC_ROOT}/telemetry`);
    setCopiedTopic(true);
    setTimeout(() => setCopiedTopic(false), 2000);
  };

  const reloadIframe = () => {
    setIframeKey(prev => prev + 1);
  };

  const applyPreset = (name: string, values: Partial<TelemetryData>) => {
    setActivePreset(name);
    onUpdateTestbench(values);
    setTimeout(() => setActivePreset(null), 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Real-time Wokwi Live Link & MQTT Gateway */}
      <div className="bg-[#111A17] border border-[#1C2D27] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#1C2D27]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#06B6D4]">
                Wokwi ESP32 Direct Sync
              </span>
              <span className="text-xs text-[#526E67]">·</span>
              <span className="text-xs font-mono text-[#7F9E96]">
                Project #{WOKWI_PROJECT_ID}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#E6F2EE] mt-0.5">
              Live Hardware Simulation &amp; Physical Component Telemetry
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onModeSwitch('live-mqtt')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
                connectionMode === 'live-mqtt'
                  ? 'bg-[#06B6D4] text-[#0B0F0E] shadow-lg shadow-[#06B6D4]/20'
                  : 'bg-[#16221E] text-[#7F9E96] hover:text-[#E6F2EE] border border-[#1C2D27]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{isLiveConnected ? 'MQTT CONNECTED' : 'CONNECT LIVE MQTT'}</span>
            </button>

            <button
              onClick={reloadIframe}
              className="p-1.5 rounded-lg bg-[#16221E] text-[#7F9E96] hover:text-[#E6F2EE] border border-[#1C2D27] transition-colors"
              title="Reload Wokwi Simulation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <a
              href={WOKWI_PROJECT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#16221E] text-[#E6F2EE] hover:bg-[#1F332C] text-xs font-mono border border-[#1C2D27] flex items-center gap-1.5 transition-colors"
            >
              <span>Open in Wokwi</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Sync Status Info Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 font-mono text-xs">
          <div className="p-3 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
            <span className="text-[#7F9E96] block text-[11px]">Broker Address</span>
            <span className="text-[#06B6D4] font-semibold truncate block mt-0.5">
              {DEFAULT_MQTT_BROKER_WSS}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
            <div className="flex items-center justify-between">
              <span className="text-[#7F9E96] text-[11px]">Telemetry Topic</span>
              <button 
                onClick={handleCopyTopic} 
                className="text-[#7F9E96] hover:text-[#E6F2EE] flex items-center gap-1 text-[10px]"
              >
                {copiedTopic ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTopic ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <span className="text-[#10B981] font-semibold truncate block mt-0.5">
              {DEFAULT_MQTT_TOPIC_ROOT}/telemetry
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
            <span className="text-[#7F9E96] block text-[11px]">Simulation Sync State</span>
            <span className={`font-semibold block mt-0.5 ${
              isLiveConnected ? 'text-[#10B981]' : 'text-amber-400'
            }`}>
              {isLiveConnected ? 'REAL-TIME DATA STREAMING' : 'READY TO STREAM (CLICK PLAY IN WOKWI)'}
            </span>
          </div>
        </div>
      </div>

      {/* Physical Hardware Circuit State Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        
        {/* Component 1: Green Pump LED (GPIO25) */}
        <div className="p-4 rounded-xl bg-[#111A17] border border-[#1C2D27] flex items-center gap-3.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
            telemetry.pumpStatus 
              ? 'bg-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.8)] text-[#0B0F0E]' 
              : 'bg-[#16221E] text-[#526E67]'
          }`}>
            <Power className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#7F9E96] block uppercase">Pump Indicator LED</span>
            <span className={`font-bold text-sm ${telemetry.pumpStatus ? 'text-[#10B981]' : 'text-[#526E67]'}`}>
              GPIO25: {telemetry.pumpStatus ? 'ON (GREEN)' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Component 2: Red Tank Warning LED (GPIO26) */}
        <div className={`p-4 rounded-xl bg-[#111A17] border flex items-center gap-3.5 ${
          telemetry.lowTankWarning ? 'border-rose-500/50 shadow-sm shadow-rose-950/40' : 'border-[#1C2D27]'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
            telemetry.lowTankWarning 
              ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.8)] text-white animate-pulse' 
              : 'bg-[#16221E] text-[#526E67]'
          }`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#7F9E96] block uppercase">Tank Warning LED</span>
            <span className={`font-bold text-sm ${telemetry.lowTankWarning ? 'text-rose-400' : 'text-[#526E67]'}`}>
              GPIO26: {telemetry.lowTankWarning ? 'TRIPPED (RED)' : 'ARMED'}
            </span>
          </div>
        </div>

        {/* Component 3: 5V Relay Module (GPIO22) */}
        <div className="p-4 rounded-xl bg-[#111A17] border border-[#1C2D27] flex items-center gap-3.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
            telemetry.pumpStatus
              ? 'bg-[#10B981]/20 border-[#10B981]/50 text-[#10B981]'
              : 'bg-[#16221E] border-[#1C2D27] text-[#526E67]'
          }`}>
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#7F9E96] block uppercase">Relay Module (GPIO22)</span>
            <span className="font-bold text-sm text-[#E6F2EE]">
              {telemetry.pumpStatus ? 'NO CLOSED (ACTIVE)' : 'NC IDLE (STANDBY)'}
            </span>
          </div>
        </div>

        {/* Component 4: Mode Switch (GPIO27) */}
        <div className="p-4 rounded-xl bg-[#111A17] border border-[#1C2D27] flex items-center gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-[#16221E] border border-[#1C2D27] flex items-center justify-center text-[#06B6D4] shrink-0">
            {telemetry.mode === 'AUTO' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5 text-amber-400" />}
          </div>
          <div>
            <span className="text-[10px] text-[#7F9E96] block uppercase">Mode Switch (GPIO27)</span>
            <span className={`font-bold text-sm ${telemetry.mode === 'AUTO' ? 'text-[#06B6D4]' : 'text-amber-400'}`}>
              {telemetry.mode} MODE
            </span>
          </div>
        </div>

      </div>

      {/* Main Split Layout: Embedded Wokwi Simulation + Interactive Hardware Twin */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Embedded Wokwi Simulation iFrame (7 cols) */}
        <div className="lg:col-span-7 bg-[#111A17] border border-[#1C2D27] rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#1C2D27] bg-[#0E1513] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#06B6D4]" />
              <span className="text-xs font-mono font-semibold text-[#E6F2EE]">
                Wokwi ESP32 Circuit Simulation View
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#7F9E96]">
              Press ▶ Play in simulator to boot ESP32
            </span>
          </div>

          <div className="relative w-full h-[620px] bg-[#000]">
            <iframe
              key={iframeKey}
              src={`https://wokwi.com/projects/${WOKWI_PROJECT_ID}`}
              title="Wokwi ESP32 Simulation"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>

          <div className="p-3.5 bg-[#0E1513] border-t border-[#1C2D27] flex items-center justify-between text-xs text-[#7F9E96] font-mono">
            <span>Soil ADC GPIO34 | Tank ADC GPIO35 | DHT22 GPIO15 | Relay GPIO22</span>
            <span className="text-[#10B981]">115200 Baud UART Telemetry</span>
          </div>
        </div>

        {/* Right Column: Hardware Digital Twin & Live Override Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Hardware State Presets */}
          <div className="bg-[#111A17] border border-[#1C2D27] rounded-2xl p-5 font-mono">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1C2D27]">
              <span className="text-xs font-bold text-[#E6F2EE] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Simulation Quick Presets</span>
              </span>
              <span className="text-[10px] text-[#526E67]">Stage 4 States</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => applyPreset('dry', { soilMoisture: 24.0, tankLevel: 70.0, mode: 'AUTO' })}
                className="p-2.5 rounded-lg bg-[#16221E] hover:bg-[#1F332C] border border-[#1C2D27] text-left transition-colors"
              >
                <span className="text-rose-400 font-bold block text-[11px]">1. Dry Soil (&lt;= 30%)</span>
                <span className="text-[#7F9E96] text-[10px]">Triggers Pump ON</span>
              </button>

              <button
                onClick={() => applyPreset('cutoff', { soilMoisture: 48.0, tankLevel: 70.0, mode: 'AUTO' })}
                className="p-2.5 rounded-lg bg-[#16221E] hover:bg-[#1F332C] border border-[#1C2D27] text-left transition-colors"
              >
                <span className="text-[#10B981] font-bold block text-[11px]">2. Target Reached (&gt;= 45%)</span>
                <span className="text-[#7F9E96] text-[10px]">Hysteresis Pump OFF</span>
              </button>

              <button
                onClick={() => applyPreset('lockout', { soilMoisture: 20.0, tankLevel: 10.0, mode: 'AUTO' })}
                className="p-2.5 rounded-lg bg-[#16221E] hover:bg-[#1F332C] border border-[#1C2D27] text-left transition-colors"
              >
                <span className="text-rose-400 font-bold block text-[11px]">3. Low Tank (&lt; 15%)</span>
                <span className="text-[#7F9E96] text-[10px]">Safety Lockout Armed</span>
              </button>

              <button
                onClick={() => applyPreset('recovery', { soilMoisture: 20.0, tankLevel: 25.0, mode: 'AUTO' })}
                className="p-2.5 rounded-lg bg-[#16221E] hover:bg-[#1F332C] border border-[#1C2D27] text-left transition-colors"
              >
                <span className="text-[#06B6D4] font-bold block text-[11px]">4. Tank Refilled (&gt;= 20%)</span>
                <span className="text-[#7F9E96] text-[10px]">Anti-Chatter Recovery</span>
              </button>
            </div>
          </div>

          {/* Hardware Digital Twin Testbench */}
          <div className="bg-[#111A17] border border-[#1C2D27] rounded-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C2D27]">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                  Interactive Testbench
                </span>
                <h3 className="text-base font-bold text-[#E6F2EE] mt-0.5">
                  Hardware Potentiometers &amp; Switches
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 font-mono border border-amber-500/30">
                TWIN MODE
              </span>
            </div>

            {/* Controls */}
            <div className="space-y-4 mt-4">
              
              {/* Soil Moisture Slider */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                  <span className="text-[#E6F2EE] font-medium flex items-center gap-1.5">
                    <span>Soil Moisture (GPIO34)</span>
                  </span>
                  <span className={`font-bold ${telemetry.soilMoisture <= 30 ? 'text-rose-400' : 'text-[#10B981]'}`}>
                    {telemetry.soilMoisture.toFixed(1)}% {telemetry.soilMoisture <= 30 ? '(DRY - ON)' : '(MOIST - OFF)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={telemetry.soilMoisture}
                  onChange={(e) => onUpdateTestbench({ soilMoisture: parseFloat(e.target.value) })}
                  className="w-full accent-[#10B981] bg-[#16221E] h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#526E67] mt-1">
                  <span>0% (Dry)</span>
                  <span className="text-rose-400">30% (ON limit)</span>
                  <span className="text-[#10B981]">45% (OFF cutoff)</span>
                  <span>100% (Saturated)</span>
                </div>
              </div>

              {/* Water Tank Level Slider */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                  <span className="text-[#E6F2EE] font-medium">
                    Water Tank Level (GPIO35)
                  </span>
                  <span className={`font-bold ${telemetry.tankLevel < 15 ? 'text-rose-400' : 'text-[#06B6D4]'}`}>
                    {telemetry.tankLevel.toFixed(1)}% {telemetry.tankLevel < 15 ? '(LOCKOUT)' : '(SUFFICIENT)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={telemetry.tankLevel}
                  onChange={(e) => onUpdateTestbench({ tankLevel: parseFloat(e.target.value) })}
                  className="w-full accent-[#06B6D4] bg-[#16221E] h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#526E67] mt-1">
                  <span>0% (Empty)</span>
                  <span className="text-rose-400">15% (Trip limit)</span>
                  <span className="text-[#06B6D4]">20% (Recovery)</span>
                  <span>100% (Full)</span>
                </div>
              </div>

              {/* Temperature Slider */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                  <span className="text-[#E6F2EE] font-medium">
                    DHT22 Temperature (GPIO15)
                  </span>
                  <span className="font-bold text-amber-400">
                    {telemetry.temperature.toFixed(1)} °C
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="45"
                  step="0.5"
                  value={telemetry.temperature}
                  onChange={(e) => onUpdateTestbench({ temperature: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 bg-[#16221E] h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Mode Switch & Manual Override */}
              <div className="pt-3 border-t border-[#1C2D27] grid grid-cols-2 gap-3">
                <button
                  onClick={() => onUpdateTestbench({ mode: telemetry.mode === 'AUTO' ? 'MANUAL' : 'AUTO' })}
                  className={`p-3 rounded-xl border text-xs font-mono font-semibold transition-colors text-left ${
                    telemetry.mode === 'AUTO'
                      ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  <span className="text-[10px] text-[#7F9E96] block uppercase">Mode Switch (GPIO27)</span>
                  <span className="text-sm mt-0.5 block">{telemetry.mode}</span>
                </button>

                <button
                  disabled={telemetry.mode === 'AUTO'}
                  onClick={() => onUpdateTestbench({ manualRequest: !telemetry.manualRequest })}
                  className={`p-3 rounded-xl border text-xs font-mono font-semibold transition-colors text-left ${
                    telemetry.mode === 'AUTO'
                      ? 'opacity-40 cursor-not-allowed bg-[#0B0F0E] border-[#1C2D27] text-[#7F9E96]'
                      : (telemetry.manualRequest
                        ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40'
                        : 'bg-[#16221E] text-[#7F9E96] border-[#1C2D27]')
                  }`}
                >
                  <span className="text-[10px] text-[#7F9E96] block uppercase">Manual Override (GPIO14)</span>
                  <span className="text-sm mt-0.5 block">
                    {telemetry.mode === 'AUTO' ? 'AUTO LOCKED' : (telemetry.manualRequest ? 'PUMP RUN' : 'PUMP STOP')}
                  </span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Embedded Wi-Fi Disconnect Diagnostic and Drop-in C++ Fix */}
      <WokwiWifiFixModal />

    </div>
  );
};
