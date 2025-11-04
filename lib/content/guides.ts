import { promises as fs } from 'fs';
import path from 'path';

const GUIDES_DIR = path.join(process.cwd(), 'content', 'guides');

type Primitive = string | number | boolean | null;

function parseScalar(value: string): Primitive {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed === 'null') return null;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) return numeric;
  }
  return trimmed;
}

function parseFrontmatter(block: string): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  let currentKey: string | null = null;

  const lines = block.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) continue;

    if (line.startsWith('- ')) {
      if (!currentKey) continue;
      const arr = (data[currentKey] as Primitive[] | undefined) ?? [];
      arr.push(parseScalar(line.slice(2)));
      data[currentKey] = arr;
      continue;
    }

    if (line.startsWith('  - ') || line.startsWith('\t- ')) {
      if (!currentKey) continue;
      const arr = (data[currentKey] as Primitive[] | undefined) ?? [];
      const entry = line.replace(/^\s*-\s*/, '');
      arr.push(parseScalar(entry));
      data[currentKey] = arr;
      continue;
    }

    const keyMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!keyMatch) continue;
    const [, key, valueSection] = keyMatch;
    currentKey = key;

    if (!valueSection || !valueSection.trim()) {
      data[key] = [];
      continue;
    }

    data[key] = parseScalar(valueSection);
  }

  return data;
}

function splitFrontmatter(content: string) {
  if (!content.startsWith('---')) {
    return { data: {}, body: content };
  }

  const end = content.indexOf('\n---', 3);
  if (end === -1) {
    return { data: {}, body: content };
  }

  const frontmatterBlock = content.slice(3, end).trim();
  const body = content.slice(end + 4).trimStart();
  const data = parseFrontmatter(frontmatterBlock);
  return { data, body };
}

export type GuideFrontmatter = {
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;
  author?: string;
  publishedAt?: string;
  readingTime?: number;
  tags?: string[];
  category?: string;
  featured?: boolean;
  sources?: string[];
  coverImageUrl?: string;
};

export type GuideContent = {
  frontmatter: GuideFrontmatter;
  body: string;
  raw: string;
  fileName: string;
  filePath: string;
};

function ensureArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean);
}

function toBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return undefined;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

async function readGuideFile(fileName: string): Promise<GuideContent | null> {
  if (!fileName.endsWith('.md')) return null;
  const slug = fileName.replace(/\.md$/, '');
  const filePath = path.join(GUIDES_DIR, fileName);
  const raw = await fs.readFile(filePath, 'utf8');
  const { data, body } = splitFrontmatter(raw);

  const frontmatter: GuideFrontmatter = {
    title: typeof data.title === 'string' ? data.title : slug,
    slug: typeof data.slug === 'string' ? data.slug : slug,
    description: typeof data.description === 'string' ? data.description : undefined,
    excerpt: typeof data.excerpt === 'string' ? data.excerpt : undefined,
    author: typeof data.author === 'string' ? data.author : undefined,
    publishedAt: typeof data.publishedAt === 'string' ? data.publishedAt : undefined,
    readingTime: toNumber(data.readingTime),
    tags: ensureArray(data.tags),
    category: typeof data.category === 'string' ? data.category : undefined,
    featured: toBoolean(data.featured) ?? false,
    sources: ensureArray(data.sources),
    coverImageUrl: typeof data.coverImageUrl === 'string' ? data.coverImageUrl : undefined
  };

  return { frontmatter, body, raw, fileName, filePath };
}

export async function listGuideSummaries() {
  try {
    const entries = await fs.readdir(GUIDES_DIR);
    const guides = await Promise.all(entries.map((entry) => readGuideFile(entry)));
    return guides
      .filter((guide): guide is GuideContent => Boolean(guide))
      .map((guide) => ({ ...guide.frontmatter, bodyPreview: guide.body.slice(0, 200) }));
  } catch (error) {
    console.warn('[guides] Failed to list markdown guides', error);
    return [] as Array<GuideFrontmatter & { bodyPreview?: string }>;
  }
}

export async function getGuideBySlug(slug: string): Promise<GuideContent | null> {
  try {
    const entries = await fs.readdir(GUIDES_DIR);
    const match = entries.find((entry) => entry.replace(/\.md$/, '') === slug);
    if (match) {
      return readGuideFile(match);
    }

    // Fall back to matching frontmatter slug values
    for (const entry of entries) {
      const guide = await readGuideFile(entry);
      if (guide?.frontmatter.slug === slug) {
        return guide;
      }
    }
    return null;
  } catch (error) {
    console.warn(`[guides] Failed to load markdown guide for ${slug}`, error);
    return null;
  }
}

export async function getGuideMetadata(slug: string) {
  const guide = await getGuideBySlug(slug);
  return guide?.frontmatter ?? null;
}
