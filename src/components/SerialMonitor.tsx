import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, Copy, Check, Pause, Play, Download, Search } from 'lucide-react';
import { SerialLogMessage } from '../types/telemetry';

interface SerialMonitorProps {
  logs: SerialLogMessage[];
  onClear: () => void;
}

export const SerialMonitor: React.FC<SerialMonitorProps> = ({ logs, onClear }) => {
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'TELEMETRY' | 'EVENT' | 'INFO' | 'WARN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(l => {
    if (filter !== 'ALL' && l.type !== filter) return false;
    if (searchQuery && !l.raw.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] ${l.raw}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogColor = (type: SerialLogMessage['type']) => {
    switch (type) {
      case 'TELEMETRY':
        return 'text-[#06B6D4]';
      case 'EVENT':
        return 'text-[#10B981] font-semibold';
      case 'WARN':
        return 'text-amber-400 font-semibold';
      case 'ERROR':
        return 'text-rose-400 font-bold';
      case 'INFO':
      default:
        return 'text-[#7F9E96]';
    }
  };

  return (
    <div className="bg-[#111A17] border border-[#1C2D27] rounded-2xl p-5 flex flex-col h-full font-mono">
      
      {/* Terminal Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1C2D27]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#16221E] border border-[#1C2D27] flex items-center justify-center text-[#10B981]">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#E6F2EE]">ESP32 Serial Console</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] font-semibold border border-[#10B981]/30">
                115200 BAUD
              </span>
            </div>
            <span className="text-[11px] text-[#526E67]">UART0 Raw Firmware Output</span>
          </div>
        </div>

        {/* Console Controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Filter */}
          <div className="flex items-center p-0.5 bg-[#0B0F0E] rounded-lg border border-[#1C2D27] text-[11px]">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2 py-0.5 rounded transition-colors ${filter === 'ALL' ? 'bg-[#16221E] text-[#E6F2EE] font-bold' : 'text-[#7F9E96]'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('TELEMETRY')}
              className={`px-2 py-0.5 rounded transition-colors ${filter === 'TELEMETRY' ? 'bg-[#16221E] text-[#06B6D4] font-bold' : 'text-[#7F9E96]'}`}
            >
              Telemetry
            </button>
            <button
              onClick={() => setFilter('EVENT')}
              className={`px-2 py-0.5 rounded transition-colors ${filter === 'EVENT' ? 'bg-[#16221E] text-[#10B981] font-bold' : 'text-[#7F9E96]'}`}
            >
              Events
            </button>
          </div>

          {/* Auto Scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded-lg border transition-colors ${
              autoScroll ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30' : 'bg-[#0B0F0E] text-[#7F9E96] border-[#1C2D27]'
            }`}
            title={autoScroll ? 'Auto-scroll ON' : 'Auto-scroll PAUSED'}
          >
            {autoScroll ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Copy Logs */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-[#0B0F0E] hover:bg-[#16221E] text-[#7F9E96] hover:text-[#E6F2EE] border border-[#1C2D27] transition-colors"
            title="Copy all serial logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Logs */}
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg bg-[#0B0F0E] hover:bg-[#16221E] text-[#7F9E96] hover:text-rose-400 border border-[#1C2D27] transition-colors"
            title="Clear terminal buffer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Window */}
      <div 
        ref={logContainerRef}
        className="flex-1 min-h-[220px] max-h-[300px] overflow-y-auto bg-[#070A09] rounded-xl p-3 my-3 border border-[#1C2D27] space-y-1 text-xs select-text font-mono"
      >
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-[#526E67] text-xs">
            Awaiting ESP32 serial output frames...
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2.5 leading-relaxed hover:bg-[#111A17]/60 px-1 rounded transition-colors">
              <span className="text-[#526E67] select-none shrink-0 text-[11px]">
                {log.timestamp}
              </span>
              <span className={`${getLogColor(log.type)} break-all`}>
                {log.raw}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Terminal Status Bar */}
      <div className="flex items-center justify-between text-[11px] text-[#526E67] pt-1">
        <span>Frame Buffer: {filteredLogs.length} lines</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span>Serial Stream Synchronized</span>
        </span>
      </div>

    </div>
  );
};
