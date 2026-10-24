import type { CSSProperties } from "react";

const HEX = /^#[0-9a-f]{6}$/i;
const DARK_TEXT = "#121212";
const LIGHT_TEXT = "#FFFFFF";
const CANVAS = "#121212";

export const MIN_CONTRAST = 4.5;

export const COLOR_PRESETS = [
  { name: "Vermelho Brabo", primary: "#D62828", accent: "#FFB703" },
  { name: "Brasa", primary: "#E85D04", accent: "#FFD166" },
  { name: "Mostarda", primary: "#E9C46A", accent: "#D62828" },
  { name: "Verde", primary: "#2A9D8F", accent: "#E9C46A" },
  { name: "Roxo", primary: "#7B2CBF", accent: "#F72585" },
  { name: "Azul", primary: "#1D4ED8", accent: "#FACC15" },
];

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX.test(value);
}

function channels(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function toHex([red, green, blue]: number[]): string {
  return `#${[red, green, blue].map((part) => Math.round(part).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function luminance(hex: string): number {
  const [red, green, blue] = channels(hex).map((part) => {
    const value = part / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(first: string, second: string): number {
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

export function readableText(background: string): string {
  return contrastRatio(background, LIGHT_TEXT) >= contrastRatio(background, DARK_TEXT) ? LIGHT_TEXT : DARK_TEXT;
}

export function mix(first: string, second: string, weight: number): string {
  const a = channels(first);
  const b = channels(second);
  return toHex(a.map((part, index) => part * (1 - weight) + b[index] * weight));
}

export function buttonContrast(color: string): number {
  return contrastRatio(color, readableText(color));
}

export function accentContrast(color: string): number {
  return contrastRatio(color, CANVAS);
}

export function storeTheme(primary: string, accent: string): CSSProperties {
  const safePrimary = isHexColor(primary) ? primary : "#D62828";
  const safeAccent = isHexColor(accent) ? accent : "#FFB703";
  const lift = readableText(safePrimary) === LIGHT_TEXT ? "#FFFFFF" : "#000000";
  return {
    "--color-primary": safePrimary,
    "--color-primary-hover": mix(safePrimary, lift, 0.12),
    "--color-primary-soft": mix(CANVAS, safePrimary, 0.22),
    "--color-on-primary": readableText(safePrimary),
    "--color-accent": safeAccent,
    "--color-accent-soft": mix(CANVAS, safeAccent, 0.2),
  } as CSSProperties;
}
