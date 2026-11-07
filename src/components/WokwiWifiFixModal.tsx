import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Code2, 
  HelpCircle,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { WOKWI_PROJECT_URL, WOKWI_PROJECT_ID } from '../services/sensorService';

export const WokwiWifiFixModal: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState(false);

  const fixedWiFiCodeSnippet = `// ---------- FIXED WI-FI SERVICE CODE FOR WOKWI ----------
// Problem: WiFi.begin(WIFI_SSID, WIFI_PASSWORD, 6) passes channel 6, which causes
// channel negotiation mismatch in Wokwi's virtual AP.
// Furthermore, calling WiFi.begin() repeatedly interrupts active DHCP handshakes.

void serviceWiFi() {
  wl_status_t status = WiFi.status();
  
  // 1. If already connected, print IP once and return
  if (status == WL_CONNECTED) {
    if (!wifiEverConnected) {
      wifiEverConnected = true;
      Serial.print("Wi-Fi connected! Local IP: ");
      Serial.println(WiFi.localIP());
    }
    return;
  }

  // 2. If association or DHCP is still in progress, do not reset the modem!
  if (status == WL_IDLE_STATUS || status == WL_SCAN_COMPLETED) {
    return;
  }

  if (mqtt.connected()) mqtt.disconnect();

  const uint32_t now = millis();
  if (now - lastWifiAttemptMs < WIFI_RETRY_MS) return;
  lastWifiAttemptMs = now;

  Serial.println("Wi-Fi disconnected; attempting reconnection to Wokwi-GUEST...");
  
  WiFi.disconnect(true);
  delay(100);
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  // FIX: Remove the hardcoded channel 6. Let ESP32 auto-scan Wokwi-GUEST!
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fixedWiFiCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-[#111A17] border border-[#1C2D27] rounded-2xl p-6 font-mono text-xs">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#1C2D27]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#E6F2EE] text-sm">
                Wokwi Wi-Fi Reconnect Diagnostic &amp; Solution
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                DIAGNOSTIC GUIDE
              </span>
            </div>
            <span className="text-[#7F9E96] text-[11px]">
              Why Wokwi shows "Wi-Fi disconnected; reconnect attempt started" and how to fix it
            </span>
          </div>
        </div>

        <a
          href={WOKWI_PROJECT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg bg-[#16221E] hover:bg-[#1F332C] text-[#E6F2EE] border border-[#1C2D27] flex items-center gap-1.5 transition-colors"
        >
          <span>Open Wokwi Project</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#10B981]" />
        </a>
      </div>

      {/* 3 Core Causes Explained */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
        
        {/* Cause 1 */}
        <div className="p-4 rounded-xl bg-[#0B0F0E] border border-[#1C2D27] space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>1. Hardcoded Channel 6 Mismatch</span>
          </div>
          <p className="text-[#7F9E96] leading-relaxed">
            In <code className="text-[#E6F2EE]">sketch.ino</code> line 341, the code calls <code className="text-amber-300">WiFi.begin(WIFI_SSID, WIFI_PASSWORD, 6)</code>. Forcing channel 6 causes channel negotiation failure if Wokwi's virtual AP operates on a different frequency.
          </p>
          <span className="text-[11px] text-[#10B981] font-semibold block">
            Fix: Use WiFi.begin(WIFI_SSID, "") without channel 6.
          </span>
        </div>

        {/* Cause 2 */}
        <div className="p-4 rounded-xl bg-[#0B0F0E] border border-[#1C2D27] space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <RefreshCw className="w-4 h-4" />
            <span>2. Reconnect Timer Interruption</span>
          </div>
          <p className="text-[#7F9E96] leading-relaxed">
            Every 10 seconds, <code className="text-[#E6F2EE]">serviceWiFi()</code> calls <code className="text-amber-300">WiFi.begin()</code> again. If DHCP takes 4–5 seconds in Wokwi, calling <code className="text-amber-300">begin()</code> aborts the existing handshake and triggers another reconnect loop.
          </p>
          <span className="text-[11px] text-[#10B981] font-semibold block">
            Fix: Check if status == WL_IDLE_STATUS before resetting.
          </span>
        </div>

        {/* Cause 3 */}
        <div className="p-4 rounded-xl bg-[#0B0F0E] border border-[#1C2D27] space-y-2">
          <div className="flex items-center gap-2 text-[#06B6D4] font-bold">
            <Wifi className="w-4 h-4" />
            <span>3. Wokwi Network Access Feature</span>
          </div>
          <p className="text-[#7F9E96] leading-relaxed">
            Wokwi requires internet access enabled for simulations to reach the public MQTT broker (<code className="text-[#E6F2EE]">broker.hivemq.com</code>). In anonymous browser sessions, Wokwi blocks outbound TCP sockets.
          </p>
          <span className="text-[11px] text-[#10B981] font-semibold block">
            Fix: Log in to Wokwi or use our built-in Dashboard Digital Twin!
          </span>
        </div>

      </div>

      {/* Critical Reassurance: Local Control Works 100% */}
      <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-start gap-3 my-4">
        <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#E6F2EE] text-sm block">
            Important Stage 4 Principle: Local Irrigation &amp; Interlocks Still Work 100%!
          </span>
          <p className="text-[#7F9E96] mt-1 leading-relaxed">
            As specified in the official repository architecture: <strong className="text-[#E6F2EE]">"Network outages must never disable local sensing, irrigation, or the tank interlock."</strong> Even while Wi-Fi is retrying, turning the soil potentiometer &lt; 30% in Wokwi <strong className="text-[#10B981]">instantly activates the green LED and relay</strong>, and dropping water &lt; 15% <strong className="text-rose-400">immediately trips the lockout</strong>!
          </p>
        </div>
      </div>

      {/* Fixed Code Snippet with 1-Click Copy */}
      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#E6F2EE] flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#06B6D4]" />
            <span>Drop-in Replacement for serviceWiFi() in sketch.ino:</span>
          </span>

          <button
            onClick={copyToClipboard}
            className="px-3 py-1.5 rounded-lg bg-[#10B981] text-[#0B0F0E] font-bold flex items-center gap-1.5 hover:bg-[#059669] transition-colors"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'COPIED TO CLIPBOARD' : 'COPY FIXED CODE'}</span>
          </button>
        </div>

        <div className="bg-[#070A09] p-4 rounded-xl border border-[#1C2D27] overflow-x-auto text-[11px] text-[#7F9E96] leading-relaxed">
          <pre>{fixedWiFiCodeSnippet}</pre>
        </div>
      </div>

      {/* 3 Step Action Plan */}
      <div className="mt-5 p-4 rounded-xl bg-[#0B0F0E] border border-[#1C2D27]">
        <span className="font-bold text-[#E6F2EE] block mb-2">How to Apply in 30 Seconds:</span>
        <ol className="space-y-1.5 text-[#7F9E96] list-decimal list-inside leading-relaxed">
          <li>Click <strong className="text-[#E6F2EE]">"Copy Fixed Code"</strong> above.</li>
          <li>Open your Wokwi project at <a href={WOKWI_PROJECT_URL} target="_blank" rel="noopener noreferrer" className="text-[#06B6D4] underline">wokwi.com/projects/{WOKWI_PROJECT_ID}</a>.</li>
          <li>In <code className="text-[#E6F2EE]">sketch.ino</code>, replace the existing <code className="text-[#E6F2EE]">serviceWiFi()</code> function with this fixed code, then restart the simulation!</li>
        </ol>
      </div>

    </div>
  );
};
