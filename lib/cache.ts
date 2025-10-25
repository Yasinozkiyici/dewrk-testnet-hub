import { revalidateTag } from 'next/cache';

export const TESTNETS_TAG = 'testnets';

export function testnetTag(slug: string) {
  return `testnet:${slug}`;
}

export async function revalidateTestnetsList() {
  await revalidateTag(TESTNETS_TAG);
}

export async function revalidateTestnet(slug: string) {
  await revalidateTag(testnetTag(slug));
}
