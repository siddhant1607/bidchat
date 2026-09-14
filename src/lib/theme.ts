export interface M3TeamTheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
  background: string;
  onBackground: string;
}

/**
 * Calculates luminance to determine if text on this color should be light or dark
 */
function getContrastColor(hex: string): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  // Perceived brightness formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#0F172A" : "#FFFFFF"; // Dark text for bright colors like CSK yellow, white for dark like MI blue
}

/**
 * Lightens or darkens a hex color for containers/accents
 */
function adjustHex(hex: string, percent: number): string {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

/**
 * Generates an accessible, rock-solid color scheme directly from team hex color
 * Zero external dependencies — 100% reliable in all browsers.
 */
export function generateTeamTheme(sourceHex: string, isDark: boolean = false): M3TeamTheme {
  const primary = sourceHex || "#0F172A";
  const onPrimary = getContrastColor(primary);

  if (isDark) {
    return {
      primary,
      onPrimary,
      primaryContainer: adjustHex(primary, -25),
      onPrimaryContainer: getContrastColor(adjustHex(primary, -25)),
      secondary: "#94A3B8",
      onSecondary: "#0F172A",
      secondaryContainer: "#1E293B",
      onSecondaryContainer: "#F8FAFC",
      surface: "#0F172A",
      onSurface: "#F8FAFC",
      surfaceVariant: "#1E293B",
      onSurfaceVariant: "#94A3B8",
      outline: "#334155",
      background: "#090D16",
      onBackground: "#F8FAFC",
    };
  }

  return {
    primary,
    onPrimary,
    primaryContainer: adjustHex(primary, 40),
    onPrimaryContainer: getContrastColor(adjustHex(primary, 40)),
    secondary: "#334155",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#F1F5F9",
    onSecondaryContainer: "#0F172A",
    surface: "#FFFFFF",
    onSurface: "#0F172A",
    surfaceVariant: "#F8FAFC",
    onSurfaceVariant: "#475569",
    outline: "#E2E8F0",
    background: "#F8FAFC",
    onBackground: "#0F172A",
  };
}

export function applyTeamThemeToElement(element: HTMLElement, theme: M3TeamTheme) {
  element.style.setProperty("--md-sys-color-primary", theme.primary);
  element.style.setProperty("--md-sys-color-on-primary", theme.onPrimary);
  element.style.setProperty("--md-sys-color-surface", theme.surface);
  element.style.setProperty("--md-sys-color-on-surface", theme.onSurface);
  element.style.setProperty("--md-sys-color-outline", theme.outline);
}
