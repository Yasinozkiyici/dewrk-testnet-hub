'use client';

import { useEffect } from 'react';
import { getSyncedReferral, markReferralSynced, parseReferral } from '@/lib/referrals';

export function ReferralTracker() {
  useEffect(() => {
    const ref = parseReferral();
    if (!ref) return;

    const alreadySynced = getSyncedReferral();
    if (alreadySynced === ref) return;

    fetch('/api/referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref })
    })
      .then((response) => {
        if (response.ok) {
          markReferralSynced(ref);
        }
      })
      .catch((error) => {
        console.warn('[referrals] Failed to log referral', error);
      });
  }, []);

  return null;
}
