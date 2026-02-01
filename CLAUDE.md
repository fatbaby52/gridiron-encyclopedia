# CLAUDE.md - Project Conventions for Gridiron Encyclopedia

This file tells Claude Code how to work on this project. Read this before making changes.

## Project Overview

Gridiron Encyclopedia is a comprehensive American football knowledge base with:
- Wiki-style articles (MDX)
- Animated play diagrams
- User-facing Play Designer tool
- AI-powered chat assistant (OpenAI GPT-4o)
- User accounts with saved playbooks

**Tech Stack:** Next.js 14 (App Router), Tailwind CSS, Supabase, OpenAI API, Netlify

**Full spec:** See `docs/PRD.md` for complete requirements.

---

## Code Style & Conventions

### General

- **TypeScript:** Always use TypeScript. No `any` types unless absolutely necessary (and add a comment explaining why).
- **Formatting:** Prettier handles this. Don't manually format.
- **Imports:** Use absolute imports with `@/` prefix (e.g., `@/components/PlayDiagram`).

### File Naming

```
components/       PascalCase.tsx     (PlayDiagram.tsx)
lib/              camelCase.ts       (supabase.ts, aiChat.ts)
app/ routes       lowercase folders  (app/offense/[slug]/page.tsx)
content/ (MDX)    kebab-case.mdx     (inside-zone.mdx)
```

### Component Structure

```tsx
// 1. Imports (external, then internal, then types)
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { PlayDiagram } from '@/types'

// 2. Types (if not imported)
interface Props {
  diagram: PlayDiagram
  onSave?: (diagram: PlayDiagram) => void
}

// 3. Component
export function PlayDiagramEditor({ diagram, onSave }: Props) {
  // hooks first
  const [isEditing, setIsEditing] = useState(false)
  
  // handlers
  const handleSave = () => { /* ... */ }
  
  // render
  return (/* ... */)
}
```

### Tailwind

- Use Tailwind utilities directly in JSX. Avoid `@apply` except in `globals.css` for base styles.
- Use the project color palette defined in `tailwind.config.ts`:
  ```
  grass-dark: #2d5a27
  grass: #4a7c42
  grass-light: #6b9b62
  gold: #c9a227
  leather: #8b4513
  ```
- Mobile-first: Start with mobile styles, add `md:` and `lg:` for larger screens.

### API Routes

- Keep route handlers thin. Business logic goes in `lib/`.
- Always validate input with Zod.
- Return consistent error shapes:
  ```ts
  return NextResponse.json({ error: 'Message here' }, { status: 400 })
  ```

---

## Git Conventions

### Branch Names

```
feature/play-designer
fix/diagram-animation-timing
content/add-zone-coverage-articles
```

### Commit Messages

Use conventional commits:

```
feat: add Play Designer canvas component
fix: correct route animation timing on mobile
content: add 10 zone coverage articles
docs: update README with setup instructions
chore: upgrade dependencies
```

Keep commits atomic. One logical change per commit.

### Pull Requests

- Create a PR for any significant change
- Include screenshots for UI changes
- Link to relevant spec section if applicable

---

## Content Guidelines

### MDX Article Frontmatter

```mdx
---
title: "Inside Zone"
slug: "inside-zone"
category: "offense/schemes/run"
level: ["hs", "college", "nfl"]
tags: ["zone", "run-game", "inside-zone"]
related: ["outside-zone", "split-zone", "zone-blocking"]
diagram: "inside-zone-base"
status: "published"  # draft | review | published
---
```

### Writing Style

- Authoritative but approachable
- Define jargon on first use, link to glossary
- Use "the quarterback" not "you" (except in technique instructions)
- Include a diagram for any spatial concept
- Note when terminology varies by level (HS vs NFL)

---

## Play Diagram JSON Schema

When creating or modifying play diagrams, use this structure:

```json
{
  "id": "play-id",
  "name": "Human Readable Name",
  "formation": {
    "offense": "formation-key",
    "defense": "front-key"
  },
  "players": {
    "offense": [
      { "id": "QB", "position": "QB", "x": 50, "y": 20, "label": "Q" }
    ],
    "defense": [
      { "id": "MLB", "position": "LB", "x": 50, "y": 35, "label": "M" }
    ]
  },
  "assignments": {
    "offense": [
      { "playerId": "RB", "type": "route", "path": [[x,y], [x,y]], "readKey": "..." }
    ]
  },
  "timing": [
    { "step": 1, "description": "...", "events": ["snap"] }
  ],
  "tags": ["run", "zone"]
}
```

---

## Environment Variables

Required in `.env.local` (never commit this file):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

Optional:
```
NEXT_PUBLIC_GA_ID=           # Google Analytics
ANTHROPIC_API_KEY=           # For content generation scripts
```

---

## Testing

- Write tests for utility functions in `lib/`
- Component tests for complex interactive components (Play Designer)
- E2E tests for critical flows (auth, saving plays)
- Run `npm test` before pushing

---

## How to Ask Me Questions

When you need clarification from the project owner:

1. **Be specific.** "Should X do Y or Z?" is better than "How should X work?"
2. **Provide context.** Explain what you're trying to accomplish.
3. **Suggest options.** If you see multiple valid approaches, list them with tradeoffs.
4. **Batch questions.** If you have multiple questions, ask them together.

Example:
```
I'm implementing the Play Designer save functionality. Questions:

1. When a user hits the 50-play limit, should we:
   a) Show an upgrade prompt (for future premium)
   b) Require them to delete old plays
   c) Just prevent saving with a message
   
2. Should autosave drafts to localStorage, or only save on explicit "Save" click?

Leaning toward (1b) and autosave for better UX. Let me know.
```

---

## Don't Do These Things

- Don't add dependencies without checking if something similar exists
- Don't use `console.log` for debugging in committed code (use proper logging)
- Don't hardcode colors—use the Tailwind theme
- Don't skip TypeScript types to save time
- Don't commit `.env` files or API keys
- Don't make breaking changes to the play diagram JSON schema without updating all existing diagrams

---

## Quick Reference

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Test | `npm test` |
| Lint | `npm run lint` |
| Type check | `npm run typecheck` |
| Generate content | `npm run content:generate` |
| Deploy | Push to `main` (Netlify auto-deploys) |

---

## Project Structure

```
gridiron-encyclopedia/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # React components
│   │   ├── ui/                 # Generic UI components
│   │   ├── layout/             # Header, Footer, Sidebar
│   │   ├── wiki/               # Article-related components
│   │   ├── diagrams/           # Play diagram renderer
│   │   ├── designer/           # Play Designer tool
│   │   ├── ai/                 # Chat interface
│   │   └── monetization/       # Ads, affiliate components
│   ├── lib/                    # Utilities, API clients
│   ├── types/                  # TypeScript types
│   └── content/                # MDX articles
├── public/                     # Static assets
├── docs/                       # Project documentation
│   └── PRD.md                  # Full product spec
├── scripts/                    # Content generation, etc.
├── CLAUDE.md                   # This file
└── netlify.toml                # Netlify config
```

---

*Last updated: January 2025*
