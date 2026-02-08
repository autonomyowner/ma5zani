export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '1343395010814971';

/**
 * Generate a unique event ID for deduplication between Pixel and Conversions API.
 */
export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Track a Meta Pixel event (client-side).
 * Optionally accepts an eventId for deduplication with server-side CAPI.
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (typeof window === 'undefined') return;

  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (!fbq) return;

  if (eventId) {
    fbq('track', eventName, params, { eventID: eventId });
  } else {
    fbq('track', eventName, params);
  }
}

/**
 * Send an event to the server-side Conversions API for deduplication.
 */
export async function sendServerEvent(data: {
  eventName: string;
  eventId: string;
  sourceUrl: string;
  userData?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
  customData?: Record<string, unknown>;
}) {
  try {
    await fetch('/api/meta-conversions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // Silent fail - don't block user experience for tracking
  }
}

// Standard event names
export const META_EVENTS = {
  PAGE_VIEW: 'PageView',
  VIEW_CONTENT: 'ViewContent',
  LEAD: 'Lead',
  COMPLETE_REGISTRATION: 'CompleteRegistration',
  INITIATE_CHECKOUT: 'InitiateCheckout',
  PURCHASE: 'Purchase',
} as const;
