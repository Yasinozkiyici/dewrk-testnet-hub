'use client';

const STORAGE_KEYS = {
  session: 'dewrk_session_id'
} as const;

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    const cached = window.localStorage.getItem(STORAGE_KEYS.session);
    if (cached) return cached;
    const generated = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(STORAGE_KEYS.session, generated);
    return generated;
  } catch {
    return 'anonymous';
  }
}

async function postEvent(eventName: string, payload?: Record<string, unknown>) {
  try {
    const body = {
      eventName,
      payload: {
        ...(payload ?? {}),
        sessionId: getSessionId()
      },
      referrer: typeof document !== 'undefined' ? document.referrer : undefined
    };

    const endpoint = '/api/events';

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
      const ok = navigator.sendBeacon(endpoint, blob);
      if (ok) return;
    }

    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (error) {
    console.warn('[analytics] Failed to send event', error);
  }
}

export function trackEvent(eventName: string, payload?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  postEvent(eventName, payload).catch(() => {
    /* swallow */
  });
}

export function trackNewsletterSignup(email: string) {
  if (typeof window === 'undefined') return;
  const normalised = email.trim().toLowerCase();
  if (!normalised) return;
  if (window.crypto?.subtle) {
    const encoder = new TextEncoder();
    window.crypto.subtle
      .digest('SHA-256', encoder.encode(normalised))
      .then((buffer) => {
        const hashArray = Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0'));
        trackEvent('newsletter_signup', {
          emailHash: hashArray.join('')
        });
      })
      .catch(() => {
        trackEvent('newsletter_signup', { emailHash: normalised });
      });
  } else {
    trackEvent('newsletter_signup', { emailHash: normalised });
  }
}

export function trackJoinTestnet(slug: string, name: string) {
  trackEvent('join_testnet', { testnetSlug: slug, testnetName: name });
}

export function trackReadGuide(slug: string, title: string) {
  trackEvent('read_guide', { guideSlug: slug, guideTitle: title });
}

export function trackOpenDashboard() {
  trackEvent('open_dashboard');
}
