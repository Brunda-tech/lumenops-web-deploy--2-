import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

const ADMIN_ACCOUNTS = [
  {
    email: 'admin@bescom.gov.in',
    password: 'BESCOM@2026',
    user: {
      id: 'ADM-BLR-01',
      email: 'admin@bescom.gov.in',
      name: 'R. Venkatesh',
      role: 'Chief Control Room Dispatcher',
      division: 'Bengaluru Metro & Regional Circles',
    },
  },
  {
    email: 'dispatcher@bescom.gov.in',
    password: 'LUMEN@2026',
    user: {
      id: 'ADM-BLR-02',
      email: 'dispatcher@bescom.gov.in',
      name: 'A. Nandini',
      role: 'Subdivision Operations Officer',
      division: 'Bengaluru East & South',
    },
  },
];

const activeSessions = new Map<string, (typeof ADMIN_ACCOUNTS)[number]['user']>();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'LumenOps', timestamp: new Date().toISOString() });
  });

  app.post('/api/auth/login', (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const account = ADMIN_ACCOUNTS.find((a) => a.email === email && a.password === password);
    if (!account) {
      res.status(401).json({ error: 'Invalid Operator ID or password' });
      return;
    }
    const token = crypto.randomBytes(24).toString('hex');
    activeSessions.set(token, account.user);
    res.json({ token, user: account.user });
  });

  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      activeSessions.delete(authHeader.slice(7));
    }
    res.json({ ok: true });
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LumenOps server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
