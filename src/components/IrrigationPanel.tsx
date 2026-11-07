import React from 'react';
import { 
  Power, 
  ShieldCheck, 
  ShieldAlert, 
  Droplet, 
  Database, 
  Info,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { TelemetryData } from '../types/telemetry';
import { evaluateIrrigationLogic, SOIL_DRY_THRESHOLD, TANK_MINIMUM_LEVEL } from '../services/irrigationLogic';

interface IrrigationPanelProps {
  telemetry: TelemetryData;
  onToggleManualRequest?: () => void;
  onToggleMode?: () => void;
}

export const IrrigationPanel: React.FC<IrrigationPanelProps> = ({
  telemetry,
  onToggleManualRequest,
  onToggleMode
}) => {
  const { soilMoisture, tankLevel, pumpStatus, mode, lowTankWarning } = telemetry;
  const decision = evaluateIrrigationLogic(soilMoisture, tankLevel, mode, telemetry.manualRequest);

  return (
    <div className="bg-[#111A17] border border-[#1C2D27] rounded-2xl p-6 transition-all duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1C2D27]">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#7F9E96]">
            Irrigation Control
          </span>
          <h3 className="text-lg font-semibold text-[#E6F2EE] mt-0.5">
            Pump Status &amp; Decision Matrix
          </h3>
        </div>

        {/* State Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 border ${
          pumpStatus 
            ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30 shadow-sm shadow-[#10B981]/20' 
            : 'bg-[#16221E] text-[#7F9E96] border-[#1C2D27]'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            pumpStatus ? 'bg-[#10B981] animate-pulse' : 'bg-[#526E67]'
          }`} />
          <span>{pumpStatus ? 'PUMP ACTIVE (ON)' : 'PUMP STOPPED (OFF)'}</span>
        </div>
      </div>

      {/* Main Status Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 items-center">
        
        {/* Visual LED & Pump Relay Indicator */}
        <div className="flex items-center gap-5 p-4 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
          {/* LED Representation (Wokwi Green LED on GPIO25) */}
          <div className="relative flex items-center justify-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
              pumpStatus
                ? 'bg-[#10B981] shadow-[0_0_25px_rgba(16,185,129,0.7)] text-[#0B0F0E]'
                : 'bg-[#16221E] border border-[#1C2D27] text-[#526E67]'
            }`}>
              <Power className={`w-7 h-7 ${pumpStatus ? 'text-[#0B0F0E]' : 'text-[#526E67]'}`} />
            </div>
            {pumpStatus && (
              <span className="absolute -bottom-1 text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                GPIO25
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-[#E6F2EE]">
                {pumpStatus ? 'Irrigation in Progress' : 'Pump in Standby'}
              </h4>
              <span className="text-xs px-2 py-0.5 rounded bg-[#16221E] text-[#7F9E96] font-mono border border-[#1C2D27]">
                Mode: {mode}
              </span>
            </div>
            <p className="text-xs text-[#7F9E96] mt-1 leading-relaxed">
              {decision.reason}
            </p>
          </div>
        </div>

        {/* Condition Check Matrix */}
        <div className="space-y-3">
          
          {/* Soil Moisture Condition */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#16221E]/60 border border-[#1C2D27] text-xs">
            <div className="flex items-center gap-2.5">
              <Droplet className={`w-4 h-4 ${soilMoisture < SOIL_DRY_THRESHOLD ? 'text-amber-400' : 'text-[#10B981]'}`} />
              <span className="text-[#E6F2EE] font-medium">Soil Moisture Condition</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[#7F9E96]">{soilMoisture.toFixed(1)}%</span>
              <span className={soilMoisture < SOIL_DRY_THRESHOLD ? 'text-amber-400 font-semibold' : 'text-[#10B981]'}>
                {soilMoisture < SOIL_DRY_THRESHOLD ? `DRY (<${SOIL_DRY_THRESHOLD}%)` : 'SUFFICIENT'}
              </span>
            </div>
          </div>

          {/* Tank Water Availability */}
          <div className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
            lowTankWarning 
              ? 'bg-rose-950/20 border-rose-500/30 text-rose-300' 
              : 'bg-[#16221E]/60 border-[#1C2D27] text-[#E6F2EE]'
          }`}>
            <div className="flex items-center gap-2.5">
              <Database className={`w-4 h-4 ${lowTankWarning ? 'text-rose-400' : 'text-[#06B6D4]'}`} />
              <span className="font-medium">Tank Water Availability</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[#7F9E96]">{tankLevel.toFixed(1)}%</span>
              <span className={lowTankWarning ? 'text-rose-400 font-semibold' : 'text-[#06B6D4]'}>
                {lowTankWarning ? `CRITICAL (<${TANK_MINIMUM_LEVEL}%)` : `SAFE (>=${TANK_MINIMUM_LEVEL}%)`}
              </span>
            </div>
          </div>

          {/* System Safety Interlock */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#16221E]/60 border border-[#1C2D27] text-xs">
            <div className="flex items-center gap-2.5">
              {lowTankWarning ? (
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              )}
              <span className="text-[#E6F2EE] font-medium">Hardware Interlock</span>
            </div>
            <span className={`font-mono font-semibold ${lowTankWarning ? 'text-rose-400' : 'text-[#10B981]'}`}>
              {lowTankWarning ? 'INTERLOCK ACTIVE (LOCKED)' : 'NORMAL (PERMITTED)'}
            </span>
          </div>

        </div>

      </div>

      {/* Low Water Warning Banner if tank < 15% */}
      {lowTankWarning && (
        <div className="p-3.5 mb-4 rounded-xl bg-rose-950/30 border border-rose-500/40 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-rose-300 uppercase tracking-wider block">
              LOW WATER WARNING — PUMP LOCKED OUT
            </span>
            <p className="text-rose-200/80 mt-0.5">
              Reservoir water level ({tankLevel.toFixed(1)}%) is below the mandatory 15% threshold. Pump relay is disabled to prevent cavitation and impeller damage. Red warning LED active on GPIO26.
            </p>
          </div>
        </div>
      )}

      {/* Local Authority Note matching user reference image */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0B0F0E] border border-[#1C2D27] text-xs text-[#7F9E96]">
        <Lock className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
        <span className="font-mono text-[11px] leading-relaxed">
          Remote control is intentionally disabled in Stage 4. Pump decisions remain local and authoritative to the ESP32 firmware.
        </span>
      </div>

    </div>
  );
};
