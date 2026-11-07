import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { TelemetryHistoryPoint, TimeWindow } from '../types/telemetry';
import { Activity, Clock } from 'lucide-react';

interface AnalyticsProps {
  history: TelemetryHistoryPoint[];
  timeWindow: TimeWindow;
  onTimeWindowChange: (w: TimeWindow) => void;
  sampleCount: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0E1513] border border-[#263E36] p-3 rounded-xl shadow-xl text-xs font-mono">
        <div className="text-[#7F9E96] mb-2 font-medium flex items-center gap-1.5 border-b border-[#1C2D27] pb-1">
          <Clock className="w-3 h-3 text-[#10B981]" />
          <span>{label}</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: item.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}:</span>
              </span>
              <span className="font-bold text-[#E6F2EE] tabular-nums">
                {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
                {item.unit || ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const Analytics: React.FC<AnalyticsProps> = ({
  history,
  timeWindow,
  onTimeWindowChange,
  sampleCount
}) => {
  return (
    <div className="bg-[#111A17] border border-[#1C2D27] rounded-2xl p-6">
      
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#1C2D27]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#7F9E96]">
              Live History
            </span>
            <span className="text-xs text-[#526E67]">·</span>
            <span className="text-xs font-mono text-[#06B6D4]">
              Latest {sampleCount} received samples
            </span>
          </div>
          <h3 className="text-lg font-semibold text-[#E6F2EE] mt-0.5">
            Sensor Trend Telemetry
          </h3>
        </div>

        {/* Time Window Buttons */}
        <div className="flex items-center p-1 bg-[#0B0F0E] rounded-xl border border-[#1C2D27] text-xs">
          <button
            onClick={() => onTimeWindowChange('1m')}
            className={`px-3 py-1 rounded-lg transition-colors font-mono font-medium ${
              timeWindow === '1m'
                ? 'bg-[#10B981] text-[#0B0F0E] font-semibold shadow-sm'
                : 'text-[#7F9E96] hover:text-[#E6F2EE]'
            }`}
          >
            1 MIN
          </button>
          <button
            onClick={() => onTimeWindowChange('5m')}
            className={`px-3 py-1 rounded-lg transition-colors font-mono font-medium ${
              timeWindow === '5m'
                ? 'bg-[#10B981] text-[#0B0F0E] font-semibold shadow-sm'
                : 'text-[#7F9E96] hover:text-[#E6F2EE]'
            }`}
          >
            5 MIN
          </button>
          <button
            onClick={() => onTimeWindowChange('30m')}
            className={`px-3 py-1 rounded-lg transition-colors font-mono font-medium ${
              timeWindow === '30m'
                ? 'bg-[#10B981] text-[#0B0F0E] font-semibold shadow-sm'
                : 'text-[#7F9E96] hover:text-[#E6F2EE]'
            }`}
          >
            30 MIN
          </button>
        </div>
      </div>

      {/* Dual Real-time Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* CHART 1: SOIL MOISTURE & WATER TANK LEVEL */}
        <div className="p-4 rounded-xl bg-[#0B0F0E]/70 border border-[#1C2D27]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-[#E6F2EE] font-semibold">
              Soil &amp; Tank Hydration Levels (%)
            </span>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#10B981]">
                <span className="w-2.5 h-0.5 bg-[#10B981]" />
                Soil %
              </span>
              <span className="flex items-center gap-1.5 text-[#06B6D4]">
                <span className="w-2.5 h-0.5 bg-[#06B6D4]" />
                Tank %
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#1C2D27" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#526E67" 
                  tick={{ fill: '#7F9E96', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#526E67" 
                  tick={{ fill: '#7F9E96', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="soilMoisture"
                  name="Soil Moisture"
                  unit="%"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="tankLevel"
                  name="Tank Level"
                  unit="%"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: TEMPERATURE & HUMIDITY */}
        <div className="p-4 rounded-xl bg-[#0B0F0E]/70 border border-[#1C2D27]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-[#E6F2EE] font-semibold">
              Temperature (°C) &amp; Humidity (%)
            </span>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-0.5 bg-amber-400" />
                Temp °C
              </span>
              <span className="flex items-center gap-1.5 text-[#06B6D4]">
                <span className="w-2.5 h-0.5 bg-[#06B6D4]" />
                Humidity %
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#1C2D27" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#526E67" 
                  tick={{ fill: '#7F9E96', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#526E67" 
                  tick={{ fill: '#7F9E96', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature"
                  unit="°C"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity"
                  unit="%"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
