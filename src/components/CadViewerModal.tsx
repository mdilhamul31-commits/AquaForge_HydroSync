import React, { useState } from 'react';
import { Box, Layers, ShieldCheck, Ruler, CheckCircle2, FileText, Download } from 'lucide-react';

export const CadViewerModal: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'enclosure' | 'chassis' | 'bom'>('enclosure');

  return (
    <div className="bg-[#111A17] border border-[#1C2D27] rounded-2xl p-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-[#1C2D27]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#10B981]">
              Autodesk Fusion 360
            </span>
            <span className="text-xs text-[#526E67]">·</span>
            <span className="text-xs font-mono text-[#7F9E96]">
              Mechanical &amp; Enclosure Architecture
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#E6F2EE] mt-0.5">
            HYDROSYNC Field Unit Physical CAD Specifications
          </h2>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center p-1 bg-[#0B0F0E] rounded-xl border border-[#1C2D27] text-xs font-mono">
          <button
            onClick={() => setActiveSection('enclosure')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              activeSection === 'enclosure' ? 'bg-[#10B981] text-[#0B0F0E]' : 'text-[#7F9E96]'
            }`}
          >
            IP65 Enclosure
          </button>
          <button
            onClick={() => setActiveSection('chassis')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              activeSection === 'chassis' ? 'bg-[#10B981] text-[#0B0F0E]' : 'text-[#7F9E96]'
            }`}
          >
            Probe Mounts
          </button>
          <button
            onClick={() => setActiveSection('bom')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              activeSection === 'bom' ? 'bg-[#10B981] text-[#0B0F0E]' : 'text-[#7F9E96]'
            }`}
          >
            Bill of Materials (BOM)
          </button>
        </div>
      </div>

      {/* Content Display */}
      {activeSection === 'enclosure' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-7 bg-[#0B0F0E] p-6 rounded-xl border border-[#1C2D27]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-[#06B6D4] font-semibold">
                CAD Isometric Dimension Wireframe
              </span>
              <span className="text-xs font-mono text-[#7F9E96]">160 × 110 × 60 mm</span>
            </div>

            {/* SVG Visual Representation of the Fusion 360 Enclosure */}
            <div className="w-full aspect-[16/10] bg-[#070A09] rounded-lg border border-[#1C2D27] flex items-center justify-center relative p-6 overflow-hidden">
              <svg viewBox="0 0 400 240" className="w-full h-full stroke-[#10B981] fill-none stroke-[1.5]">
                {/* Outer enclosure box isometric */}
                <polygon points="100,50 300,50 350,90 150,90" stroke="#06B6D4" strokeWidth="2" fill="#06B6D4" fillOpacity="0.04" />
                <polygon points="100,50 150,90 150,210 100,170" stroke="#06B6D4" strokeWidth="2" fill="#06B6D4" fillOpacity="0.08" />
                <polygon points="150,90 350,90 350,210 150,210" stroke="#06B6D4" strokeWidth="2" fill="#06B6D4" fillOpacity="0.06" />

                {/* PCB Standoffs */}
                <ellipse cx="200" cy="130" rx="14" ry="8" stroke="#10B981" strokeDasharray="3 3" />
                <rect x="175" y="115" width="100" height="60" stroke="#10B981" rx="4" fill="#10B981" fillOpacity="0.1" />
                <text x="185" y="148" fill="#10B981" fontSize="10" fontFamily="monospace" stroke="none">ESP32 DevKit</text>

                {/* Cable glands penetrations */}
                <circle cx="280" cy="210" r="10" stroke="#F59E0B" fill="#F59E0B" fillOpacity="0.2" />
                <text x="272" y="230" fill="#F59E0B" fontSize="9" fontFamily="monospace" stroke="none">PG7 Gland</text>

                <circle cx="220" cy="210" r="10" stroke="#F59E0B" fill="#F59E0B" fillOpacity="0.2" />
                <text x="212" y="230" fill="#F59E0B" fontSize="9" fontFamily="monospace" stroke="none">PG9 Gland</text>

                {/* Gasket groove */}
                <polyline points="104,54 296,54 346,94 154,94 104,54" stroke="#526E67" strokeDasharray="2 2" />
              </svg>

              <div className="absolute bottom-3 left-4 text-[11px] font-mono text-[#7F9E96]">
                Material: UV-stabilized Polycarbonate · Wall Thickness: 3.2 mm
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
              <span className="text-[#06B6D4] font-bold uppercase block mb-2">Ingress Protection Rating</span>
              <p className="text-[#7F9E96] leading-relaxed">
                Certified IP65 with continuous EPDM tongue-and-groove perimeter gasket seal. Protected against high-pressure water jets and windblown agricultural dust.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
              <span className="text-[#10B981] font-bold uppercase block mb-2">Thermal Management</span>
              <p className="text-[#7F9E96] leading-relaxed">
                Integrated hydrophobic vent membrane (ePTFE Gore-style plug) prevents condensation pressure buildup during day/night temperature swings from 15°C to 45°C.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
              <span className="text-amber-400 font-bold uppercase block mb-2">Mounting Bracket</span>
              <p className="text-[#7F9E96] leading-relaxed">
                Standard DIN-rail snap bracket or dual U-bolt pole clamps for 32 mm - 48 mm galvanized field irrigation pipes.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'chassis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 font-mono text-xs">
          <div className="p-5 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
            <h4 className="text-[#10B981] font-bold text-sm mb-3">1. Capacitive Soil Probe Depth Collar</h4>
            <ul className="space-y-2 text-[#7F9E96] leading-relaxed">
              <li>• Depth insertion marks: 5 cm (root zone), 10 cm, 15 cm.</li>
              <li>• Conformal coated electronics head with marine-grade 3:1 heat shrink.</li>
              <li>• 3-core shielded PTFE cable routed through PG7 IP68 compression gland.</li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
            <h4 className="text-[#06B6D4] font-bold text-sm mb-3">2. Hydrostatic Tank Level Float Mount</h4>
            <ul className="space-y-2 text-[#7F9E96] leading-relaxed">
              <li>• Suspended stainless steel counterweight for linear vertical travel.</li>
              <li>• Anti-slosh baffle chamber prevents false low-water alarms during refilling.</li>
              <li>• Calibrated 10k potentiometer with zero-play reduction pully.</li>
            </ul>
          </div>
        </div>
      )}

      {activeSection === 'bom' && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border border-[#1C2D27] rounded-xl overflow-hidden">
            <thead className="bg-[#0B0F0E] text-[#7F9E96] border-b border-[#1C2D27]">
              <tr>
                <th className="p-3">Component</th>
                <th className="p-3">Model / Rating</th>
                <th className="p-3">Wokwi ID</th>
                <th className="p-3">Pin</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2D27] bg-[#111A17] text-[#E6F2EE]">
              <tr>
                <td className="p-3 font-semibold">Microcontroller</td>
                <td className="p-3">ESP32 DevKit V1 (30-pin)</td>
                <td className="p-3 text-[#06B6D4]">esp</td>
                <td className="p-3">3.3V / GND</td>
                <td className="p-3 text-[#10B981]">Active</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Soil Sensor</td>
                <td className="p-3">Capacitive Moisture v1.2 (Potentiometer)</td>
                <td className="p-3 text-[#06B6D4]">soil</td>
                <td className="p-3">GPIO34 (ADC1_CH6)</td>
                <td className="p-3 text-[#10B981]">Calibrated</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Water Tank Sensor</td>
                <td className="p-3">Linear Float Level (Potentiometer)</td>
                <td className="p-3 text-[#06B6D4]">tank</td>
                <td className="p-3">GPIO35 (ADC1_CH7)</td>
                <td className="p-3 text-[#10B981]">Interlocked</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Temp &amp; Humidity</td>
                <td className="p-3">DHT22 Digital Sensor</td>
                <td className="p-3 text-[#06B6D4]">dht</td>
                <td className="p-3">GPIO15</td>
                <td className="p-3 text-[#10B981]">Valid</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Pump Relay</td>
                <td className="p-3">5V Optocoupled Relay Module</td>
                <td className="p-3 text-[#06B6D4]">relay</td>
                <td className="p-3">GPIO22</td>
                <td className="p-3 text-[#10B981]">Active-High</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Pump Indicator</td>
                <td className="p-3">Green 5mm LED + 220Ω</td>
                <td className="p-3 text-[#06B6D4]">pumpLed</td>
                <td className="p-3">GPIO25</td>
                <td className="p-3 text-[#10B981]">Mounted</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Low Tank Warning</td>
                <td className="p-3">Red 5mm LED + 220Ω</td>
                <td className="p-3 text-[#06B6D4]">tankLed</td>
                <td className="p-3">GPIO26</td>
                <td className="p-3 text-rose-400">Armed</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">MicroSD Logger</td>
                <td className="p-3">SPI MicroSD Card Adapter</td>
                <td className="p-3 text-[#06B6D4]">sd</td>
                <td className="p-3">GPIO5 (CS)</td>
                <td className="p-3 text-[#10B981]">FAT32</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
