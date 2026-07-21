export const site = {
  name: 'Eshaan Marocha',
  title: 'Eshaan Marocha — Electrical Engineering & Integrated Circuits',
  description:
    'Eshaan Marocha is an electrical engineering student focused on digital electronics and integrated circuits, designing ASICs and hardware systems.',
  url: 'https://eshaanmarocha.me',
  email: 'eshaanmarocha@gmail.com',
  linkedin: 'https://www.linkedin.com/in/eshaanmarocha1/',
  resumePath: '/documents/Eshaan_Marocha_Resume.pdf',
  copyright: '© Eshaan Marocha 2025',
} as const;

/**
 * Web3Forms access key — makes the contact form deliver messages straight to
 * the inbox from a static site (no backend). Get a free key in ~30s at
 * https://web3forms.com (enter eshaanmarocha@gmail.com), then either paste it
 * below or set PUBLIC_WEB3FORMS_ACCESS_KEY in a `.env` file. Until it's set the
 * form gracefully falls back to opening a pre-filled email in the visitor's
 * mail client.
 */
export const web3formsAccessKey: string =
  (import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY as string | undefined) || '';

/** Options offered for the "reason for reaching out" step */
export const contactReasons = [
  'A role or internship',
  'A project collaboration',
  'A question',
  'Just saying hi',
] as const;

/**
 * Self-hosted Tiny Tapeout GDS viewer (Apache-2.0), stripped of its title/help
 * text and controls panel and given a `rotate` flag. Lives in
 * public/asic-viewer/. The .oas model is fetched from GitHub Pages (CORS-enabled).
 * Drag to rotate, scroll to zoom. Pass rotate=true for slow auto-rotation.
 */
const asicModel =
  'https://naashe.github.io/ttsky-ASIC//tinytapeout.oas';

export function asicViewerUrl(rotate = false): string {
  const params = new URLSearchParams({
    pdk: 'sky130A',
    model: asicModel,
  });
  if (rotate) params.set('rotate', '1');
  return `/asic-viewer/index.html?${params.toString()}`;
}
