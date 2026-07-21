# eshaanmarocha.me — redesign

A ground-up redesign of Eshaan Marocha's portfolio (the parity recreation of the
old Framer site lives in `../parity-site`). Built with the same stack: Astro,
TypeScript, Tailwind CSS 4, React + Motion available for interactive islands.

## Concept

- **Black background**, with every other colour sampled directly from the
  sky130A GDS layer palette that the Tiny Tapeout viewer uses to render Eshaan's
  ASIC — nothing outside these is used anywhere:
  - gold `#ffcf8c` (li1 / Metal1 layer)
  - dark blue `#2961d4` (met1 layer)
  - light blue `#a6bfe6` (met2 layer)
  - plus black `#000` and white `#fff`
- **Interactive ASIC** — a self-hosted, stripped-down build of the Tiny Tapeout
  GDS viewer (Apache-2.0) lives in `public/asic-viewer/`, loading the `.oas`
  model from GitHub Pages (CORS-enabled). It's the upstream viewer with the
  title, KEYS help text, and controls panel removed, a black background, and a
  `?rotate=1` flag added. The hero embeds it **standalone (no box) and
  auto-rotating**; the first project embeds it **boxed and static**. To rebuild
  the viewer, see `public/asic-viewer/` (regenerate from
  github.com/TinyTapeout/tinytapeout_gds_viewer with those edits).
- **Sections**: hero (intro + ASIC) → about (photo + bio) → projects
  (6 rows, model/text sides alternate) → contact.
- **Contact experience** — a full-bleed closer with an interactive blue grid
  that expands around the cursor and a glowing sine wave flowing through a still
  3D "Contact me" button (glows blue on hover). Clicking it opens a full-screen,
  one-question-at-a-time flow (Name → Email → Reason → Message) with fade
  transitions over the same grid, then a "Thank you" screen whose "See my
  projects" button scrolls back to the projects section.

## Contact form email delivery

The form submits to [Web3Forms](https://web3forms.com) (free, no backend), which
forwards messages to `eshaanmarocha@gmail.com`. **To turn it on:**

1. Go to https://web3forms.com, enter `eshaanmarocha@gmail.com`, and copy the
   access key they email you.
2. `cp .env.example .env` and paste the key as `PUBLIC_WEB3FORMS_ACCESS_KEY`.
3. `npm run build`.

Until the key is set, submitting falls back to opening the visitor's mail client
with the message pre-filled (so it's never broken, just not automatic).

## Commands

| Command           | Action                                   |
| ----------------- | ---------------------------------------- |
| `npm install`     | Install dependencies                     |
| `npm run dev`     | Dev server at `localhost:4321`           |
| `npm run build`   | Production build to `./dist/`            |
| `npm run preview` | Preview the production build             |
| `npm run check`   | Type-check (`astro check`)               |

## Structure

```
src/
├── components/
│   ├── common/    Header, Footer, ASICViewer (reused in hero + project row)
│   ├── home/      Hero, About
│   ├── projects/  ProjectsSection, ProjectRow (alternating layout)
│   └── contact/   ContactSection, ContactButton3D (CSS 3D cube)
├── data/          site.ts (constants + viewer URL), projects.ts
├── layouts/       BaseLayout.astro
├── pages/         index.astro
└── styles/        global.css (ASIC-derived design tokens)
public/            favicon.png, robots.txt, documents/ (résumé)
```

## Status / TODO

- **3D models** for the five hardware projects are placeholder boxes awaiting
  Fusion 360 exports. Only the Raytracing ASIC row is live (Tiny Tapeout viewer).
- The **Raytracing ASIC** description/result are placeholder text.
- **"See more"** buttons point at `/projects/<slug>` detail pages that don't
  exist yet (intentionally non-functional for now).
- The contact form needs the Web3Forms key (see above) for automatic inbox
  delivery; without it, it falls back to a pre-filled mailto.

Only the contact area hydrates (React + Motion, loaded lazily); the hero, about,
and projects sections are static Astro. Canvas animations honor
`prefers-reduced-motion`. The gold header logo and About selfie are the real
supplied assets (the logo recolored from mint to the ASIC gold).
