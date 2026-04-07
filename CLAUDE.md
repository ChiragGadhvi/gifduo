# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:8080
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
npm run preview      # Preview production build locally
```

To run a single test file:
```bash
npx vitest run src/test/SomeComponent.test.tsx
```

## Architecture

GifDuo is a **client-side only** React 18 + TypeScript app that transforms uploaded photos into animated GIFs — no backend or server required.

### Routing (React Router v6)
- `/` → `src/pages/Index.tsx` — landing page
- `/create` → `src/pages/Create.tsx` — the main workspace
- `*` → `src/pages/NotFound.tsx`

### Create Page Workflow
Three-step flow (Upload → Animate → Download) rendered in a 3-column layout:
- **Left panel**: `ImageUploader` (up to 2 images) + `AnimationGrid` (10 animation types)
- **Center**: `PreviewCanvas` (live canvas animation preview) + `GifGenerator` (triggers generation, download)
- **Right sidebar**: `SettingsPanel` (output settings: size, quality, frame rate, loop)

### GIF Generation
All GIF creation happens in the browser using `gifshot` and `gif.js`. The `GifGenerator` component orchestrates frame capture from the `PreviewCanvas` HTML canvas element and encodes them into a GIF blob for download.

### Animation Types
Ten animation types are defined in `AnimationGrid.tsx`: fade, slide, zoom, flip, dissolve, wipe, glitch, bounce, split, morph. The selected animation drives how `PreviewCanvas` renders frames.

### UI Components
Components in `src/components/ui/` are **shadcn/ui** components (Radix UI primitives + Tailwind). Do not hand-edit these — add new ones via the shadcn CLI or by copying from the shadcn registry. Custom app components live directly in `src/components/`.

### Styling
- Tailwind CSS with class-based dark mode (`dark:`)
- All theme colors use CSS custom properties (HSL) defined in `src/index.css`
- Custom animations (fade-in, scale-in, slide-up, shimmer, confetti) are in `tailwind.config.ts`
- Path alias `@/` maps to `src/`

### State
- Theme (light/dark) managed by `ThemeProvider` via `next-themes`, persisted to localStorage
- No global app state manager — component-local state and React Query for any data fetching
