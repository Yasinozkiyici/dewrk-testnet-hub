/**
 * Logo resolution utilities with fallback chain:
 * 1) logoUrl → 2) website favicon → 3) GitHub avatar → 4) Monogram
 */

export function resolveLogo(project: {
  logoUrl?: string | null;
  websiteUrl?: string | null;
  githubUrl?: string | null;
  slug: string;
  name: string;
}): string | null {
  // 1) Direct logo URL
  if (project.logoUrl && isValidUrl(project.logoUrl)) {
    return project.logoUrl;
  }

  // 2) Website favicon
  if (project.websiteUrl && isValidUrl(project.websiteUrl)) {
    try {
      const url = new URL(project.websiteUrl);
      return `https://${url.hostname}/favicon.ico`;
    } catch {
      // Continue to next fallback
    }
  }

  // 3) GitHub org/user avatar
  if (project.githubUrl && isValidUrl(project.githubUrl)) {
    const githubAvatar = extractGitHubAvatar(project.githubUrl);
    if (githubAvatar) {
      return githubAvatar;
    }
  }

  // 4) Monogram will be rendered by component
  return null;
}

export function extractGitHubAvatar(githubUrl: string): string | null {
  try {
    const url = new URL(githubUrl);
    if (url.hostname !== 'github.com') return null;
    
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return null;
    
    const owner = parts[0];
    return `https://avatars.githubusercontent.com/${owner}?s=200&v=4`;
  } catch {
    return null;
  }
}

export function generateMonogram(name: string, slug: string): { letters: string; gradient: string } {
  // Extract first 2 letters
  const letters = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2) || slug.slice(0, 2).toUpperCase();

  // Deterministic color based on slug
  const hash = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  const saturation = 60 + (hash % 20);
  const lightness = 50 + (hash % 15);

  const gradient = `linear-gradient(135deg, 
    hsl(${hue}, ${saturation}%, ${lightness}%), 
    hsl(${(hue + 60) % 360}, ${saturation}%, ${lightness + 10}%))`;

  return { letters, gradient };
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function fetchFavicon(host: string): string {
  return `https://${host}/favicon.ico`;
}

export function buildLogoCandidates(options: {
  primary?: string;
  websiteUrl?: string;
  githubUrl?: string;
}): string[] {
  const candidates: string[] = [];

  // 1) Primary logo URL
  if (options.primary && isValidUrl(options.primary)) {
    candidates.push(options.primary);
  }

  // 2) Website favicon
  if (options.websiteUrl && isValidUrl(options.websiteUrl)) {
    try {
      const url = new URL(options.websiteUrl);
      candidates.push(`https://${url.hostname}/favicon.ico`);
    } catch {
      // Skip invalid URL
    }
  }

  // 3) GitHub avatar
  if (options.githubUrl) {
    const avatar = extractGitHubAvatar(options.githubUrl);
    if (avatar) {
      candidates.push(avatar);
    }
  }

  return candidates;
}

export function monogramFor(name: string, slug: string): { label: string; gradient: string } {
  const { letters, gradient } = generateMonogram(name, slug);
  return { label: letters, gradient };
}
