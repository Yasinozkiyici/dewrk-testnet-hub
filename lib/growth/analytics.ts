// Note: Avoid hard dependency to keep build green without google-auth-library

function normalisePrivateKey(key?: string) {
  return key?.replace(/\\n/g, '\n');
}

function fallbackForRange(range?: { startDate: string; endDate: string }) {
  if (!range || (range.startDate === 'yesterday' && range.endDate === 'yesterday')) {
    return process.env.GA_DAILY_ACTIVE_USERS;
  }

  if (range.startDate === '7daysAgo' && range.endDate === 'today') {
    return process.env.GA_WEEKLY_ACTIVE_USERS;
  }

  if (range.startDate === '14daysAgo' && range.endDate === '7daysAgo') {
    return process.env.GA_PREV_WEEK_ACTIVE_USERS;
  }

  return null;
}

export async function fetchGaActiveUsers(range?: { startDate: string; endDate: string }): Promise<number | null> {
  // GA entegrasyonu devre dışı: derleme esnasında opsiyonel bağımlılık gerektirmeden
  // çevresel fallback değerlerine dönüyoruz.
  const fallback = fallbackForRange(range);
  return fallback ? Number(fallback) : null;
}

export function fetchGaDailyActiveUsers(): Promise<number | null> {
  return fetchGaActiveUsers();
}

export async function fetchMailchimpSubscriberCount(): Promise<number | null> {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  if (!apiKey || !listId) return null;

  const prefix = process.env.MAILCHIMP_SERVER_PREFIX ?? apiKey.split('-')[1];
  if (!prefix) return null;

  try {
    const res = await fetch(`https://${prefix}.api.mailchimp.com/3.0/lists/${listId}`, {
      headers: {
        Authorization: `apikey ${apiKey}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    if (!res.ok) {
      throw new Error(`Mailchimp responded with ${res.status}`);
    }
    const payload = await res.json();
    const count = payload?.stats?.member_count;
    return typeof count === 'number' ? count : null;
  } catch (error) {
    console.warn('[growth] Mailchimp fetch failed', error);
    return null;
  }
}
