import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as QRCode from 'qrcode';
import * as path from 'path';
import * as fs from 'fs';
import pino from 'pino';

interface SellerSession {
  socket: WASocket | null;
  status: 'connected' | 'disconnected' | 'qr_pending';
  phoneNumber?: string;
  qrResolve?: (qr: string) => void;
  qrReject?: (err: Error) => void;
  onMessage?: (from: string, text: string, messageId: string) => void;
  onStatusChange?: (status: 'connected' | 'disconnected' | 'qr_pending', phoneNumber?: string) => void;
}

export class SessionManager {
  private sessions = new Map<string, SellerSession>();
  private credsDir: string;
  private logger = pino({ level: 'info' });

  constructor(credsDir: string) {
    this.credsDir = credsDir;
    if (!fs.existsSync(credsDir)) {
      fs.mkdirSync(credsDir, { recursive: true });
    }
  }

  async generateQR(sellerId: string): Promise<string> {
    // If already connected, throw
    const existing = this.sessions.get(sellerId);
    if (existing?.status === 'connected') {
      throw new Error('Already connected');
    }

    // Create auth state directory for this seller
    const authDir = path.join(this.credsDir, sellerId);
    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    const { version } = await fetchLatestBaileysVersion();

    return new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('QR code generation timed out'));
      }, 180000); // 3 minutes

      const session: SellerSession = {
        socket: null,
        status: 'qr_pending',
        qrResolve: resolve,
        qrReject: reject,
      };
      this.sessions.set(sellerId, session);

      const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        browser: ['ma5zani', 'Chrome', '1.0.0'],
        logger: this.logger.child({ seller: sellerId }),
      });

      session.socket = sock;

      sock.ev.on('creds.update', saveCreds);

      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          // Generate QR as data URL
          try {
            const qrDataUrl = await QRCode.toDataURL(qr);
            session.status = 'qr_pending';
            if (session.qrResolve) {
              session.qrResolve(qrDataUrl);
              session.qrResolve = undefined; // Only resolve once
            }
          } catch (err) {
            this.logger.error(err, 'Failed to generate QR image');
          }
        }

        if (connection === 'open') {
          clearTimeout(timeout);
          session.status = 'connected';
          session.phoneNumber = sock.user?.id?.split(':')[0];
          this.logger.info(
            { sellerId, phone: session.phoneNumber },
            'WhatsApp connected'
          );
          // Resolve the promise if it hasn't been resolved yet (restore case — no QR)
          if (session.qrResolve) {
            session.qrResolve('connected');
            session.qrResolve = undefined;
          }
          if (session.onStatusChange) {
            session.onStatusChange('connected', session.phoneNumber);
          }
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output
            ?.statusCode;
          const shouldReconnect =
            statusCode !== DisconnectReason.loggedOut;

          if (shouldReconnect) {
            this.logger.info({ sellerId, statusCode }, 'Reconnecting...');
            // Reconnect after a short delay
            setTimeout(() => this.reconnect(sellerId), 3000);
          } else {
            session.status = 'disconnected';
            this.logger.info({ sellerId }, 'Logged out, clearing session');
            // Clear credentials on logout
            if (fs.existsSync(authDir)) {
              fs.rmSync(authDir, { recursive: true, force: true });
            }
          }
        }
      });

      // Listen for incoming messages
      sock.ev.on('messages.upsert', async ({ messages: msgs, type }) => {
        if (type !== 'notify') return;

        for (const msg of msgs) {
          if (msg.key.fromMe) continue; // Skip own messages

          const from = msg.key.remoteJid;
          if (!from) continue;

          // Extract text content
          const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            '';

          if (!text) continue;

          // Forward to callback
          if (session.onMessage) {
            session.onMessage(from, text, msg.key.id || '');
          }
        }
      });
    });
  }

  private async reconnect(sellerId: string) {
    try {
      await this.generateQR(sellerId);
    } catch (err) {
      this.logger.error(err, 'Failed to reconnect');
    }
  }

  async sendMessage(sellerId: string, to: string, text: string) {
    const session = this.sessions.get(sellerId);
    if (!session?.socket || session.status !== 'connected') {
      throw new Error('Not connected');
    }

    // Normalize phone number to JID
    const jid = to.includes('@')
      ? to
      : `${to.replace(/\+/g, '')}@s.whatsapp.net`;

    const result = await session.socket.sendMessage(jid, { text });
    return { messageId: result?.key?.id };
  }

  getStatus(sellerId: string) {
    const session = this.sessions.get(sellerId);
    if (!session) {
      return { status: 'disconnected' as const, phoneNumber: undefined };
    }
    return {
      status: session.status,
      phoneNumber: session.phoneNumber,
    };
  }

  async disconnect(sellerId: string) {
    const session = this.sessions.get(sellerId);
    if (session?.socket) {
      await session.socket.logout();
      session.socket = null;
      session.status = 'disconnected';
    }
    this.sessions.delete(sellerId);
  }

  setMessageHandler(
    sellerId: string,
    handler: (from: string, text: string, messageId: string) => void
  ) {
    const session = this.sessions.get(sellerId);
    if (session) {
      session.onMessage = handler;
    }
  }

  setStatusHandler(
    sellerId: string,
    handler: (status: 'connected' | 'disconnected' | 'qr_pending', phoneNumber?: string) => void
  ) {
    const session = this.sessions.get(sellerId);
    if (session) {
      session.onStatusChange = handler;
    }
  }

  // Restore sessions from saved credentials on startup
  async restoreSessions(
    onMessage: (
      sellerId: string,
      from: string,
      text: string,
      messageId: string
    ) => void
  ) {
    if (!fs.existsSync(this.credsDir)) return;

    const sellers = fs.readdirSync(this.credsDir).filter((f) => {
      return fs.statSync(path.join(this.credsDir, f)).isDirectory();
    });

    for (const sellerId of sellers) {
      try {
        this.logger.info({ sellerId }, 'Restoring WhatsApp session');
        await this.generateQR(sellerId);
        this.setMessageHandler(sellerId, (from, text, msgId) => {
          onMessage(sellerId, from, text, msgId);
        });
      } catch (err) {
        this.logger.error(err, `Failed to restore session for ${sellerId}`);
      }
    }
  }
}
