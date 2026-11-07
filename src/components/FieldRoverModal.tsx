import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Compass, 
  Battery, 
  Sun, 
  ShieldCheck, 
  MapPin, 
  Sliders, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface Cell {
  r: number;
  c: number;
  done: boolean;
  m: number; // moisture
  h: number; // hardness
  t: number; // soil temp
}

export const FieldRoverGrid: React.FC = () => {
  const [cols, setCols] = useState(8);
  const [rows, setRows] = useState(6);
  const [dryThreshold, setDryThreshold] = useState(30);
  const [hardThreshold, setHardThreshold] = useState(70);
  const [isScanning, setIsScanning] = useState(false);
  const [cells, setCells] = useState<Cell[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [roverPos, setRoverPos] = useState(0);
  const [selectedCellIdx, setSelectedCellIdx] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);

  // Initialize field grid
  const initializeGrid = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsScanning(false);
    setRoverPos(0);
    setSelectedCellIdx(null);

    const newCells: Cell[] = [];
    const newOrder: number[] = [];

    const dx = Math.random() * cols;
    const dy = Math.random() * rows;
    const hx = Math.random() * cols;
    const hy = Math.random() * rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const dd = Math.hypot(c - dx, r - dy);
        const hd = Math.hypot(c - hx, r - hy);

        const moisture = Math.max(10, Math.min(80, (48 - Math.max(0, 24 - dd * 6) + (Math.random() - 0.5) * 12)));
        const hardness = Math.max(15, Math.min(95, (42 + Math.max(0, 36 - hd * 9) + (Math.random() - 0.5) * 14)));
        const soilTemp = 24 + Math.random() * 5;

        newCells.push({
          r,
          c,
          done: false,
          m: moisture,
          h: hardness,
          t: soilTemp
        });
      }
    }

    // Boustrophedon path (lawnmower scan pattern)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const actualCol = r % 2 === 1 ? cols - 1 - c : c;
        newOrder.push(r * cols + actualCol);
      }
    }

    setCells(newCells);
    setOrder(newOrder);
  };

  useEffect(() => {
    initializeGrid();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cols, rows]);

  const toggleScan = () => {
    if (isScanning) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setIsScanning(false);
    } else {
      if (roverPos >= order.length) {
        setRoverPos(0);
      }
      setIsScanning(true);
      timerRef.current = window.setInterval(() => {
        setRoverPos(prev => {
          if (prev >= order.length - 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsScanning(false);
            return prev + 1;
          }
          return prev + 1;
        });
      }, 350);
    }
  };

  // Mark cells as done as rover progresses
  useEffect(() => {
    if (roverPos > 0 && cells.length > 0) {
      setCells(prev => {
        const updated = [...prev];
        for (let i = 0; i < roverPos && i < order.length; i++) {
          const idx = order[i];
          if (updated[idx] && !updated[idx].done) {
            updated[idx] = { ...updated[idx], done: true };
          }
        }
        return updated;
      });
    }
  }, [roverPos, order]);

  const currentCell = roverPos > 0 && roverPos <= order.length ? cells[order[roverPos - 1]] : null;
  const selectedCell = selectedCellIdx !== null ? cells[selectedCellIdx] : null;

  // Build SVG path for rover
  const polylinePoints = [];
  for (let i = 0; i < roverPos && i < order.length; i++) {
    const c = cells[order[i]];
    if (c) polylinePoints.push(`${c.c + 0.5},${c.r + 0.5}`);
  }

  const scannedCount = cells.filter(c => c.done).length;
  const healthyCount = cells.filter(c => c.done && c.m >= dryThreshold && c.h <= hardThreshold).length;
  const problemCount = cells.filter(c => c.done && (c.m < dryThreshold || c.h > hardThreshold)).length;
  const avgMoisture = scannedCount > 0 
    ? Math.round(cells.filter(c => c.done).reduce((acc, c) => acc + c.m, 0) / scannedCount) 
    : 0;

  const cellName = (c: Cell) => `${String.fromCharCode(65 + c.r)}${c.c + 1}`;

  return (
    <div className="bg-[#111A17] border border-[#1C2D27] rounded-2xl p-6">
      
      {/* Title & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-[#1C2D27]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#10B981]">
              Autonomous Rover Mission
            </span>
            <span className="text-xs text-[#526E67]">·</span>
            <span className="text-xs font-mono text-[#7F9E96]">
              50 × 50 cm Grid Subdivisions
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#E6F2EE] mt-0.5">
            Field Soil Compaction &amp; Moisture Scan Matrix
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleScan}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              isScanning
                ? 'bg-amber-500 text-[#0B0F0E]'
                : 'bg-[#10B981] text-[#0B0F0E] shadow-lg shadow-[#10B981]/20'
            }`}
          >
            {isScanning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isScanning ? 'PAUSE SCAN' : (roverPos >= order.length ? 'RE-SCAN' : 'START ROVER SCAN')}</span>
          </button>

          <button
            onClick={initializeGrid}
            className="p-2 rounded-lg bg-[#16221E] hover:bg-[#1F332C] text-[#7F9E96] hover:text-[#E6F2EE] border border-[#1C2D27] transition-colors"
            title="Reset field and rover"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-5 font-mono">
        <div className="p-3 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
          <span className="text-[11px] text-[#7F9E96] block uppercase">Scan Progress</span>
          <span className="text-lg font-bold text-[#E6F2EE]">
            {cells.length > 0 ? Math.round((scannedCount / cells.length) * 100) : 0}%
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
          <span className="text-[11px] text-[#7F9E96] block uppercase">Healthy Cells</span>
          <span className="text-lg font-bold text-[#10B981]">{healthyCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
          <span className="text-[11px] text-[#7F9E96] block uppercase">Problem Zones</span>
          <span className="text-lg font-bold text-rose-400">{problemCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
          <span className="text-[11px] text-[#7F9E96] block uppercase">Avg Soil Moisture</span>
          <span className="text-lg font-bold text-[#06B6D4]">
            {scannedCount > 0 ? `${avgMoisture}%` : '–'}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[#0B0F0E] border border-[#1C2D27] col-span-2 sm:col-span-1">
          <span className="text-[11px] text-[#7F9E96] block uppercase">Field Area</span>
          <span className="text-lg font-bold text-[#E6F2EE]">
            {(cols * 0.5).toFixed(1)} × {(rows * 0.5).toFixed(1)} m
          </span>
        </div>
      </div>

      {/* Main Grid Viewport and Live Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Field Map with Rover Path (8 cols) */}
        <div className="lg:col-span-8 bg-[#0B0F0E] p-4 rounded-xl border border-[#1C2D27] flex flex-col">
          <div className="relative w-full aspect-[8/6] max-h-[460px] my-auto">
            
            {/* Grid Container */}
            <div 
              className="grid gap-1.5 w-full h-full"
              style={{ 
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`
              }}
            >
              {cells.map((cell, idx) => {
                const isBad = cell.m < dryThreshold || cell.h > hardThreshold;
                let bg = 'bg-[#16221E] text-[#526E67]'; // unscanned

                if (cell.done) {
                  bg = isBad ? 'bg-rose-950/70 border-rose-500/50 text-rose-300' : 'bg-emerald-950/70 border-[#10B981]/50 text-emerald-300';
                }

                const isSelected = selectedCellIdx === idx;
                const isRoverHere = currentCell && currentCell.r === cell.r && currentCell.c === cell.c;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedCellIdx(idx)}
                    className={`rounded-lg border flex flex-col items-center justify-center font-mono text-[10px] sm:text-xs font-semibold cursor-pointer transition-all relative select-none ${bg} ${
                      isSelected ? 'ring-2 ring-white scale-105 z-20' : 'border-[#1C2D27]/80 hover:border-[#7F9E96]'
                    }`}
                  >
                    <span>{cellName(cell)}</span>
                    {cell.done && (
                      <span className="text-[9px] font-normal opacity-80 mt-0.5">
                        {Math.round(cell.m)}%
                      </span>
                    )}

                    {isRoverHere && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-5 h-5 rounded-full bg-cyan-400/30 animate-ping absolute" />
                        <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 ring-2 ring-white z-30" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SVG Path Overlay */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              viewBox={`0 0 ${cols} ${rows}`}
              preserveAspectRatio="none"
            >
              {polylinePoints.length > 1 && (
                <polyline
                  points={polylinePoints.join(' ')}
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="0.08"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.1 0.05"
                />
              )}
            </svg>

          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#1C2D27] mt-3 text-xs font-mono text-[#7F9E96]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-950 border border-[#10B981]" />
                Healthy (Good)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-950 border border-rose-500" />
                Dry or Compacted
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#16221E] border border-[#1C2D27]" />
                Unscanned
              </span>
            </div>
            <span className="text-[11px] text-[#526E67]">
              Tap any cell to inspect soil profile
            </span>
          </div>
        </div>

        {/* Right Column: Rover Telemetry & Cell Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Selected Cell or Current Live Probe */}
          <div className="p-4 rounded-xl bg-[#0B0F0E] border border-[#1C2D27] font-mono">
            <span className="text-[11px] text-[#7F9E96] uppercase tracking-wider block">
              {selectedCell ? `Selected Zone: ${cellName(selectedCell)}` : 'Live Rover Head Telemetry'}
            </span>

            {selectedCell || currentCell ? (
              (() => {
                const target = selectedCell || currentCell!;
                const bad = target.m < dryThreshold || target.h > hardThreshold;
                return (
                  <div className="mt-3 space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#1C2D27]">
                      <span className="text-[#7F9E96]">Coordinates:</span>
                      <span className="text-[#E6F2EE] font-semibold">
                        {cellName(target)} ({target.c * 50}, {target.r * 50} cm)
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1C2D27]">
                      <span className="text-[#7F9E96]">Soil Moisture:</span>
                      <span className={`font-bold ${target.m < dryThreshold ? 'text-rose-400' : 'text-[#10B981]'}`}>
                        {target.m.toFixed(1)}% {target.m < dryThreshold ? '(Dry)' : '(Adequate)'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1C2D27]">
                      <span className="text-[#7F9E96]">Soil Hardness:</span>
                      <span className={`font-bold ${target.h > hardThreshold ? 'text-rose-400' : 'text-[#06B6D4]'}`}>
                        {target.h.toFixed(0)}/100 {target.h > hardThreshold ? '(Compacted)' : '(Loose)'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1C2D27]">
                      <span className="text-[#7F9E96]">Subsurface Temp:</span>
                      <span className="text-amber-400 font-semibold">{target.t.toFixed(1)} °C</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#7F9E96]">Status:</span>
                      <span className={`font-bold ${bad ? 'text-rose-400' : 'text-[#10B981]'}`}>
                        {bad ? (target.m < dryThreshold ? 'NEEDS WATER' : 'AERATION NEEDED') : 'HEALTHY'}
                      </span>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="py-6 text-center text-xs text-[#526E67]">
                Click "Start Rover Scan" or tap any map cell to view telemetry.
              </div>
            )}
          </div>

          {/* Threshold Calibration Sliders */}
          <div className="p-4 rounded-xl bg-[#0B0F0E] border border-[#1C2D27] text-xs font-mono space-y-3">
            <span className="text-[11px] text-[#7F9E96] uppercase tracking-wider block">
              Agronomic Thresholds
            </span>

            <div>
              <div className="flex justify-between text-[#E6F2EE] mb-1">
                <span>Dry soil trigger:</span>
                <span className="font-bold text-rose-400">&lt; {dryThreshold}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                value={dryThreshold}
                onChange={(e) => setDryThreshold(Number(e.target.value))}
                className="w-full accent-rose-400 bg-[#16221E] h-1.5 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#E6F2EE] mb-1">
                <span>Hard soil compaction:</span>
                <span className="font-bold text-amber-400">&gt; {hardThreshold}/100</span>
              </div>
              <input
                type="range"
                min="40"
                max="90"
                value={hardThreshold}
                onChange={(e) => setHardThreshold(Number(e.target.value))}
                className="w-full accent-amber-400 bg-[#16221E] h-1.5 rounded"
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
