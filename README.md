# Cube Trainer

A personal 3×3 speedcubing timer + CFOP algorithm trainer. WCA-grade scrambles, a real
hold-to-start timer with inspection, proper statistics, and a full OLL/PLL trainer with
recognition practice and per-case progress tracking.

## Features

**Timer**
- WCA random-state scrambles via [cubing.js](https://js.cubing.net/) + live 2D cube net
- Spacebar hold-to-start (red → green), millisecond timing
- WCA inspection (15s, 8/12s cues, +2 / DNF), `+2` / `DNF` penalties
- Multiple sessions, solve list with inline edits
- Live **best / ao5 / ao12 / mean** with correct WCA DNF handling (unit-tested)
- PB celebrations

**OLL / PLL Trainer**
- Browse all **57 OLL + 21 PLL** cases — each diagram is rendered from its own algorithm
- Every algorithm is verified with cubing.js (valid last-layer alg, all cases distinct)
- Drill any case (auto-generated setup scramble lands you in exactly that case)
- **Recognition mode** — recognize, reveal, self-grade; tracks per-case recognition time
- Per-case status: unknown / learning / learned

**Sync**
- Local-first (localStorage); optional Supabase cloud sync across devices

## Stack

Vite · React 19 · TypeScript · Tailwind v4 · framer-motion · cubing.js · Supabase

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # stats + alg-dataset verification
npm run build
```

### Cloud sync (optional)

Copy `.env.example` to `.env.local` and fill in your Supabase URL + publishable key.
Enable **Anonymous sign-ins** in the Supabase dashboard (Authentication) to activate sync.
