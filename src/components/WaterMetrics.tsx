import React from 'react';
import { Droplet, Gauge, TrendingDown, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { WaterUsageMetrics, TelemetryData } from '../types/telemetry';

interface WaterMetricsProps {
  metrics: WaterUsageMetrics;
  telemetry: TelemetryData;
}

export const WaterMetrics: React.FC<WaterMetricsProps> = ({ metrics, telemetry }) => {
  const pumpRuntimeSec = Math.floor(metrics.totalPumpActiveMs / 1000);
  const minutes = Math.floor(pumpRuntimeSec / 60);
  const seconds = pumpRuntimeSec % 60;

  // Estimate tank volume: assume 500L standard farm reservoir
  const tankCapacityLitres = 500;
  const currentLitres = ((telemetry.tankLevel / 100) * tankCapacityLitres).toFixed(0);

  return (
    <div className="bg-[#111A17] border border-[#1C2D27] rounded-2xl p-6 font-mono">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1C2D27]">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#06B6D4]">
            Hydraulic Analytics
          </span>
          <h3 className="text-lg font-bold text-[#E6F2EE] mt-0.5">
            Water Consumption &amp; Efficiency
          </h3>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] text-xs font-semibold border border-[#10B981]/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>+{metrics.waterSavingsPercentage}% Water Saved</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        
        {/* Dispensed Volume */}
        <div className="p-4 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
          <div className="flex items-center justify-between text-xs text-[#7F9E96]">
            <span>Water Dispensed</span>
            <Droplet className="w-4 h-4 text-[#06B6D4]" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-bold text-[#E6F2EE] tabular-nums">
              {metrics.totalWaterPumpedLitres.toFixed(2)}
            </span>
            <span className="text-xs text-[#7F9E96]">Litres</span>
          </div>
          <span className="text-[10px] text-[#526E67] block mt-1">
            Flow: {metrics.currentFlowRateLpm.toFixed(1)} L/min
          </span>
        </div>

        {/* Pump Runtime */}
        <div className="p-4 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
          <div className="flex items-center justify-between text-xs text-[#7F9E96]">
            <span>Active Run Duration</span>
            <Clock className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-[#E6F2EE] tabular-nums">
              {minutes}m {seconds}s
            </span>
          </div>
          <span className="text-[10px] text-[#526E67] block mt-1">
            {telemetry.pumpStatus ? 'Relay energized' : 'Relay open (standby)'}
          </span>
        </div>

        {/* Cycles Completed */}
        <div className="p-4 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
          <div className="flex items-center justify-between text-xs text-[#7F9E96]">
            <span>Hydration Cycles</span>
            <Gauge className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-[#E6F2EE] tabular-nums">
              {metrics.todayCyclesCompleted}
            </span>
            <span className="text-xs text-[#7F9E96]">Today</span>
          </div>
          <span className="text-[10px] text-[#526E67] block mt-1">
            Hysteresis target: 45.0%
          </span>
        </div>

        {/* Reservoir Capacity */}
        <div className="p-4 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
          <div className="flex items-center justify-between text-xs text-[#7F9E96]">
            <span>Remaining Reservoir</span>
            <TrendingDown className="w-4 h-4 text-[#06B6D4]" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-[#E6F2EE] tabular-nums">
              {currentLitres}
            </span>
            <span className="text-xs text-[#7F9E96]">/ {tankCapacityLitres} L</span>
          </div>
          <span className="text-[10px] text-[#526E67] block mt-1">
            {telemetry.lowTankWarning ? 'Locked (< 15%)' : 'Normal supply'}
          </span>
        </div>

      </div>

    </div>
  );
};
