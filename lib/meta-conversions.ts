import crypto from 'node:crypto';

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '1343395010814971';
const META_ACCESS_TOKEN = process.env.META_CONVERSIONS_ACCESS_TOKEN;
const GRAPH_API_URL = `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events`;

/**
 * SHA-256 hash a value (lowercase, trimmed) per Meta requirements.
 */
function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
}

interface ServerEvent {
  eventName: string;
  eventId: string;
  eventTime?: number;
  sourceUrl: string;
  userData?: UserData;
  customData?: Record<string, unknown>;
}

/**
 * Send an event to Meta Conversions API (server-side).
 */
export async function sendConversionsEvent(event: ServerEvent): Promise<{ success: boolean; error?: string }> {
  if (!META_ACCESS_TOKEN) {
    return { success: false, error: 'META_CONVERSIONS_ACCESS_TOKEN not configured' };
  }

  const userData: Record<string, string> = {};

  if (event.userData) {
    if (event.userData.email) userData.em = hashValue(event.userData.email);
    if (event.userData.phone) userData.ph = hashValue(event.userData.phone);
    if (event.userData.firstName) userData.fn = hashValue(event.userData.firstName);
    if (event.userData.lastName) userData.ln = hashValue(event.userData.lastName);
    if (event.userData.clientIpAddress) userData.client_ip_address = event.userData.clientIpAddress;
    if (event.userData.clientUserAgent) userData.client_user_agent = event.userData.clientUserAgent;
    if (event.userData.fbc) userData.fbc = event.userData.fbc;
    if (event.userData.fbp) userData.fbp = event.userData.fbp;
  }

  const payload = {
    data: [
      {
        event_name: event.eventName,
        event_time: event.eventTime || Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        event_source_url: event.sourceUrl,
        action_source: 'website',
        user_data: userData,
        custom_data: event.customData,
      },
    ],
  };

  try {
    const response = await fetch(`${GRAPH_API_URL}?access_token=${META_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[Meta CAPI] Error:', response.status, errorBody);
      return { success: false, error: `HTTP ${response.status}` };
    }

    return { success: true };
  } catch (err) {
    console.error('[Meta CAPI] Request failed:', err);
    return { success: false, error: 'Request failed' };
  }
}
