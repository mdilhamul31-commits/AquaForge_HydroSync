import React from 'react';
import { 
  Radio, 
  Cpu, 
  ExternalLink, 
  Download, 
  Sliders, 
  Map, 
  Box, 
  BarChart3, 
  Github,
  CheckCircle2,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { TelemetryData, SystemHealthStatus } from '../types/telemetry';
import { ConnectionMode, WOKWI_PROJECT_URL, GITHUB_REPO_URL } from '../services/sensorService';

interface HeaderProps {
  telemetry: TelemetryData;
  health: SystemHealthStatus;
  connectionMode: ConnectionMode;
  isLiveConnected: boolean;
  activeTab: 'overview' | 'wokwi' | 'rover' | 'cad' | 'specs';
  onTabChange: (tab: 'overview' | 'wokwi' | 'rover' | 'cad' | 'specs') => void;
  onModeSwitch: (mode: ConnectionMode) => void;
  onExportCsv: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  telemetry,
  health,
  connectionMode,
  isLiveConnected,
  activeTab,
  onTabChange,
  onModeSwitch,
  onExportCsv
}) => {
  const isStale = telemetry.isStale;

  return (
    <header className="border-b border-[#1C2D27] bg-[#0E1513]/85 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Brand Lockup */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center font-bold text-white shadow-lg shadow-[#10B981]/20 ring-1 ring-[#10B981]/40 shrink-0">
            <span className="text-xl tracking-tighter">A</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-widest text-[#E6F2EE] uppercase">AQUAFORGE</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] font-mono font-medium border border-[#10B981]/30">
                HYDROSYNC
              </span>
            </div>
            <p className="text-xs text-[#7F9E96]">
              Smart Agriculture &amp; Automated Irrigation System
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 p-1 bg-[#111A17] rounded-xl border border-[#1C2D27] overflow-x-auto">
          <button
            onClick={() => onTabChange('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#10B981] text-[#0B0F0E] shadow-sm font-semibold'
                : 'text-[#7F9E96] hover:text-[#E6F2EE] hover:bg-[#16221E]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onTabChange('wokwi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'wokwi'
                ? 'bg-[#06B6D4] text-[#0B0F0E] shadow-sm font-semibold'
                : 'text-[#7F9E96] hover:text-[#E6F2EE] hover:bg-[#16221E]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Wokwi Simulation Sync</span>
          </button>

          <button
            onClick={() => onTabChange('specs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'specs'
                ? 'bg-[#10B981] text-[#0B0F0E] shadow-sm font-semibold'
                : 'text-[#7F9E96] hover:text-[#E6F2EE] hover:bg-[#16221E]'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Repo Docs &amp; Test Plan</span>
          </button>

          <button
            onClick={() => onTabChange('rover')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'rover'
                ? 'bg-[#10B981] text-[#0B0F0E] shadow-sm font-semibold'
                : 'text-[#7F9E96] hover:text-[#E6F2EE] hover:bg-[#16221E]'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Field Rover Grid</span>
          </button>

          <button
            onClick={() => onTabChange('cad')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'cad'
                ? 'bg-[#10B981] text-[#0B0F0E] shadow-sm font-semibold'
                : 'text-[#7F9E96] hover:text-[#E6F2EE] hover:bg-[#16221E]'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Fusion 360 CAD</span>
          </button>
        </nav>

        {/* Status Indicators & Action Bar */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0 justify-end">
          
          {/* Mode Selector */}
          <div className="flex items-center bg-[#111A17] p-0.5 rounded-lg border border-[#1C2D27] text-xs">
            <button
              onClick={() => onModeSwitch('live-mqtt')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 font-mono ${
                connectionMode === 'live-mqtt'
                  ? 'bg-[#06B6D4] text-[#0B0F0E] font-semibold'
                  : 'text-[#7F9E96] hover:text-[#E6F2EE]'
              }`}
              title="Connect directly to ESP32 MQTT topic on HiveMQ"
            >
              <Radio className="w-3 h-3" />
              <span>LIVE MQTT</span>
            </button>
            <button
              onClick={() => onModeSwitch('demo')}
              className={`px-2.5 py-1 rounded-md transition-colors font-mono ${
                connectionMode === 'demo'
                  ? 'bg-[#10B981] text-[#0B0F0E] font-semibold'
                  : 'text-[#7F9E96] hover:text-[#E6F2EE]'
              }`}
              title="Realistic simulation with soil evapotranspiration"
            >
              DEMO
            </button>
            <button
              onClick={() => onModeSwitch('testbench')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 font-mono ${
                connectionMode === 'testbench'
                  ? 'bg-amber-500 text-[#0B0F0E] font-semibold'
                  : 'text-[#7F9E96] hover:text-[#E6F2EE]'
              }`}
              title="Interactive Hardware Testbench with manual slider overrides"
            >
              <Sliders className="w-3 h-3" />
              <span>TWIN</span>
            </button>
          </div>

          {/* Device & Hardware State (With STALE Tracking matching repo spec) */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111A17] border border-[#1C2D27] text-xs">
            <span className="text-[#7F9E96] font-mono">DEVICE:</span>
            <span className="font-mono font-semibold text-[#E6F2EE]">AQUA5</span>
            <span className="text-[#1C2D27]">|</span>
            <span className={`font-mono font-semibold flex items-center gap-1 ${
              isStale 
                ? 'text-amber-400' 
                : (connectionMode === 'live-mqtt'
                  ? (isLiveConnected ? 'text-[#10B981]' : 'text-amber-400')
                  : 'text-[#06B6D4]')
            }`}>
              {isStale 
                ? 'DEVICE STALE (>20s)' 
                : (connectionMode === 'live-mqtt' 
                  ? (isLiveConnected ? 'DEVICE ONLINE' : 'CONNECTING...') 
                  : (connectionMode === 'demo' ? 'SIMULATED LIVE' : 'HARDWARE TWIN'))}
            </span>
          </div>

          {/* GitHub Repository Quick Link */}
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-[#16221E] hover:bg-[#1F332C] text-[#E6F2EE] border border-[#1C2D27] transition-colors"
            title="Open GitHub Repository (ayankunduixb-pixel/AquaForge-HYDROSYNC...)"
          >
            <Github className="w-4 h-4 text-[#10B981]" />
          </a>

          {/* CSV Export */}
          <button
            onClick={onExportCsv}
            className="px-3 py-1.5 rounded-lg bg-[#16221E] hover:bg-[#1F332C] text-[#E6F2EE] text-xs font-mono border border-[#1C2D27] flex items-center gap-1.5 transition-colors"
            title="Download CSV log matching ESP32 MicroSD format"
          >
            <Download className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="hidden md:inline">CSV LOG</span>
          </button>

          {/* External Wokwi link */}
          <a
            href={WOKWI_PROJECT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-[#16221E] hover:bg-[#1F332C] text-[#7F9E96] hover:text-[#E6F2EE] border border-[#1C2D27] transition-colors"
            title="Open Wokwi Project in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </header>
  );
};
