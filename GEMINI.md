# 🤖 Gemini Project Context: CONAN

This file provides high-level architectural context for AI agents working on this project.

## Project Evolution
CONAN evolved from a "Local Notion" clone into a specialized investigative tool. The primary design goal is **High Information Density** and **Actionability**.

## Technical Specs
- **Framework**: Next.js 15 (App Router).
- **Styling**: Tailwind CSS + DaisyUI (Corporate Theme).
- **Persistence**: SQLite (`better-sqlite3`) stored in `local.db`.
- **UI State**: Managed via React hooks (`useState`, `useEffect`).
- **Interactivity**: `dnd-kit` for block reordering.

## Core Logic Patterns
1. **PARA Enforcement**: The sidebar logic enforces the PARA methodology. Projects are visually flagged if they lack a `deadline`.
2. **Wiki-Linking**: Content is scanned for `[[Page Title]]` patterns to generate interactive links and automated Backlinks.
3. **Autosave**: The `Editor` component implements a debounced `useEffect` that syncs both blocks and metadata (title, category, tags, deadline) to the SQLite backend.
4. **Slash Menu**: A compact, keyboard-navigable toolkit for block creation.

## Design Identity
- **Keywords**: Forensic, Technical, Minimalist, Blue/Success/Error palette.
- **Typography**: `text-base` for body, `text-4xl` for titles, `font-mono` for technical metadata.
- **Icons**: Lucide-like SVG icons (heroicons style) for consistency.

## Key Files
- `components/Editor.tsx`: The heart of the application. Handles blocks, DnD, and Rich Text.
- `components/Sidebar.tsx`: Handles navigation, filtering, and PARA status.
- `app/(dashboard)/DashboardWrapper.tsx`: Manages the global layout and sidebar toggle state.
- `lib/db.ts`: Database schema and singleton connection.
- `app/api/`: REST-like endpoints for CRUD operations on case files.

---
*Last Investigation: Friday, Jan 30, 2026* 🕵️‍♂️
