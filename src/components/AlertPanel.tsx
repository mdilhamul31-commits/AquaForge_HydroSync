import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Trash2, 
  Filter,
  Volume2,
  VolumeX
} from 'lucide-react';
import { AlertItem } from '../types/telemetry';

interface AlertPanelProps {
  alerts: AlertItem[];
  onClear: () => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, onClear }) => {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [soundEnabled, setSoundEnabled] = useState(false);

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'ALL') return true;
    return a.type === filter;
  });

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'CRITICAL':
        return <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />;
      case 'INFO':
      default:
        return <Info className="w-4 h-4 text-[#06B6D4] shrink-0" />;
    }
  };

  const getAlertBg = (type: AlertItem['type']) => {
    switch (type) {
      case 'CRITICAL':
        return 'bg-rose-950/20 border-rose-500/30 text-rose-200';
      case 'WARNING':
        return 'bg-amber-950/20 border-amber-500/30 text-amber-200';
      case 'SUCCESS':
        return 'bg-emerald-950/20 border-[#10B981]/30 text-emerald-200';
      case 'INFO':
      default:
        return 'bg-[#0E1513] border-[#1C2D27] text-[#E6F2EE]';
    }
  };

  return (
    <div className="bg-[#111A17] border border-[#1C2D27] rounded-2xl p-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1C2D27]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#7F9E96]">
              Activity
            </span>
            <span className="text-xs text-[#526E67]">·</span>
            <span className="text-xs font-mono text-[#10B981]">
              {alerts.length} Total Events Logged
            </span>
          </div>
          <h3 className="text-lg font-semibold text-[#E6F2EE] mt-0.5">
            System Events &amp; Autonomous Actions
          </h3>
        </div>

        {/* Filter & Actions */}
        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center p-0.5 bg-[#0B0F0E] rounded-lg border border-[#1C2D27] text-xs font-mono">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'ALL' ? 'bg-[#16221E] text-[#E6F2EE] font-semibold' : 'text-[#7F9E96]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('CRITICAL')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'CRITICAL' ? 'bg-rose-900/60 text-rose-300 font-semibold' : 'text-[#7F9E96]'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilter('WARNING')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'WARNING' ? 'bg-amber-900/60 text-amber-300 font-semibold' : 'text-[#7F9E96]'
              }`}
            >
              Warnings
            </button>
          </div>

          {/* Sound Mute/Unmute */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border border-[#1C2D27] transition-colors ${
              soundEnabled ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#0B0F0E] text-[#526E67]'
            }`}
            title={soundEnabled ? 'Alert audio enabled' : 'Alert audio muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Clear Button */}
          {alerts.length > 0 && (
            <button
              onClick={onClear}
              className="p-1.5 rounded-lg bg-[#0B0F0E] hover:bg-[#16221E] text-[#7F9E96] hover:text-rose-400 border border-[#1C2D27] transition-colors"
              title="Clear event logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-[#526E67]">
            No recent events match the active filter.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${getAlertBg(
                alert.type
              )}`}
            >
              <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold font-mono tracking-tight text-[#E6F2EE]">
                    {alert.title}
                  </span>
                  <span className="text-[11px] font-mono text-[#7F9E96] shrink-0">
                    {alert.timestamp}
                  </span>
                </div>
                <p className="text-xs text-[#7F9E96] mt-0.5 leading-relaxed">
                  {alert.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
