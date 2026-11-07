/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSensorData } from './hooks/useSensorData';
import { Header } from './components/Header';
import { SensorCards } from './components/SensorCard';
import { IrrigationPanel } from './components/IrrigationPanel';
import { Analytics } from './components/Analytics';
import { SystemHealth } from './components/SystemHealth';
import { AlertPanel } from './components/AlertPanel';
import { WokwiSyncPanel } from './components/WokwiSyncPanel';
import { FieldRoverGrid } from './components/FieldRoverModal';
import { CadViewerModal } from './components/CadViewerModal';
import { GithubSpecsPanel } from './components/GithubSpecsPanel';
import { SerialMonitor } from './components/SerialMonitor';
import { WaterMetrics } from './components/WaterMetrics';
import { MicroSdViewer } from './components/MicroSdViewer';
import { WokwiWifiFixModal } from './components/WokwiWifiFixModal';
import { GITHUB_REPO_URL, WOKWI_PROJECT_ID } from './services/sensorService';
import { 
  Radio, 
  AlertTriangle, 
  Cpu, 
  Droplets, 
  Info, 
  Github, 
  ExternalLink,
  Terminal,
  HardDrive,
  Layout,
  Maximize2,
  Minimize2,
  RefreshCw,
  Power,
  WifiOff,
  HelpCircle,
  X
} from 'lucide-react';

export default function App() {
  const {
    telemetry,
    history,
    allHistoryCount,
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
    exportCsv
  } = useSensorData();

  const [activeTab, setActiveTab] = useState<'overview' | 'wokwi' | 'rover' | 'cad' | 'specs' | 'sdcard'>('overview');
  const [showEmbeddedWokwiInDashboard, setShowEmbeddedWokwiInDashboard] = useState(true);
  const [wokwiIframeKey, setWokwiIframeKey] = useState(0);
  const [showWifiFixModal, setShowWifiFixModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F0E] text-[#E6F2EE] flex flex-col font-sans selection:bg-[#10B981]/30 selection:text-[#10B981]">
      
      {/* Top Application Header */}
      <Header
        telemetry={telemetry}
        health={health}
        connectionMode={connectionMode}
        isLiveConnected={isLiveConnected}
        activeTab={activeTab === 'sdcard' ? 'specs' : activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onModeSwitch={switchMode}
        onExportCsv={exportCsv}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* Connection Notice / Telemetry Mode Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#111A17] border border-[#1C2D27] text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${
              telemetry.isStale
                ? 'bg-amber-400 animate-ping'
                : (connectionMode === 'live-mqtt'
                  ? (isLiveConnected ? 'bg-[#10B981] animate-pulse' : 'bg-amber-400 animate-ping')
                  : (connectionMode === 'demo' ? 'bg-[#10B981]' : 'bg-amber-500'))
            }`} />
            <span className="text-[#7F9E96]">Data Channel:</span>
            <span className="font-semibold text-[#E6F2EE]">{connectionDetail}</span>
            {telemetry.isStale && (
              <span className="text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/40">
                STALE ({telemetry.freshnessSeconds}s &gt; 20s)
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[#7F9E96]">
            {/* Wi-Fi Troubleshooting Button */}
            <button
              onClick={() => setShowWifiFixModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 transition-all font-semibold"
              title="Fix Wokwi 'Wi-Fi disconnected' error"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span>Wokwi Wi-Fi Reconnect Fix</span>
            </button>

            {connectionMode === 'demo' && (
              <span className="text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30">
                Stage 4 Hysteresis Engine (30% ON $\rightarrow$ 45% OFF)
              </span>
            )}
            {connectionMode === 'live-mqtt' && (
              <span className="text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-0.5 rounded border border-[#06B6D4]/30">
                Topic: aquaforge/hydrosync/aqua5-479928426260819969/#
              </span>
            )}
            <span className="text-[#526E67]">·</span>
            <span>Uptime: {Math.floor(telemetry.uptimeMs / 1000)}s</span>
          </div>
        </div>

        {/* Modal Popup for Wi-Fi Reconnect Diagnostic */}
        {showWifiFixModal && (
          <div className="relative">
            <div className="absolute right-3 top-3 z-10">
              <button
                onClick={() => setShowWifiFixModal(false)}
                className="p-1.5 rounded-lg bg-[#16221E] text-[#7F9E96] hover:text-[#E6F2EE] border border-[#1C2D27]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <WokwiWifiFixModal />
          </div>
        )}

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Sub-header text & Dashboard Toolbar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#10B981] block">
                    SMART IRRIGATION · REMOTE OBSERVABILITY
                  </span>
                  <span className="text-[#526E67] text-xs">·</span>
                  <span className="text-xs font-mono text-[#06B6D4]">Stage 4 Controller</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#E6F2EE] tracking-tight mt-1">
                  System overview
                </h1>
                <p className="text-xs text-[#7F9E96] mt-0.5">
                  Live telemetry from your HYDROSYNC controller synchronized with Wokwi ESP32 simulation.
                </p>
              </div>

              {/* View Layout Switcher & Simulation Toggle */}
              <div className="flex items-center gap-2.5 font-mono text-xs">
                <button
                  onClick={() => setShowEmbeddedWokwiInDashboard(!showEmbeddedWokwiInDashboard)}
                  className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all font-semibold ${
                    showEmbeddedWokwiInDashboard 
                      ? 'bg-[#06B6D4]/20 border-[#06B6D4]/50 text-[#06B6D4]' 
                      : 'bg-[#111A17] border-[#1C2D27] text-[#7F9E96] hover:text-[#E6F2EE]'
                  }`}
                  title="Toggle Direct Wokwi Simulation Cockpit"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{showEmbeddedWokwiInDashboard ? 'WOKWI SIMULATION VISIBLE' : 'SHOW WOKWI SIMULATION'}</span>
                </button>

                <div className="p-1 rounded-lg bg-[#111A17] border border-[#1C2D27] text-right shrink-0">
                  <span className="text-[10px] text-[#526E67] uppercase block">Last Update</span>
                  <span className="text-[#10B981] font-semibold">{telemetry.timestamp}</span>
                </div>
              </div>
            </div>

            {/* DIRECT WOKWI SIMULATION & LIVE COCKPIT INTEGRATION */}
            {showEmbeddedWokwiInDashboard && (
              <div className="bg-[#111A17] border border-[#1C2D27] rounded-2xl p-5 overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1C2D27]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/15 border border-[#06B6D4]/30 flex items-center justify-center text-[#06B6D4]">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#E6F2EE]">
                          Live Wokwi ESP32 Simulation Cockpit
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] font-mono border border-[#10B981]/30">
                          SYNCED TO DASHBOARD
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#7F9E96]">
                        Click ▶ Play inside Wokwi simulator to boot and turn potentiometers. All readings update below in real time.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setWokwiIframeKey(k => k + 1)}
                      className="p-1.5 rounded-lg bg-[#16221E] text-[#7F9E96] hover:text-[#E6F2EE] border border-[#1C2D27] transition-colors"
                      title="Reload simulation frame"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveTab('wokwi')}
                      className="px-2.5 py-1 rounded-lg bg-[#16221E] text-[#06B6D4] hover:bg-[#1F332C] text-xs font-mono border border-[#1C2D27] transition-colors"
                    >
                      Full Sim View
                    </button>
                  </div>
                </div>

                {/* Embedded Simulation & Quick Hardware Controls Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 my-3">
                  
                  {/* Left: Embedded Simulation Iframe (7 cols) */}
                  <div className="lg:col-span-7 relative h-[440px] rounded-xl overflow-hidden bg-black border border-[#1C2D27]">
                    <iframe
                      key={wokwiIframeKey}
                      src={`https://wokwi.com/projects/${WOKWI_PROJECT_ID}`}
                      title="Direct Synced Wokwi Simulation"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    />
                  </div>

                  {/* Right: Direct Hardware Controls & Hydraulic Status (5 cols) */}
                  <div className="lg:col-span-5 bg-[#0B0F0E] p-4 rounded-xl border border-[#1C2D27] flex flex-col justify-between font-mono text-xs">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-[#1C2D27]">
                        <span className="text-[#06B6D4] font-bold text-xs uppercase flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5" />
                          <span>Hardware Potentiometers</span>
                        </span>
                        <span className="text-[10px] text-[#526E67]">Direct Sync</span>
                      </div>

                      {/* Potentiometer Sliders */}
                      <div className="space-y-3.5 mt-3">
                        {/* Soil Potentiometer */}
                        <div>
                          <div className="flex justify-between items-center text-[11px] mb-1">
                            <span className="text-[#E6F2EE]">Soil Moisture (GPIO34):</span>
                            <span className={`font-bold ${telemetry.soilMoisture <= 30 ? 'text-rose-400' : 'text-[#10B981]'}`}>
                              {telemetry.soilMoisture.toFixed(1)}% {telemetry.soilMoisture <= 30 ? '(<=30% ON)' : '(>=45% OFF)'}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.5"
                            value={telemetry.soilMoisture}
                            onChange={(e) => updateTestbench({ soilMoisture: parseFloat(e.target.value) })}
                            className="w-full accent-[#10B981] bg-[#16221E] h-1.5 rounded cursor-pointer"
                          />
                        </div>

                        {/* Tank Potentiometer */}
                        <div>
                          <div className="flex justify-between items-center text-[11px] mb-1">
                            <span className="text-[#E6F2EE]">Tank Level (GPIO35):</span>
                            <span className={`font-bold ${telemetry.tankLevel < 15 ? 'text-rose-400' : 'text-[#06B6D4]'}`}>
                              {telemetry.tankLevel.toFixed(1)}% {telemetry.tankLevel < 15 ? '(<15% LOCKOUT)' : '(SAFE)'}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.5"
                            value={telemetry.tankLevel}
                            onChange={(e) => updateTestbench({ tankLevel: parseFloat(e.target.value) })}
                            className="w-full accent-[#06B6D4] bg-[#16221E] h-1.5 rounded cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Quick Simulation Presets */}
                      <div className="mt-4 pt-3 border-t border-[#1C2D27]">
                        <span className="text-[10px] uppercase text-[#7F9E96] block mb-2">Test State Presets:</span>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <button
                            onClick={() => updateTestbench({ soilMoisture: 22.0, tankLevel: 75.0, mode: 'AUTO' })}
                            className="p-2 rounded-lg bg-[#16221E] hover:bg-[#1F332C] border border-[#1C2D27] text-left transition-colors"
                          >
                            <span className="text-rose-400 font-bold block">1. Dry Soil (22%)</span>
                            <span className="text-[#526E67] text-[9px]">Starts pump</span>
                          </button>
                          <button
                            onClick={() => updateTestbench({ soilMoisture: 50.0, tankLevel: 75.0, mode: 'AUTO' })}
                            className="p-2 rounded-lg bg-[#16221E] hover:bg-[#1F332C] border border-[#1C2D27] text-left transition-colors"
                          >
                            <span className="text-[#10B981] font-bold block">2. Moist (50%)</span>
                            <span className="text-[#526E67] text-[9px]">Stops pump</span>
                          </button>
                          <button
                            onClick={() => updateTestbench({ soilMoisture: 20.0, tankLevel: 10.0, mode: 'AUTO' })}
                            className="p-2 rounded-lg bg-[#16221E] hover:bg-[#1F332C] border border-[#1C2D27] text-left transition-colors"
                          >
                            <span className="text-rose-400 font-bold block">3. Empty Tank (10%)</span>
                            <span className="text-[#526E67] text-[9px]">Trips lockout</span>
                          </button>
                          <button
                            onClick={() => updateTestbench({ soilMoisture: 20.0, tankLevel: 25.0, mode: 'AUTO' })}
                            className="p-2 rounded-lg bg-[#16221E] hover:bg-[#1F332C] border border-[#1C2D27] text-left transition-colors"
                          >
                            <span className="text-[#06B6D4] font-bold block">4. Refill (25%)</span>
                            <span className="text-[#526E67] text-[9px]">Resets lockout</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Animated Hydraulic Flow Pipeline Status */}
                    <div className="mt-3 p-3 rounded-lg bg-[#16221E]/60 border border-[#1C2D27] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className={`w-4 h-4 ${telemetry.pumpStatus ? 'text-[#10B981] animate-bounce' : 'text-[#526E67]'}`} />
                        <div>
                          <span className="text-[11px] text-[#E6F2EE] font-bold block">
                            {telemetry.pumpStatus ? 'Water Line Active' : 'Water Line Idle'}
                          </span>
                          <span className="text-[9px] text-[#7F9E96]">
                            {telemetry.pumpStatus ? 'Discharging 1.8 L/min to root zone' : 'Relay contacts open'}
                          </span>
                        </div>
                      </div>

                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        telemetry.pumpStatus
                          ? 'bg-emerald-950 text-[#10B981] border-[#10B981]/40'
                          : 'bg-[#0B0F0E] text-[#526E67] border-[#1C2D27]'
                      }`}>
                        {telemetry.pumpStatus ? 'FLOWING' : 'STATIC'}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Live Synchronized Circuit Output Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-[#0B0F0E] border border-[#1C2D27] flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full ${telemetry.pumpStatus ? 'bg-[#10B981] shadow-[0_0_10px_#10B981]' : 'bg-[#526E67]'}`} />
                    <div>
                      <span className="text-[10px] text-[#7F9E96] block uppercase">Pump LED (GPIO25)</span>
                      <span className={`font-bold ${telemetry.pumpStatus ? 'text-[#10B981]' : 'text-[#7F9E96]'}`}>
                        {telemetry.pumpStatus ? 'ON (ACTIVE)' : 'OFF (STANDBY)'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0B0F0E] border border-[#1C2D27] flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full ${telemetry.lowTankWarning ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-ping' : 'bg-[#526E67]'}`} />
                    <div>
                      <span className="text-[10px] text-[#7F9E96] block uppercase">Tank Warning (GPIO26)</span>
                      <span className={`font-bold ${telemetry.lowTankWarning ? 'text-rose-400' : 'text-[#10B981]'}`}>
                        {telemetry.lowTankWarning ? 'LOCKOUT (<15%)' : 'NORMAL'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0B0F0E] border border-[#1C2D27] flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded bg-[#06B6D4]" />
                    <div>
                      <span className="text-[10px] text-[#7F9E96] block uppercase">Relay Module (GPIO22)</span>
                      <span className="font-bold text-[#E6F2EE]">
                        {telemetry.pumpStatus ? 'NO CLOSED (ACTIVE)' : 'NC OPEN (IDLE)'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0B0F0E] border border-[#1C2D27] flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded bg-amber-400" />
                    <div>
                      <span className="text-[10px] text-[#7F9E96] block uppercase">Mode Switch (GPIO27)</span>
                      <span className="font-bold text-[#E6F2EE]">
                        {telemetry.mode} MODE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* A. 4 Premium Sensor Monitoring Cards */}
            <SensorCards telemetry={telemetry} history={history} />

            {/* Hydraulic Analytics & Water Savings Calculation */}
            <WaterMetrics metrics={waterMetrics} telemetry={telemetry} />

            {/* B. Middle Row: Smart Irrigation Control & System Health Diagnostics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <IrrigationPanel
                  telemetry={telemetry}
                  onToggleManualRequest={() => updateTestbench({ manualRequest: !telemetry.manualRequest })}
                  onToggleMode={() => updateTestbench({ mode: telemetry.mode === 'AUTO' ? 'MANUAL' : 'AUTO' })}
                />
              </div>

              <div className="lg:col-span-5">
                <SystemHealth health={health} telemetry={telemetry} />
              </div>
            </div>

            {/* Real-time Serial Terminal Console */}
            <SerialMonitor logs={serialLogs} onClear={clearSerialLogs} />

            {/* C. Real-time Analytics Trend Line Charts */}
            <Analytics
              history={history}
              timeWindow={timeWindow}
              onTimeWindowChange={setTimeWindow}
              sampleCount={allHistoryCount}
            />

            {/* Virtual MicroSD Card Log Explorer */}
            <MicroSdViewer rows={sdCardRows} onDownloadCsv={exportCsv} />

            {/* D. Recent Events & Notifications Panel */}
            <AlertPanel alerts={alerts} onClear={clearAlerts} />

          </div>
        )}

        {/* TAB 2: WOKWI SIMULATION DIRECT SYNC */}
        {activeTab === 'wokwi' && (
          <WokwiSyncPanel
            telemetry={telemetry}
            health={health}
            connectionMode={connectionMode}
            isLiveConnected={isLiveConnected}
            onModeSwitch={switchMode}
            onUpdateTestbench={updateTestbench}
          />
        )}

        {/* TAB 3: GITHUB SPECS & ACCEPTANCE TEST SUITE */}
        {activeTab === 'specs' && (
          <GithubSpecsPanel telemetry={telemetry} />
        )}

        {/* TAB 4: FIELD ROVER SCAN GRID */}
        {activeTab === 'rover' && (
          <FieldRoverGrid />
        )}

        {/* TAB 5: FUSION 360 CAD SPECIFICATIONS */}
        {activeTab === 'cad' && (
          <CadViewerModal />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#1C2D27] py-6 px-4 lg:px-8 mt-12 bg-[#0E1513]/60 text-xs font-mono text-[#526E67]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[#7F9E96] font-semibold">AQUAFORGE HYDROSYNC</span>
            <span>·</span>
            <span>ESP32 Autonomous Irrigation Platform</span>
            <span>·</span>
            <span className="text-[#10B981]">Stage 4 Observability</span>
          </div>

          <div className="flex items-center gap-4 text-[#7F9E96]">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#10B981] transition-colors flex items-center gap-1.5"
            >
              <Github className="w-3.5 h-3.5" />
              <span>ayankunduixb-pixel / AquaForge-HYDROSYNC...</span>
            </a>
            <span>·</span>
            <span className="text-[#06B6D4]">Wokwi #479928426260819969</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
