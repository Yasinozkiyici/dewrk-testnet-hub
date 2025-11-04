import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getMailchimpEndpoint() {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  if (!apiKey || !listId) return null;

  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX ?? apiKey.split('-')[1];
  if (!serverPrefix) return null;

  return {
    url: `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`,
    apiKey
  };
}

async function subscribeWithMailchimp(email: string) {
  const endpoint = getMailchimpEndpoint();
  if (!endpoint) {
    return { ok: false, status: 0 } as const;
  }

  const response = await fetch(endpoint.url, {
    method: 'POST',
    headers: {
      Authorization: `apikey ${endpoint.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email_address: email, status: 'subscribed' })
  });

  return { ok: response.ok, status: response.status } as const;
}

async function subscribeWithSubstack(email: string) {
  const apiKey = process.env.SUBSTACK_API_KEY;
  if (!apiKey) {
    return { ok: false, status: 0 } as const;
  }

  const response = await fetch('https://api.substack.com/v1/subscribe', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });

  return { ok: response.ok, status: response.status } as const;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json().catch(() => ({ email: '' }));

    if (typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailHash = createHash('sha256').update(normalizedEmail).digest('hex');

    let provider: 'mailchimp' | 'substack' | 'fallback' = 'fallback';
    let subscribed = false;

    const mailchimpResult = await subscribeWithMailchimp(normalizedEmail);
    if (mailchimpResult.ok) {
      provider = 'mailchimp';
      subscribed = true;
    } else {
      const substackResult = await subscribeWithSubstack(normalizedEmail);
      if (substackResult.ok) {
        provider = 'substack';
        subscribed = true;
      }
    }

    if (!subscribed) {
      return NextResponse.json({ error: 'Subscription failed' }, { status: 502 });
    }

    await prisma.newsletterSubscription.upsert({
      where: { email: emailHash },
      update: {
        status: 'subscribed',
        source: provider
      },
      create: {
        email: emailHash,
        status: 'subscribed',
        source: provider
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/newsletter]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
