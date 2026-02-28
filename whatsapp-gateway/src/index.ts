import express, { Request, Response, NextFunction } from 'express';
import { SessionManager } from './session-manager';
import { ConvexBridge } from './convex-bridge';

const app = express();
app.use(express.json());

// CORS - allow requests from ma5zani.com
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowed = ['https://www.ma5zani.com', 'https://ma5zani.com', 'http://localhost:3000'];
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gateway-secret');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

const sessionManager = new SessionManager(
  process.env.CREDS_DIR || './credentials'
);
const bridge = new ConvexBridge(
  process.env.CONVEX_URL || '',
  process.env.CONVEX_SITE_URL || ''
);

// Auth middleware - simple secret-based
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers['x-gateway-secret'];
  if (secret !== process.env.GATEWAY_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

app.use(authMiddleware);

// Generate QR code for seller
app.post('/api/sellers/:sellerId/qr', async (req: Request, res: Response) => {
  const sellerId = req.params.sellerId as string;
  try {
    const qrDataUrl = await sessionManager.generateQR(sellerId);
    // Notify Convex when connection status changes
    sessionManager.setStatusHandler(sellerId, async (status, phoneNumber) => {
      await bridge.updateSessionStatus(sellerId, status, phoneNumber);
    });
    // Update session status in Convex
    await bridge.updateSessionStatus(sellerId, 'qr_pending');
    res.json({ qr: qrDataUrl });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to generate QR';
    res.status(500).json({ error: message });
  }
});

// Get connection status
app.get(
  '/api/sellers/:sellerId/status',
  async (req: Request, res: Response) => {
    const sellerId = req.params.sellerId as string;
    const status = sessionManager.getStatus(sellerId);
    res.json(status);
  }
);

// Disconnect seller's WhatsApp
app.post(
  '/api/sellers/:sellerId/disconnect',
  async (req: Request, res: Response) => {
    const sellerId = req.params.sellerId as string;
    await sessionManager.disconnect(sellerId);
    await bridge.updateSessionStatus(sellerId, 'disconnected');
    res.json({ success: true });
  }
);

// Send message to WhatsApp (called by Convex/API when bot responds)
app.post(
  '/api/sellers/:sellerId/send',
  async (req: Request, res: Response) => {
    const sellerId = req.params.sellerId as string;
    const { to, text } = req.body;
    try {
      const result = await sessionManager.sendMessage(sellerId, to, text);
      res.json(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to send message';
      res.status(500).json({ error: message });
    }
  }
);

// Restore existing sessions on startup
async function init() {
  try {
    await sessionManager.restoreSessions(
      async (sellerId, from, text, _messageId) => {
        // Forward message to Convex chatbot
        const response = await bridge.handleIncomingMessage(
          sellerId,
          from,
          text
        );

        // Send AI response back via WhatsApp
        if (response) {
          try {
            await sessionManager.sendMessage(sellerId, from, response);
          } catch (err) {
            console.error('Failed to send reply:', err);
          }
        }
      }
    );
  } catch (err) {
    console.error('Failed to restore sessions:', err);
  }
}

const PORT = parseInt(process.env.PORT || '3001');
app.listen(PORT, () => {
  console.log(`WhatsApp Gateway running on port ${PORT}`);
  init();
});
