import { revalidateTag } from 'next/cache';

export const TESTNETS_TAG = 'testnets';

export function testnetTag(slug: string) {
  return `testnet:${slug}`;
}

export function safeRevalidateTag(tag: string) {
  try {
    revalidateTag(tag);
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[cache] Failed to revalidate tag', tag, error);
    }
  }
}

export async function revalidateTestnetsList() {
  safeRevalidateTag(TESTNETS_TAG);
}

export async function revalidateTestnet(slug: string) {
  safeRevalidateTag(testnetTag(slug));
}
