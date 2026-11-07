import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json({ limit: '4kb' }));

// In-memory data store matching GitHub backend/src/db.js
const DEVICE_ID = 'aqua5-479928426260819969';
let lastTelemetry: any = {
  device: DEVICE_ID,
  uptime_ms: 125000,
  soil_pct: 32.0,
  tank_pct: 76.0,
  temp_c: 28.5,
  humidity_pct: 65.2,
  dht_ok: true,
  mode: 'AUTO',
  manual_request: false,
  pump: 'ON',
  tank_lockout: false,
  sd_ok: true,
  received_at: new Date().toISOString()
};

const historyList: any[] = [];
// Seed initial 30 history points
for (let i = 30; i >= 0; i--) {
  const ts = Date.now() - i * 5000;
  historyList.push({
    device: DEVICE_ID,
    uptime_ms: 125000 - i * 5000,
    soil_pct: Number((32 + Math.sin(i / 3) * 8).toFixed(1)),
    tank_pct: Number((76 - i * 0.2).toFixed(1)),
    temp_c: 28.5,
    humidity_pct: 65.2,
    dht_ok: true,
    mode: 'AUTO',
    manual_request: false,
    pump: i % 4 === 0 ? 'ON' : 'OFF',
    tank_lockout: false,
    sd_ok: true,
    created_at: new Date(ts).toISOString()
  });
}

const eventsList: any[] = [
  {
    id: 1,
    device: DEVICE_ID,
    kind: 'BOOT',
    detail: 'HYDROSYNC Stage 4 firmware booted. Local control authoritative.',
    created_at: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: 2,
    device: DEVICE_ID,
    kind: 'SD_INIT',
    detail: 'MicroSD initialized; /hydrosync_log.csv opened in append mode.',
    created_at: new Date(Date.now() - 290000).toISOString()
  },
  {
    id: 3,
    device: DEVICE_ID,
    kind: 'WIFI_CONNECTED',
    detail: 'Connected to Wokwi-GUEST. IP acquired.',
    created_at: new Date(Date.now() - 280000).toISOString()
  },
  {
    id: 4,
    device: DEVICE_ID,
    kind: 'MQTT_ONLINE',
    detail: 'Broker connected; status retained as online.',
    created_at: new Date(Date.now() - 270000).toISOString()
  }
];

// Official REST API Routes from GitHub repo (backend/README.md)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    ok: true,
    device: DEVICE_ID,
    broker_connected: true,
    repo: 'https://github.com/ayankunduixb-pixel/AquaForge-HYDROSYNC-Smart-IoT-Based-Irrigation-and-Monitoring-System',
    uptime_seconds: process.uptime()
  });
});

app.get('/api/latest', (req: Request, res: Response) => {
  const ageSeconds = (Date.now() - new Date(lastTelemetry.received_at).getTime()) / 1000;
  res.json({
    ...lastTelemetry,
    is_stale: ageSeconds > 20,
    freshness_seconds: Number(ageSeconds.toFixed(1))
  });
});

app.get('/api/history', (req: Request, res: Response) => {
  const limit = Math.min(100, parseInt(req.query.limit as string) || 60);
  res.json(historyList.slice(-limit));
});

app.get('/api/events', (req: Request, res: Response) => {
  const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
  res.json(eventsList.slice(-limit));
});

app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    device: DEVICE_ID,
    status: 'online',
    last_seen: lastTelemetry.received_at
  });
});

// Telemetry POST endpoint for physical ESP32 or external script ingestion
app.post('/api/telemetry', (req: Request, res: Response) => {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  lastTelemetry = {
    ...body,
    device: body.device || DEVICE_ID,
    received_at: new Date().toISOString()
  };

  historyList.push({
    ...lastTelemetry,
    created_at: new Date().toISOString()
  });
  if (historyList.length > 200) historyList.shift();

  res.status(200).json({ ok: true, received: true });
});

async function main() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), HOST, () => {
    console.log(`AQUAFORGE HYDROSYNC running on http://${HOST}:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
