import React, { useState } from 'react';
import { HardDrive, Download, FileText, CheckCircle2, Table, Eye, Layers } from 'lucide-react';
import { SdCardLogRow } from '../types/telemetry';

interface MicroSdViewerProps {
  rows: SdCardLogRow[];
  onDownloadCsv: () => void;
}

export const MicroSdViewer: React.FC<MicroSdViewerProps> = ({ rows, onDownloadCsv }) => {
  const [viewMode, setViewMode] = useState<'table' | 'raw'>('table');

  const rawCsvText = [
    'elapsed_ms,record_type,detail,soil_pct,tank_pct,temp_c,humidity_pct,mode,pump,tank_state',
    ...rows.map(r => 
      `${r.elapsedMs},${r.recordType},"${r.detail}",${r.soilPct.toFixed(1)},${r.tankPct.toFixed(1)},${r.tempC},${r.humidityPct},${r.mode},${r.pump},${r.tankState}`
    )
  ].join('\n');

  return (
    <div className="bg-[#111A17] border border-[#1C2D27] rounded-2xl p-6 font-mono text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1C2D27]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#16221E] border border-[#1C2D27] flex items-center justify-center text-[#10B981]">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#E6F2EE] text-sm">MicroSD Card Storage (SPI GPIO5)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] font-semibold border border-[#10B981]/30">
                FAT32 MOUNTED
              </span>
            </div>
            <span className="text-[#7F9E96] text-[11px]">
              Target: /hydrosync_log.csv · Continuous Offline Data Acquisition
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-[#0B0F0E] rounded-lg border border-[#1C2D27]">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                viewMode === 'table' ? 'bg-[#16221E] text-[#10B981] font-bold' : 'text-[#7F9E96]'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                viewMode === 'raw' ? 'bg-[#16221E] text-[#06B6D4] font-bold' : 'text-[#7F9E96]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Raw CSV</span>
            </button>
          </div>

          <button
            onClick={onDownloadCsv}
            className="px-3 py-1.5 rounded-lg bg-[#10B981] text-[#0B0F0E] font-bold flex items-center gap-1.5 hover:bg-[#059669] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Storage Meta Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-2.5 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
          <span className="text-[10px] text-[#526E67] uppercase block">Total Logged Rows</span>
          <span className="text-sm font-bold text-[#E6F2EE]">{rows.length} records</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
          <span className="text-[10px] text-[#526E67] uppercase block">File Allocation</span>
          <span className="text-sm font-bold text-[#10B981]">{(rows.length * 72 / 1024).toFixed(1)} KiB</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
          <span className="text-[10px] text-[#526E67] uppercase block">Write Cadence</span>
          <span className="text-sm font-bold text-[#06B6D4]">Every 5,000 ms</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
          <span className="text-[10px] text-[#526E67] uppercase block">Network Isolation</span>
          <span className="text-sm font-bold text-[#10B981]">100% Autonomous</span>
        </div>
      </div>

      {/* Content View: Table or Raw */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto rounded-xl border border-[#1C2D27] max-h-72 overflow-y-auto">
          <table className="w-full text-left divide-y divide-[#1C2D27]">
            <thead className="bg-[#0B0F0E] text-[#7F9E96] sticky top-0 z-10 text-[11px]">
              <tr>
                <th className="p-2.5">Elapsed (ms)</th>
                <th className="p-2.5">Record</th>
                <th className="p-2.5">Soil %</th>
                <th className="p-2.5">Tank %</th>
                <th className="p-2.5">Temp °C</th>
                <th className="p-2.5">Hum %</th>
                <th className="p-2.5">Mode</th>
                <th className="p-2.5">Pump</th>
                <th className="p-2.5">Interlock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2D27]/60 bg-[#0E1513] text-[#E6F2EE]">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#16221E]/60 transition-colors">
                  <td className="p-2.5 text-[#7F9E96]">{row.elapsedMs}</td>
                  <td className="p-2.5 text-[#06B6D4] font-semibold">{row.recordType}</td>
                  <td className={`p-2.5 font-bold ${row.soilPct <= 30 ? 'text-rose-400' : 'text-[#10B981]'}`}>
                    {row.soilPct.toFixed(1)}%
                  </td>
                  <td className={`p-2.5 font-bold ${row.tankPct < 15 ? 'text-rose-400' : 'text-[#06B6D4]'}`}>
                    {row.tankPct.toFixed(1)}%
                  </td>
                  <td className="p-2.5 text-amber-400">{row.tempC}°C</td>
                  <td className="p-2.5 text-[#06B6D4]">{row.humidityPct}%</td>
                  <td className="p-2.5 text-[#7F9E96]">{row.mode}</td>
                  <td className={`p-2.5 font-bold ${row.pump === 'ON' ? 'text-[#10B981]' : 'text-[#7F9E96]'}`}>
                    {row.pump}
                  </td>
                  <td className={`p-2.5 font-semibold ${row.tankState === 'LOCKOUT' ? 'text-rose-400' : 'text-[#10B981]'}`}>
                    {row.tankState}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[#070A09] p-4 rounded-xl border border-[#1C2D27] overflow-x-auto max-h-72 overflow-y-auto text-[11px] leading-relaxed text-[#7F9E96]">
          <pre>{rawCsvText}</pre>
        </div>
      )}

    </div>
  );
};
