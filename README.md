# AQUAFORGE — HYDROSYNC
### Smart Agriculture & Automated Irrigation Monitoring System

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-emerald.svg)](https://tailwindcss.com/)
[![Wokwi Simulation](https://img.shields.io/badge/Wokwi-ESP32%20Project%20479928426260819969-brightgreen.svg)](https://wokwi.com/projects/479928426260819969)

HYDROSYNC is an industrial IoT dashboard and digital twin for precision agriculture and automated irrigation. It interfaces with an ESP32 microcontroller running Stage 4 authoritative firmware, monitoring soil moisture, reservoir levels, and ambient conditions, with live bidirectional synchronization to the Wokwi simulation platform and physical hardware over MQTT.

---

## 🌟 Key Features

1. **Authoritative Irrigation Decision Engine**:
   - `IF soil moisture < 30% AND tank level >= 15%` $\rightarrow$ **Pump = ON** (Relay closed, Green LED active on GPIO25).
   - `IF tank level < 15%` $\rightarrow$ **Pump = OFF** immediately (**Hardware Lockout & Low Water Warning**, Red LED on GPIO26).
   - `IF soil moisture >= 30%` $\rightarrow$ **Pump = OFF** (Standby).
   - Firmware remains strictly authoritative: safety interlocks run locally on the ESP32.

2. **Wokwi Project #479928426260819969 Direct Sync**:
   - Embedded interactive simulation window with live component interaction.
   - Real-time MQTT over WebSocket connection to HiveMQ (`wss://broker.hivemq.com:8884/mqtt`).
   - Interactive Digital Twin testbench to simulate potentiometer twists and switch toggles offline.

3. **High-Precision Sensor Cards**:
   - **Soil Moisture**: Real-time percentage with custom circular SVG gauge and DRY / MODERATE / MOIST classification.
   - **Water Tank Level**: Vertical reservoir visualization with 15% critical cutoff marker and LOW / NORMAL status.
   - **Temperature**: °C reading with live sparkline history from DHT22 (GPIO15).
   - **Humidity**: Relative humidity % with live sparkline history.

4. **Real-Time Telemetry Analytics**:
   - Recharts dual-trend graphs for Soil & Tank levels (%) and Temperature & Humidity (°C / %).
   - Configurable time horizons: **1 Minute**, **5 Minutes**, **30 Minutes**.

5. **Autonomous Field Rover Grid**:
   - 50 × 50 cm cell scanning grid with boustrophedon traversal path.
   - Soil compaction hardness index and moisture heatmapping.

6. **Hardware Health & Diagnostics**:
   - Live status of ESP32 MCU, DHT22, capacitive soil probe, tank sensor, pump relay, MicroSD logger (`/hydrosync_log.csv`), and Wi-Fi / MQTT telemetry.

7. **MicroSD CSV Log Export**:
   - Instant export of sensor history formatted to match the ESP32 FAT32 SD logger schema.

---

## 📁 Project Structure

```
├── index.html                   # HTML entry point with Inter & JetBrains Mono fonts
├── metadata.json                # Project identity and capabilities
├── package.json                 # Dependencies (React 19, Tailwind v4, Recharts, Lucide, MQTT)
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite bundler configuration
├── src/
│   ├── App.tsx                  # Master dashboard container and tab router
│   ├── main.tsx                 # React DOM mount point
│   ├── index.css                # Tailwind CSS v4 styling & dark theme variables
│   ├── types/
│   │   └── telemetry.ts         # TypeScript interfaces for telemetry, health, alerts
│   ├── services/
│   │   ├── irrigationLogic.ts   # Authoritative irrigation logic & interlocks
│   │   └── sensorService.ts     # MQTT over WebSocket, demo simulator & digital twin
│   ├── hooks/
│   │   └── useSensorData.ts     # React hook for data streaming & history buffering
│   └── components/
│       ├── Header.tsx           # Brand mark, status badges, mode toggles, tabs
│       ├── SensorCard.tsx       # 4 Sensor cards with circular gauges & sparklines
│       ├── IrrigationPanel.tsx  # Pump status, glowing LED indicator, interlock banner
│       ├── Analytics.tsx        # Recharts real-time line charts (1m/5m/30m)
│       ├── SystemHealth.tsx     # Hardware diagnostics, pin mappings & uptime
│       ├── AlertPanel.tsx       # Filterable event log with audio toggle
│       ├── WokwiSyncPanel.tsx   # Wokwi simulation iframe & digital twin testbench
│       ├── FieldRoverModal.tsx  # 50x50cm field scanner from rover design
│       └── CadViewerModal.tsx   # Fusion 360 enclosure specs & BOM
└── README.md
```

---

## ⚡ Running Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm or yarn

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/hydro-sync.git
   cd hydro-sync
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local Vite development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:3000` to interact with the dashboard.

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🔌 ESP32 Hardware Integration Requirements

### Hardware Pin Mapping (Wokwi & Physical PCB)

| Component | ESP32 Pin | Signal Type | Description |
| :--- | :--- | :--- | :--- |
| **Soil Moisture Sensor** | `GPIO34` | ADC1_CH6 | 0 - 3.3V Analog (0 - 4095 raw $\rightarrow$ 0 - 100%) |
| **Water Tank Level Sensor** | `GPIO35` | ADC1_CH7 | 0 - 3.3V Analog (0 - 4095 raw $\rightarrow$ 0 - 100%) |
| **DHT22 Environmental** | `GPIO15` | Digital | Temperature (°C) & Humidity (%) |
| **Pump Indicator LED (Green)** | `GPIO25` | Output (Active High) | Illuminated when irrigation pump is active |
| **Low Tank Warning LED (Red)** | `GPIO26` | Output (Active High) | Illuminated when tank < 15% (Lockout) |
| **Pump Relay Module IN** | `GPIO22` | Output | Drives 5V optocoupled relay coil |
| **Auto/Manual Mode Switch** | `GPIO27` | Input (Pull-up) | High = AUTO, Low = MANUAL |
| **Manual Override Switch** | `GPIO14` | Input (Pull-up) | High = Request Run, Low = Request Stop |
| **MicroSD SPI Interface** | `CS: 5, SCK: 18, MISO: 19, MOSI: 23` | SPI Bus | Appends to `/hydrosync_log.csv` every 5s |

### MQTT Protocol & Topics

- **Broker**: `broker.hivemq.com` (Port 1883 for ESP32 TCP, Port 8884 for Dashboard WebSocket `wss://broker.hivemq.com:8884/mqtt`)
- **Device ID**: `aqua5-479928426260819969`
- **Topic Root**: `aquaforge/hydrosync/aqua5-479928426260819969`

#### Telemetry Topic: `.../telemetry`
Published every 5,000 ms by the ESP32:
```json
{
  "device": "aqua5-479928426260819969",
  "uptime_ms": 142500,
  "soil_pct": 28.5,
  "tank_pct": 65.0,
  "temp_c": 24.5,
  "humidity_pct": 55.0,
  "dht_ok": true,
  "mode": "AUTO",
  "manual_request": false,
  "pump": "ON",
  "tank_lockout": false,
  "sd_ok": true
}
```

The frontend also accepts standard simplified format:
```json
{
  "soilMoisture": 45,
  "tankLevel": 75,
  "temperature": 28.5,
  "humidity": 65,
  "pumpStatus": false,
  "lowTankWarning": false,
  "systemStatus": "NORMAL"
}
```

---

## 🚀 Push to GitHub Instructions

```bash
# 1. Initialize git if not already present
git init

# 2. Add all files
git add .

# 3. Commit changes
git commit -m "feat: complete AQUAFORGE HYDROSYNC production IoT dashboard"

# 4. Rename branch to main
git branch -M main

# 5. Add your remote repository URL
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 6. Push to GitHub
git push -u origin main
```

---

## ☁️ Deployment Instructions for Vercel

### Method A: Deploy via Vercel Web Dashboard (Recommended)
1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New Project"** $\rightarrow$ **"Import Git Repository"**.
4. Select your `hydro-sync` repository.
5. In **Build and Output Settings**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Click **Deploy**. Vercel will build and assign a global HTTPS production URL.

### Method B: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
# Choose project defaults and deploy!
```

---

## 📄 License
This project is licensed under the Apache 2.0 License.
