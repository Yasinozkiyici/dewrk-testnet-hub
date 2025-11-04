'use client';

export function parseReferral(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref')?.trim();
    if (ref) {
      localStorage.setItem('dewrk_ref', ref);
      return ref;
    }
    return localStorage.getItem('dewrk_ref');
  } catch (error) {
    console.warn('[referrals] Failed to parse referral parameter', error);
    return null;
  }
}

export function markReferralSynced(ref: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('dewrk_ref_synced', ref);
  } catch (error) {
    console.warn('[referrals] Failed to mark referral synced', error);
  }
}

export function getSyncedReferral(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('dewrk_ref_synced');
  } catch (error) {
    console.warn('[referrals] Failed to read synced referral', error);
    return null;
  }
}
