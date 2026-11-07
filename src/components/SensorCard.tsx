import React from 'react';
import { Thermometer, Droplets, Gauge, Waves, AlertTriangle } from 'lucide-react';
import { TelemetryData, TelemetryHistoryPoint } from '../types/telemetry';

interface SensorCardsProps {
  telemetry: TelemetryData;
  history: TelemetryHistoryPoint[];
}

export const SensorCards: React.FC<SensorCardsProps> = ({ telemetry, history }) => {
  const { soilMoisture, tankLevel, temperature, humidity, lowTankWarning } = telemetry;

  // 1. Soil Moisture Status
  let soilStatus = 'MODERATE';
  let soilStatusColor = 'text-[#10B981]';
  let soilSubtext = 'Optimal soil hydration balance';

  if (soilMoisture < 30) {
    soilStatus = 'DRY';
    soilStatusColor = 'text-rose-400';
    soilSubtext = 'Dry: irrigation trigger threshold (<30%)';
  } else if (soilMoisture >= 45) {
    soilStatus = 'MOIST';
    soilStatusColor = 'text-[#06B6D4]';
    soilSubtext = 'Moist: automatic stop threshold';
  }

  // Circular gauge calculations (SVG radius = 34, perimeter = 2 * PI * 34 = 213.6)
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, soilMoisture)) / 100) * circumference;

  // 2. Tank Level Status
  const isTankLow = tankLevel < 15;
  const tankStatus = isTankLow ? 'LOW' : 'NORMAL';
  const tankStatusColor = isTankLow ? 'text-rose-400' : 'text-[#06B6D4]';
  const tankSubtext = isTankLow 
    ? 'Critical: Interlock locked out (<15%)' 
    : 'Water level sufficient for irrigation';

  // Sparklines for Temp & Humidity
  const recentPoints = history.slice(-16);
  const tempValues = recentPoints.map(p => p.temperature);
  const humValues = recentPoints.map(p => p.humidity);

  const minTemp = tempValues.length ? Math.min(...tempValues) - 1 : 20;
  const maxTemp = tempValues.length ? Math.max(...tempValues) + 1 : 35;
  const minHum = humValues.length ? Math.min(...humValues) - 2 : 30;
  const maxHum = humValues.length ? Math.max(...humValues) + 2 : 90;

  const generateSparkline = (values: number[], min: number, max: number, width = 120, height = 36) => {
    if (values.length < 2) return '';
    const range = max - min || 1;
    return values.map((val, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  const tempPath = generateSparkline(tempValues, minTemp, maxTemp);
  const humPath = generateSparkline(humValues, minHum, maxHum);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* CARD 1: SOIL MOISTURE */}
      <div className="bg-[#111A17] border border-[#1C2D27] rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:border-[#263E36] group">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#7F9E96]">
              Soil Moisture
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-mono font-semibold ${soilStatusColor}`}>
                {soilStatus}
              </span>
              <span className="text-xs text-[#526E67]">·</span>
              <span className="text-xs text-[#7F9E96] font-mono">Analog GPIO34</span>
            </div>
          </div>

          {/* Mini Circular Gauge Indicator */}
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-12 h-12 -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#1C2D27"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke={soilMoisture < 30 ? '#F87171' : '#10B981'}
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 20}
                strokeDashoffset={2 * Math.PI * 20 - (Math.min(100, Math.max(0, soilMoisture)) / 100) * (2 * Math.PI * 20)}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <Gauge className="w-4 h-4 text-[#7F9E96] absolute" />
          </div>
        </div>

        {/* Big Number */}
        <div className="flex items-baseline gap-1.5 my-2">
          <span className="text-3xl font-bold font-mono text-[#E6F2EE] tracking-tight">
            {soilMoisture.toFixed(1)}
          </span>
          <span className="text-sm font-mono text-[#7F9E96] font-semibold">%</span>
        </div>

        {/* Linear Bar representation */}
        <div className="w-full bg-[#16221E] h-1.5 rounded-full overflow-hidden my-3 relative">
          {/* Threshold marker at 30% */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10" 
            style={{ left: '30%' }} 
            title="30% Pump On threshold"
          />
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              soilMoisture < 30 ? 'bg-rose-400' : 'bg-[#10B981]'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, soilMoisture))}%` }}
          />
        </div>

        <p className="text-xs text-[#7F9E96] truncate">
          {soilSubtext}
        </p>
      </div>

      {/* CARD 2: WATER TANK LEVEL */}
      <div className={`bg-[#111A17] border rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:border-[#263E36] group ${
        isTankLow ? 'border-rose-500/40 shadow-sm shadow-rose-950/30' : 'border-[#1C2D27]'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#7F9E96]">
              Tank Level
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-mono font-semibold ${tankStatusColor}`}>
                {tankStatus}
              </span>
              <span className="text-xs text-[#526E67]">·</span>
              <span className="text-xs text-[#7F9E96] font-mono">Analog GPIO35</span>
            </div>
          </div>

          <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center shrink-0">
            {isTankLow ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
            ) : (
              <Waves className="w-5 h-5 text-[#06B6D4]" />
            )}
          </div>
        </div>

        {/* Big Number */}
        <div className="flex items-baseline gap-1.5 my-2">
          <span className="text-3xl font-bold font-mono text-[#E6F2EE] tracking-tight">
            {tankLevel.toFixed(1)}
          </span>
          <span className="text-sm font-mono text-[#7F9E96] font-semibold">%</span>
        </div>

        {/* Vertical/Horizontal reservoir bar with 15% safety lockout line */}
        <div className="w-full bg-[#16221E] h-1.5 rounded-full overflow-hidden my-3 relative">
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10" 
            style={{ left: '15%' }} 
            title="15% Interlock Cutoff"
          />
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isTankLow ? 'bg-rose-400' : 'bg-[#06B6D4]'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, tankLevel))}%` }}
          />
        </div>

        <p className="text-xs text-[#7F9E96] truncate">
          {tankSubtext}
        </p>
      </div>

      {/* CARD 3: TEMPERATURE */}
      <div className="bg-[#111A17] border border-[#1C2D27] rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:border-[#263E36] group">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#7F9E96]">
              Temperature
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono font-semibold text-[#10B981]">
                {telemetry.dhtOk ? 'DHT22 VALID' : 'DHT ERROR'}
              </span>
              <span className="text-xs text-[#526E67]">·</span>
              <span className="text-xs text-[#7F9E96] font-mono">GPIO15</span>
            </div>
          </div>

          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Thermometer className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        {/* Big Number & Sparkline */}
        <div className="flex items-end justify-between my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-[#E6F2EE] tracking-tight">
              {temperature.toFixed(1)}
            </span>
            <span className="text-sm font-mono text-[#7F9E96] font-semibold">°C</span>
          </div>

          {/* SVG Sparkline */}
          <div className="w-24 h-8 shrink-0">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 120 36">
              <path
                d={tempPath}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="w-full bg-[#16221E] h-1.5 rounded-full overflow-hidden my-3">
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, (temperature / 50) * 100))}%` }}
          />
        </div>

        <p className="text-xs text-[#7F9E96] truncate">
          DHT22 environmental sensor readings valid
        </p>
      </div>

      {/* CARD 4: HUMIDITY */}
      <div className="bg-[#111A17] border border-[#1C2D27] rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:border-[#263E36] group">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#7F9E96]">
              Humidity
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono font-semibold text-[#06B6D4]">
                NORMAL
              </span>
              <span className="text-xs text-[#526E67]">·</span>
              <span className="text-xs text-[#7F9E96] font-mono">Relative %</span>
            </div>
          </div>

          <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center shrink-0">
            <Droplets className="w-5 h-5 text-[#06B6D4]" />
          </div>
        </div>

        {/* Big Number & Sparkline */}
        <div className="flex items-end justify-between my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-[#E6F2EE] tracking-tight">
              {humidity.toFixed(1)}
            </span>
            <span className="text-sm font-mono text-[#7F9E96] font-semibold">%</span>
          </div>

          {/* SVG Sparkline */}
          <div className="w-24 h-8 shrink-0">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 120 36">
              <path
                d={humPath}
                fill="none"
                stroke="#06B6D4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="w-full bg-[#16221E] h-1.5 rounded-full overflow-hidden my-3">
          <div
            className="h-full bg-[#06B6D4] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, humidity))}%` }}
          />
        </div>

        <p className="text-xs text-[#7F9E96] truncate">
          Relative air humidity in irrigation canopy
        </p>
      </div>

    </div>
  );
};
