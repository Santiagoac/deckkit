export interface Canon {
  name: string;
  palette: Record<string, Record<string, string>>;
  backgrounds: Record<string, { bg: string; fg: string; logo: string }>;
  accents: Record<string, { strong: string; soft: string; light?: string }>;
  typography: Record<string, unknown> & { licensed?: boolean };
  logo: Record<string, string>;
  spacingBase: number;
}
export function loadCanon(root: string): Canon;
export function resolveRef(palette: Canon['palette'], ref: string): string;
export function googleFontsHref(canon: Canon): string | null;
