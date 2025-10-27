type LogoInputs = {
  primary?: string | null;
  websiteUrl?: string | null;
  githubUrl?: string | null;
};

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function buildLogoCandidates({ primary, websiteUrl, githubUrl }: LogoInputs) {
  const candidates = new Set<string>();

  const push = (candidate?: string | null) => {
    if (!candidate || !candidate.trim()) return;
    try {
      const url = new URL(candidate, candidate.startsWith('http') ? undefined : 'https://');
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        candidates.add(url.toString());
      }
    } catch {
      // ignore invalid candidate
    }
  };

  push(primary ?? undefined);

  if (websiteUrl) {
    try {
      const parsed = new URL(websiteUrl, websiteUrl.startsWith('http') ? undefined : 'https://');
      push(`${parsed.origin}/favicon.ico`);
    } catch {
      // ignore invalid website urls
    }
  }

  if (githubUrl) {
    try {
      const parsed = new URL(githubUrl);
      const segments = parsed.pathname.split('/').filter(Boolean);
      const owner = segments[0];
      if (owner) {
        push(`https://github.com/${owner}.png`);
      }
    } catch {
      // ignore invalid github urls
    }
  }

  return Array.from(candidates);
}

export function monogramFor(name: string, seed: string) {
  const initials = name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  const fallback = seed.slice(0, 2).toUpperCase() || 'DW';
  const label = initials || fallback;

  const hash = hashString(seed || name || fallback);
  const hue = hash % 360;
  const secondaryHue = (hue + 35) % 360;
  const gradient = `linear-gradient(135deg, hsl(${hue}, 70%, 60%) 0%, hsl(${secondaryHue}, 65%, 55%) 100%)`;

  return { label, gradient };
}
