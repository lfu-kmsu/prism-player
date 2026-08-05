import { Vibrant } from 'node-vibrant/browser';

interface CoverPalette {
  accent: string; // solid color
  gradientBg: string; // multi-color CSS gradient
}

const cache = new Map<string, CoverPalette>();
const FALLBACK: CoverPalette = {
  accent: '#f5c2e7', // FALLBACK (never used due to placeholder cover)
  gradientBg: 'linear-gradient(from 90deg, #f5c2e7, #cba6f7, #89b4fa, #f5c2e7)',
};

// Forces color into guaranteed-readable band (regardless of source extremity)
function normalizeAccent(hex: string, isDark: boolean): string {
  const { h, s, l } = hexToHsl(hex);
  const clampedL = isDark ? Math.min(Math.max(l, 60), 80) : Math.min(Math.max(l, 40), 65);
  const boostedS = Math.max(s, 55);
  return hslToHex(h, boostedS, clampedL);
}

export async function extractPalette(imageUrl: string, isDark: boolean): Promise<CoverPalette> {
  const cacheKey = `${imageUrl}:${isDark}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  try {
    const palette = await Vibrant.from(imageUrl).getPalette();

    const accentSource = isDark
      ? (palette.LightVibrant?.hex ??
        palette.LightMuted?.hex ??
        palette.Vibrant?.hex ??
        FALLBACK.accent)
      : (palette.Vibrant?.hex ??
        palette.LightVibrant?.hex ??
        palette.Muted?.hex ??
        FALLBACK.accent);

    const accent = normalizeAccent(accentSource, isDark);

    const gradientColors = [
      palette.Vibrant,
      palette.LightVibrant,
      palette.DarkVibrant,
      palette.Muted,
    ]
      .filter((s): s is NonNullable<typeof s> => !!s)
      .map(s => s.hex);

    const gradientBg =
      gradientColors.length >= 2
        ? `linear-gradient(to right, ${gradientColors.join(', ')})`
        : FALLBACK.gradientBg;

    const result: CoverPalette = { accent, gradientBg };
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Palette extraction failed:', err);
    return FALLBACK;
  }
}

// --- small self-contained HSL helpers, no extra dependency needed ---
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}
