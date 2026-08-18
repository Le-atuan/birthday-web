import type { CSSProperties } from "react";

export type ThemeMotion = "off" | "subtle" | "standard";

export type ThemeConfig = {
  primary: string;
  secondary: string;
  accent: string;
  backgroundStart: string;
  backgroundEnd: string;
  surface: string;
  foreground: string;
  mutedForeground: string;
  border: string;
  danger: string;
  radius: number;
  shadowStrength: number;
  glowStrength: number;
  motion: ThemeMotion;
  gradientDirection: number;
};

export const CLOUD_BLUE_THEME: ThemeConfig = {
  primary: "#267CB3",
  secondary: "#72C7F2",
  accent: "#FFD37A",
  backgroundStart: "#DDF4FF",
  backgroundEnd: "#A9E0FA",
  surface: "#F8FCFF",
  foreground: "#12304A",
  mutedForeground: "#385C75",
  border: "#BFEAFF",
  danger: "#C93C52",
  radius: 24,
  shadowStrength: 20,
  glowStrength: 32,
  motion: "standard",
  gradientDirection: 145,
};

const COLOR_FIELDS = [
  "primary",
  "secondary",
  "accent",
  "backgroundStart",
  "backgroundEnd",
  "surface",
  "foreground",
  "mutedForeground",
  "border",
  "danger",
] as const;
const HEX_COLOR = /^#[0-9A-F]{6}$/i;

export function parseThemeConfig(value: unknown): ThemeConfig | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<ThemeConfig>;
  if (COLOR_FIELDS.some((field) => !HEX_COLOR.test(candidate[field] ?? "")))
    return null;
  if (!isNumberInRange(candidate.radius, 8, 40)) return null;
  if (!isNumberInRange(candidate.shadowStrength, 0, 50)) return null;
  if (!isNumberInRange(candidate.glowStrength, 0, 60)) return null;
  if (!isNumberInRange(candidate.gradientDirection, 0, 360)) return null;
  if (
    !candidate.motion ||
    !["off", "subtle", "standard"].includes(candidate.motion)
  )
    return null;
  return candidate as ThemeConfig;
}

export function themeToStyle(theme: ThemeConfig): CSSProperties {
  return {
    "--theme-primary": theme.primary,
    "--theme-secondary": theme.secondary,
    "--theme-accent": theme.accent,
    "--theme-background": theme.backgroundStart,
    "--theme-background-end": theme.backgroundEnd,
    "--theme-surface": theme.surface,
    "--theme-foreground": theme.foreground,
    "--theme-muted-foreground": theme.mutedForeground,
    "--theme-border": theme.border,
    "--theme-danger": theme.danger,
    "--theme-radius": `${theme.radius}px`,
    "--theme-shadow-alpha": `${theme.shadowStrength / 100}`,
    "--theme-glow-alpha": `${theme.glowStrength / 100}`,
    "--theme-gradient-direction": `${theme.gradientDirection}deg`,
    "--theme-motion-factor":
      theme.motion === "off" ? "0" : theme.motion === "subtle" ? "0.65" : "1",
  } as CSSProperties;
}

export function contrastRatio(foreground: string, background: string) {
  const bright = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (bright + 0.05) / (dark + 0.05);
}

function luminance(hex: string) {
  const channels = [1, 3, 5].map(
    (index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255,
  );
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4),
  );
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function isNumberInRange(value: unknown, min: number, max: number) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}
