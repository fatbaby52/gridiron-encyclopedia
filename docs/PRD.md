# Gridiron Encyclopedia
## Product Requirements Document

**Version:** 1.0  
**Date:** January 2026  
**Project Codename:** Gridiron

---

## 1. Vision & Overview

### 1.1 Mission Statement
Build the definitive open-source encyclopedia for American football—covering high school, college, and NFL—that makes deep technical knowledge accessible to anyone through AI-assisted navigation, while fostering community contribution and discussion.

### 1.2 Core Principles
- **Depth without intimidation:** Expert-level content made approachable through intelligent navigation
- **Visual-first learning:** Animated play diagrams as the primary teaching tool
- **Community-driven growth:** Wikipedia-style editing with quality controls
- **Level-agnostic:** Content applicable across high school, college, and professional football with callouts for rule/scheme differences

### 1.3 Key Decisions (Locked In)

| Decision | Choice |
|----------|--------|
| Project name | Gridiron Encyclopedia (working title) |
| Monetization | Free with ads + affiliate marketing + merch dropshipping |
| Content review | Owner as SME + AI reviewer loop (Claude, ChatGPT, Gemini) |
| Hosting budget | Under $20/mo (Netlify-based) |
| Development style | Iterate fast, ship and improve |
| Authentication | Email/password + Google + Facebook OAuth |
| Visual identity | Grass green palette, whiteboard-style play diagrams |
| Repo | GitHub |
| AI chat | OpenAI GPT-4o default (cheaper), 10 queries/day for anonymous users |
| Initial content | Broad coverage (a little of everything) |
| Play diagrams | Rich format from the start (timing, assignments, coverage) |
| Play Designer | User-facing drag-and-drop tool (basic in Phase 2, full in Phase 3) |
| Content storage | MDX files initially → migrate to database for wiki editing in Phase 3 |
| Merch | Link out to external store (Shopify/Etsy) |
| Analytics | Google Analytics |

### 1.4 Target Users
| User Type | Primary Need |
|-----------|--------------|
| Curious fans | Understanding what they're watching |
| Youth/HS coaches | Scheme installation, drill libraries |
| Players | Technique refinement, football IQ |
| Fantasy/betting analysts | Scheme tendencies, personnel usage |
| Journalists/creators | Research, fact-checking |
| Coaching nerds | Deep scheme analysis, historical context |

---

## 2. Information Architecture

### 2.1 Primary Content Hierarchy

```
GRIDIRON ENCYCLOPEDIA
│
├── FUNDAMENTALS
│   ├── Rules & Officiating
│   │   ├── Game Structure (quarters, clock, scoring)
│   │   ├── Penalties (by category)
│   │   ├── Rule Differences (HS vs NCAA vs NFL)
│   │   └── Officiating Mechanics
│   ├── Field & Equipment
│   ├── Positions
│   │   ├── Offense (QB, RB, WR, TE, OL breakdown)
│   │   ├── Defense (DL, LB, DB breakdown)
│   │   └── Special Teams
│   └── Basic Concepts
│       ├── Downs & Distance
│       ├── Field Position
│       └── Game Theory Basics
│
├── OFFENSE
│   ├── Formations
│   │   ├── Under Center
│   │   │   ├── I-Formation (Pro I, Power I, Maryland I)
│   │   │   ├── Split Back
│   │   │   ├── Single Back
│   │   │   ├── Wishbone/Flexbone
│   │   │   └── Wing-T
│   │   ├── Shotgun/Pistol
│   │   │   ├── 2x2 Sets
│   │   │   ├── 3x1 Sets
│   │   │   ├── Empty
│   │   │   └── Bunch/Stack
│   │   └── Personnel Groupings (11, 12, 21, 22, 13, etc.)
│   │
│   ├── Schemes
│   │   ├── Run Schemes
│   │   │   ├── Gap/Power Schemes
│   │   │   │   ├── Power
│   │   │   │   ├── Counter
│   │   │   │   ├── Trap
│   │   │   │   └── Dart
│   │   │   ├── Zone Schemes
│   │   │   │   ├── Inside Zone
│   │   │   │   ├── Outside Zone
│   │   │   │   ├── Split Zone
│   │   │   │   └── Pin & Pull
│   │   │   ├── Option Schemes
│   │   │   │   ├── Triple Option
│   │   │   │   ├── Speed Option
│   │   │   │   ├── RPOs
│   │   │   │   └── Read Option
│   │   │   └── Specialty (Jet Sweep, Reverse, etc.)
│   │   │
│   │   ├── Pass Concepts
│   │   │   ├── Quick Game (3-step)
│   │   │   │   ├── Slant-Flat
│   │   │   │   ├── Hitch
│   │   │   │   ├── Quick Out
│   │   │   │   └── Smoke/Tunnel Screens
│   │   │   ├── Dropback (5-step)
│   │   │   │   ├── Curl-Flat
│   │   │   │   ├── Smash
│   │   │   │   ├── Flood
│   │   │   │   ├── Mills/Drive
│   │   │   │   ├── Mesh
│   │   │   │   └── Four Verticals
│   │   │   ├── Play Action
│   │   │   │   ├── Boot/Naked
│   │   │   │   ├── Play Action Deep
│   │   │   │   └── Shot Plays
│   │   │   ├── Screen Game
│   │   │   │   ├── RB Screens
│   │   │   │   ├── WR Screens
│   │   │   │   └── Tunnel/Jailbreak
│   │   │   └── Progression Reads & Coverage Beaters
│   │   │
│   │   └── System Overviews
│   │       ├── West Coast Offense
│   │       ├── Air Raid
│   │       ├── Spread Option
│   │       ├── Erhardt-Perkins
│   │       ├── McVay/Shanahan System
│   │       ├── Coryell/Vertical Passing
│   │       └── Run & Shoot
│   │
│   ├── Techniques
│   │   ├── Quarterback
│   │   │   ├── Footwork (3-step, 5-step, 7-step)
│   │   │   ├── Throwing Mechanics
│   │   │   ├── Progression Reading
│   │   │   └── Pocket Movement
│   │   ├── Running Back
│   │   │   ├── Vision & Patience
│   │   │   ├── One-Cut vs Zone
│   │   │   ├── Pass Protection
│   │   │   └── Route Running
│   │   ├── Wide Receiver
│   │   │   ├── Release Techniques
│   │   │   ├── Route Running
│   │   │   ├── Separation Methods
│   │   │   └── Contested Catch
│   │   ├── Tight End
│   │   │   ├── Blocking Techniques
│   │   │   ├── Route Adjustments
│   │   │   └── Flex/Move TE Role
│   │   └── Offensive Line
│   │       ├── Run Blocking (Drive, Reach, Down, Pull)
│   │       ├── Pass Protection (Set, Anchor, Punch)
│   │       ├── Combo Blocks
│   │       └── Communication
│   │
│   └── Playbooks
│       ├── Sample Playbooks by Level
│       ├── Play Naming Systems
│       └── Installation Guides
│
├── DEFENSE
│   ├── Fronts
│   │   ├── Even Fronts
│   │   │   ├── 4-3 (Over, Under, Wide)
│   │   │   ├── 4-2-5
│   │   │   └── 46
│   │   ├── Odd Fronts
│   │   │   ├── 3-4 (2-gap, 1-gap)
│   │   │   ├── 5-2
│   │   │   └── 3-3 Stack
│   │   ├── Hybrid/Multiple
│   │   │   ├── Nickel/Dime
│   │   │   └── Bear/Tite
│   │   └── Gap Responsibilities
│   │
│   ├── Coverages
│   │   ├── Zone Coverages
│   │   │   ├── Cover 2 (Tampa, Sink, Read)
│   │   │   ├── Cover 3 (Sky, Cloud, Buzz)
│   │   │   ├── Cover 4 (Quarters, Palms)
│   │   │   ├── Cover 6
│   │   │   └── Zone Match/Pattern Match
│   │   ├── Man Coverages
│   │   │   ├── Cover 0
│   │   │   ├── Cover 1 (Robber, Rat)
│   │   │   ├── Cover 2 Man
│   │   │   └── Bracket/Banjo
│   │   └── Hybrid/Disguise
│   │       ├── Cover 3 to Cover 1
│   │       ├── Quarters Check
│   │       └── Rip/Liz Adjustments
│   │
│   ├── Pressures & Blitzes
│   │   ├── 4-Man Pressures (Twist, Games)
│   │   ├── 5-Man Pressures
│   │   ├── 6+ Man Pressures
│   │   ├── Zone Blitz Concepts
│   │   └── Pressure Coverage Pairing
│   │
│   ├── Techniques
│   │   ├── Defensive Line
│   │   │   ├── Pass Rush Moves
│   │   │   ├── Run Fits
│   │   │   └── Two-Gap vs One-Gap
│   │   ├── Linebacker
│   │   │   ├── Run Fit/Fill
│   │   │   ├── Zone Drops
│   │   │   ├── Man Coverage
│   │   │   └── Blitz Timing
│   │   └── Defensive Back
│   │       ├── Press Technique
│   │       ├── Off-Man Technique
│   │       ├── Zone Drops & Eyes
│   │       ├── Ball Skills
│   │       └── Tackling
│   │
│   └── Schemes
│       ├── Saban/Belichick Tree
│       ├── Seattle Cover 3
│       ├── Vic Fangio System
│       ├── Wide 9
│       └── Bear Defense
│
├── SPECIAL TEAMS
│   ├── Kicking Game
│   │   ├── Field Goal/PAT
│   │   ├── Kickoff
│   │   └── Punting
│   ├── Return Game
│   │   ├── Kick Return
│   │   ├── Punt Return
│   │   └── Return Schemes
│   ├── Coverage Units
│   │   ├── Kickoff Coverage
│   │   └── Punt Coverage
│   └── Special Plays
│       ├── Fakes
│       ├── Onside Kicks
│       └── Trick Plays
│
├── STRATEGY & GAME MANAGEMENT
│   ├── Situational Football
│   │   ├── Red Zone
│   │   ├── Two-Minute Drill
│   │   ├── Goal Line
│   │   ├── Short Yardage
│   │   └── 4th Down Decisions
│   ├── Game Planning
│   │   ├── Self-Scout
│   │   ├── Opponent Breakdown
│   │   ├── Tendency Analysis
│   │   └── Adjustment Philosophy
│   ├── Clock Management
│   └── Analytics & Metrics
│       ├── EPA/Success Rate
│       ├── DVOA Explained
│       └── Advanced Stats Glossary
│
├── HISTORY & EVOLUTION
│   ├── Scheme Evolution
│   │   ├── Run Game Timeline
│   │   ├── Passing Game Timeline
│   │   ├── Defensive Evolution
│   │   └── Rules Impact on Schemes
│   ├── Coaching Trees
│   └── Landmark Games/Moments
│
├── TRAINING & FITNESS
│   ├── Position-Specific Training
│   │   ├── QB Workouts (arm strength, footwork, mobility)
│   │   ├── RB Workouts (explosiveness, vision drills, pass pro)
│   │   ├── WR Workouts (route running, hands, release)
│   │   ├── OL Workouts (strength, leverage, footwork)
│   │   ├── DL Workouts (pass rush, run stuffing, hands)
│   │   ├── LB Workouts (agility, tackling, coverage)
│   │   └── DB Workouts (backpedal, breaks, ball skills)
│   ├── General Athletic Development
│   │   ├── Speed & Agility
│   │   ├── Strength Programs
│   │   ├── Conditioning/Endurance
│   │   ├── Flexibility & Mobility
│   │   └── Recovery & Injury Prevention
│   ├── Off-Season Programs
│   │   ├── High School Templates
│   │   ├── College Templates
│   │   └── Pro-Style Templates
│   ├── In-Season Maintenance
│   ├── Combine/Pro Day Prep
│   │   ├── 40-Yard Dash
│   │   ├── Vertical Jump
│   │   ├── Broad Jump
│   │   ├── 3-Cone Drill
│   │   ├── Shuttle
│   │   └── Position Drills
│   └── Equipment & Gear Reviews
│       ├── Training Equipment
│       ├── Cleats
│       ├── Gloves
│       ├── Protective Gear
│       └── Recovery Tools
│
└── GLOSSARY & REFERENCE
    ├── Complete Glossary
    ├── Hand Signal Guide
    └── Play Diagramming Key
```

### 2.2 Page Types

| Page Type | Description | Example |
|-----------|-------------|---------|
| **Concept Page** | Deep-dive on a single concept | "Inside Zone" |
| **Overview Page** | Category summary with links | "Run Schemes" |
| **Comparison Page** | Side-by-side analysis | "Cover 2 vs Cover 3" |
| **Technique Page** | Step-by-step instruction | "5-Step Drop" |
| **System Page** | Complete scheme breakdown | "West Coast Offense" |
| **Playbook Page** | Downloadable install with plays | "Youth Power Offense" |
| **History Page** | Evolution and context | "The Spread Revolution" |

---

## 3. Monetization Strategy

### 3.1 Revenue Streams

**Advertising**
- Display ads (Google AdSense or Mediavine once traffic qualifies)
- Placement zones: sidebar, between content sections, footer
- Keep ads non-intrusive—no interstitials or autoplay video

**Affiliate Marketing**
- Training equipment (Amazon Associates, Dick's, Rogue Fitness)
- Books/courses (coaching education)
- Streaming services (NFL+, ESPN+)
- Fantasy/betting platforms (where legal)
- Supplements and nutrition (training section)

**Gear Reviews Section** (high affiliate potential)
- Cleats, gloves, training equipment
- "Best X for Y position" roundups
- Comparison tables with affiliate links

**Merch/Dropshipping**
- Partner with Printful, Printify, or Gooten
- Football-themed apparel: scheme-specific shirts ("Zone Scheme Purist"), position pride, coaching humor
- Integrate shop section or link to Shopify/Etsy storefront
- Consider: custom playbook covers, coaching gear

### 3.2 Monetization-Ready Architecture

```
Components needed:
├── Ad placement components (easy to swap providers)
├── Affiliate link wrapper (tracking + disclosure)
├── Product review/comparison template
├── Shop integration or external link system
└── Disclosure/disclaimer footers (FTC compliance)
```

### 3.3 FTC Compliance Notes
- Clear affiliate disclosure on all pages with affiliate links
- "As an Amazon Associate I earn from qualifying purchases" (or equivalent)
- Separate disclosure page linked in footer

---

## 4. Feature Specifications

### 3.1 AI Navigator

The AI assistant is the primary differentiator—making expert content accessible to anyone.

**Capabilities:**
- Natural language Q&A about any football topic
- "Explain like I'm a..." adaptive depth (new fan → coach)
- "Show me plays that beat Cover 2 when I'm in 11 personnel"
- Quiz/test mode for learning retention
- Coaching scenario simulation ("3rd and 7, down by 4, what do you call?")
- Cross-reference suggestions ("You might also want to read about...")

**Implementation Notes:**
- RAG (Retrieval Augmented Generation) over the full knowledge base
- Context-aware: knows what page user is viewing
- Conversation memory within session
- Can generate and display play diagrams inline

**UI Placement:**
- Persistent chat panel (collapsible)
- Inline "Ask about this" buttons on complex sections
- Voice input option for mobile

### 4.2 Animated Play Diagrams (Rich Format)

**Core Requirements:**
- SVG-based for crisp rendering at any size
- Playback controls (play/pause, speed, step-through)
- Toggle: show all routes vs reveal progressively
- Toggle: show/hide defensive coverage
- Mobile-responsive touch controls

**Diagram Elements:**
- Player icons (offensive: O, defensive: X or by position)
- Route lines (solid = primary, dashed = option)
- Blocking assignments (arrows, symbols)
- Coverage zones (shaded regions)
- Ball movement
- Timing markers (1, 2, 3 step)

**Rich Diagram Data Schema:**
```json
{
  "id": "inside-zone-vs-43",
  "name": "Inside Zone vs 4-3 Over",
  "formation": {
    "offense": "singleback-2x2",
    "defense": "4-3-over"
  },
  "players": {
    "offense": [
      { "id": "QB", "position": "QB", "x": 50, "y": 20, "label": "Q" },
      { "id": "RB", "position": "RB", "x": 50, "y": 12, "label": "R" },
      { "id": "LT", "position": "OL", "x": 38, "y": 25, "label": "T" }
      // ... all 11 players
    ],
    "defense": [
      { "id": "NT", "position": "DL", "x": 46, "y": 28, "label": "N", "technique": "1" },
      { "id": "MLB", "position": "LB", "x": 50, "y": 35, "label": "M" }
      // ... all 11 players
    ]
  },
  "assignments": {
    "offense": [
      { "playerId": "LT", "type": "block", "target": "NT", "technique": "reach" },
      { "playerId": "RB", "type": "route", "path": [[50,12], [55,15], [60,25]], "readKey": "playside-DE" }
    ],
    "defense": [
      { "playerId": "MLB", "type": "fill", "gap": "A", "trigger": "run-read" }
    ]
  },
  "timing": [
    { "step": 1, "description": "Snap, QB opens playside", "events": ["snap", "mesh"] },
    { "step": 2, "description": "OL reaches, RB reads block", "events": ["rb-decision"] },
    { "step": 3, "description": "RB cuts backside or bounces", "events": ["rb-cut"] }
  ],
  "coverageShell": "cover-3",
  "tags": ["run", "zone", "inside-zone", "4-3"]
}
```

### 4.3 Play Designer (User-Facing)

A drag-and-drop tool that lets any user create, save, and share play diagrams.

**Core Features:**
- Drag-and-drop player placement on field
- Draw routes with mouse/touch (auto-smoothing)
- Add blocking assignments (click player → click target)
- Set coverage shells from presets
- Add timing steps with descriptions
- Preview animation before saving

**Field Templates:**
- Full field, red zone, goal line
- Offensive view (looking at defense)
- Defensive view (looking at offense)
- Special teams (kickoff, punt)

**Player Tools:**
- Snap to formation templates (I-Form, Spread, 4-3, etc.)
- Position labels (auto or custom)
- Color coding by position group
- Duplicate/mirror plays

**Route Drawing:**
- Freehand draw → auto-smooth to clean curves
- Route type presets (slant, out, corner, post, etc.)
- Option routes (dashed lines)
- Motion paths (pre-snap)

**Sharing & Export:**
- Save to user's personal playbook (requires account)
- Generate shareable link
- Export as PNG/SVG
- Export as JSON (for coaches who want raw data)
- Embed code for blogs/forums

**Permissions:**
| User Type | Capabilities |
|-----------|--------------|
| Anonymous | Create & export (no save) |
| Registered | Save up to 50 plays, share links |
| Premium (future) | Unlimited saves, team playbooks |

**Technical Approach:**
- Canvas-based editor (Fabric.js or Konva.js)
- Same JSON schema as article diagrams (section 4.2)
- Real-time preview using the same PlayDiagram renderer
- Autosave drafts to localStorage

**UI Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  [Formation ▼]  [Coverage ▼]  [Tools]     [Preview] [Save] │
├─────────────┬───────────────────────────────────────────┤
│             │                                           │
│  Player     │                                           │
│  Palette    │           Field Canvas                    │
│             │                                           │
│  Route      │                                           │
│  Types      │                                           │
│             │                                           │
├─────────────┴───────────────────────────────────────────┤
│  Timeline: [Step 1] [Step 2] [Step 3] [+ Add Step]      │
└─────────────────────────────────────────────────────────┘
```

**Phase:** Include basic version in Phase 2 (after animated diagrams work). Full-featured version in Phase 3.

### 4.3 Play Designer (User-Facing)

A core feature that lets any user create, save, and share their own play diagrams.

**Core Capabilities:**
- Drag-and-drop player placement on field
- Draw routes with mouse/touch (auto-smoothing)
- Add blocking assignments (click player → click target)
- Set coverage zones (draw regions)
- Add timing/step annotations
- Label players with custom text

**Field Options:**
- Full field, red zone, goal line views
- Orientation: pointed down (default), up, left, right
- Toggle yard line numbers
- Toggle hash marks

**Player Tools:**
- Offense: O symbols (or position letters: Q, R, X, Y, Z, T, G, C)
- Defense: X symbols (or position letters: N, E, T, M, W, S, C)
- Color coding by position group
- Quick-add formation templates (I-Form, Spread, 4-3, Nickel, etc.)

**Route/Assignment Drawing:**
- Solid lines (primary routes)
- Dashed lines (option routes)
- Arrows (blocking, blitz paths)
- Curved vs angular paths
- Route tree shortcuts (click to add: slant, out, corner, post, etc.)

**Animation Builder:**
- Define steps/phases (pre-snap, snap, 1-2-3 count)
- Set movement timing per element
- Preview animation
- Adjust speed

**Save & Share:**
- Save to user account (requires login)
- Export as PNG/SVG (anonymous OK)
- Generate shareable link
- Embed code for forums/blogs
- Copy diagram JSON (for power users)

**Community Features (Phase 3):**
- Public playbook gallery
- Fork/remix other users' plays
- Upvote/favorite plays
- Tag plays (scheme, formation, concept)
- Submit to encyclopedia articles (moderated)

**Technical Implementation:**
- Canvas-based editor (Fabric.js or Konva.js) or pure SVG manipulation
- Same JSON schema as encyclopedia diagrams (section 4.2)
- Autosave drafts to localStorage
- Sync to Supabase when logged in

**UI Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Formation Templates ▼]  [Offense/Defense]  [Save] [Share] │
├─────────────┬───────────────────────────────────────────────┤
│             │                                               │
│  TOOLBOX    │                                               │
│             │                                               │
│  Players    │              FIELD CANVAS                     │
│  ○ ○ ○      │                                               │
│  × × ×      │           (drag & drop area)                  │
│             │                                               │
│  Routes     │                                               │
│  ——→        │                                               │
│  - - →      │                                               │
│             │                                               │
│  Zones      │                                               │
│  [□]        │                                               │
│             │                                               │
├─────────────┴───────────────────────────────────────────────┤
│  Timeline: [ Step 1 ][ Step 2 ][ Step 3 ][+]    [▶ Preview] │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Content Pages

**Standard Sections for Concept Pages:**
1. **Overview** - What it is, when it's used
2. **Diagram** - Animated play diagram
3. **Execution** - Step-by-step breakdown
4. **Variations** - Common adjustments
5. **Coaching Points** - Key teaching elements
6. **Common Mistakes** - What to avoid
7. **Counters** - How defenses/offenses respond
8. **Level Differences** - HS/College/NFL rule or technique variations
9. **Film Examples** - Links to game film (future: embedded clips)
10. **Related Concepts** - Cross-links

**Wiki-Style Features:**
- Edit history with diffs
- Discussion tab per page
- Citation requirements for claims
- Quality ratings (stub → good → featured)
- "Needs review" flagging

### 4.5 Search & Discovery

**Search Features:**
- Full-text search across all content
- Filter by category (offense/defense/ST)
- Filter by level (HS/College/NFL)
- Filter by content type (concept/technique/playbook)
- "Fuzzy" matching for terminology variations

**Discovery:**
- "Random page" feature
- "Related concepts" sidebar
- "Learning paths" (curated sequences)
- "Recently updated" feed
- "Popular this week" section

### 4.6 User Features

**Account Types:**
| Role | Capabilities |
|------|-------------|
| Anonymous | Read, use AI, limited search |
| Registered | Save favorites, discussion, suggest edits |
| Contributor | Direct editing (with review) |
| Editor | Review/approve edits, moderate |
| Admin | Full access, user management |

**Personalization:**
- Saved articles/plays
- Personal playbook builder
- Reading history
- Notification preferences
- Preferred level (HS/College/NFL default)

### 4.7 Forums (Phase 2)

**Structure:**
- General Discussion
- Scheme Talk (Offense)
- Scheme Talk (Defense)
- Coaching Q&A
- Film Room (game breakdowns)
- High School
- College
- NFL

**Features:**
- Threading
- Diagram embedding
- User reputation system
- Moderation tools
- Integration with wiki (link discussions to pages)

---

## 5. Technical Architecture

### 5.1 Recommended Stack (Budget-Optimized for <$20/mo)

**Frontend:**
- **Framework:** Next.js 14+ (App Router) — works great on Netlify
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion (UI) + Custom SVG animation for play diagrams
- **State:** Zustand (lightweight)
- **AI Chat:** Vercel AI SDK (works fine on Netlify)

**Backend:**
- **Hosting:** Netlify ($20/mo tier gives you plenty of room)
- **Database:** Supabase Free Tier (500MB, 50k monthly active users)
- **Auth:** Supabase Auth (free, supports email/password + Google + Facebook)
- **Search:** Client-side search with Fuse.js initially → upgrade to Supabase full-text search
- **AI Chat:** OpenAI GPT-4o as default (cost-effective), Claude API available for content generation
- **Analytics:** Google Analytics

**Content Management:**
- **Wiki Engine:** MDX files in repo (free, version controlled via Git)
- **Media:** Supabase Storage (1GB free) or Cloudflare R2 (10GB free)

**Cost Breakdown:**
| Service | Cost |
|---------|------|
| Netlify Pro | $19/mo (you already have $9 plan) |
| Supabase | Free tier |
| OpenAI API | ~$2-10/mo depending on usage |
| Cloudflare (DNS/CDN) | Free |
| Google Analytics | Free |
| **Total** | **~$20-30/mo** |

### 5.2 Visual Design System

**Color Palette:**
```
Primary Green (Grass):    #2d5a27 (dark grass) / #4a7c42 (medium) / #6b9b62 (light)
Secondary:                #1a1a1a (chalkboard black) / #ffffff (whiteboard)
Accent:                   #c9a227 (yard line gold) / #8b4513 (leather brown)
Neutral:                  #f5f5f5 (light bg) / #e0e0e0 (borders)
```

**Play Diagram Style:**
- White/cream background (whiteboard feel)
- Clean black lines for routes
- Position circles: O's for offense, X's for defense (or color-coded by position group)
- Optional: subtle dry-erase marker texture
- Grid lines like whiteboard faint dots

**Typography:**
- Headlines: Bold sans-serif (Inter, or athletic-feeling like Oswald)
- Body: Clean readable sans-serif (Inter, System UI)
- Play diagrams: Handwritten-style font for labels (optional, like Caveat)

### 5.3 Authentication Setup

**Supabase Auth Configuration:**
- Email/password (with email confirmation)
- Google OAuth
- Facebook OAuth

**Rate Limiting (AI Chat):**
- Anonymous users: 10 queries/day (tracked via localStorage + IP fallback)
- Registered users: 50 queries/day
- Consider: Show signup prompt after 5 queries for anonymous users

**User Roles:**
| Role | Capabilities |
|------|-------------|
| Anonymous | Read, use AI (limited), browse |
| Registered | Save favorites, comment, suggest edits |
| Contributor | Direct editing (with review queue) |
| Editor | Approve edits, moderate |
| Admin | Full access |

### 5.4 Data Models

```
Article
├── id
├── slug
├── title
├── category (enum)
├── level_tags (HS/College/NFL)
├── content_mdx
├── current_version_id
├── quality_rating
├── created_at / updated_at

ArticleVersion
├── id
├── article_id
├── content_mdx
├── author_id
├── change_summary
├── created_at

PlayDiagram
├── id
├── name
├── svg_data (JSON structure)
├── animation_config
├── article_ids (many-to-many)

UserPlaybook
├── id
├── user_id
├── name
├── description
├── is_public
├── created_at / updated_at

UserPlay
├── id
├── playbook_id
├── user_id
├── name
├── diagram_json (same schema as PlayDiagram)
├── tags
├── is_public
├── share_token (for public links)
├── created_at / updated_at

User
├── id
├── username
├── email
├── role
├── reputation_score
├── created_at

Discussion
├── id
├── article_id (nullable)
├── forum_category (if forum post)
├── title
├── author_id
├── created_at

Comment
├── id
├── discussion_id
├── parent_id (for threading)
├── author_id
├── content
├── created_at
```

### 5.5 AI Integration Architecture

```
User Query
    │
    ▼
┌─────────────────┐
│  Rate Limiter   │ ← Check daily quota (10 anon / 50 registered)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Query Router   │ ← Determines intent (Q&A, diagram request, quiz, etc.)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Vector Search   │ ← Embeddings of all article content (Supabase pgvector)
│   (RAG)         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  OpenAI API     │ ← GPT-4o with retrieved context + system prompt
│  (GPT-4o)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Response        │ ← May include text, diagram generation, or actions
│ Formatter       │
└─────────────────┘
```

**Why OpenAI for chat (not Claude):**
- GPT-4o is cheaper per token than Claude for high-volume chat
- Claude still used for content generation (better at long-form writing)
- Can swap providers later if needed—abstract behind a common interface

---

## 6. Content Generation & Review Strategy

### 6.1 AI-Assisted Content Creation

Since you want Claude Code to handle the bulk of research and writing, here's the approach:

**Phase 1: Foundation Content**
1. Generate comprehensive glossary (300+ terms)
2. Create all position pages with techniques
3. Build out formation library with diagrams
4. Write core concept pages (Inside Zone, Cover 2, etc.)

**Phase 2: Depth Content**
1. System overviews (West Coast, Air Raid, etc.)
2. Advanced technique breakdowns
3. Scheme comparison pages
4. Historical evolution articles

**Phase 3: Training & Monetization Content**
1. Position-specific workout guides
2. Equipment reviews (affiliate-ready)
3. Combine/Pro Day prep content
4. Recovery and nutrition guides

**Phase 4: Community Expansion**
1. Sample playbooks for each level
2. Drill libraries
3. Film study guides

### 6.2 Multi-AI Review Loop

Content goes through a structured review process before publishing:

```
┌─────────────────┐
│ Claude Code     │ ← Initial draft generation
│ (Author)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Human SME       │ ← You: football accuracy check
│ (You)           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ AI Review Loop  │ ← Claude, ChatGPT, Gemini cross-check
│                 │   - Factual accuracy
│                 │   - Completeness
│                 │   - Clarity
│                 │   - Conflicting info detection
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Final Human     │ ← You: final approval
│ Approval        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Published       │
└─────────────────┘
```

**AI Review Prompts (for each reviewer):**

*Claude Review:*
> "Review this football article for factual accuracy, completeness, and clarity. Flag any claims that seem incorrect or need citation. Check for internal consistency with standard football terminology."

*ChatGPT Review:*
> "You are reviewing a football encyclopedia article. Check for: (1) factual errors, (2) missing important information, (3) unclear explanations, (4) anything that contradicts common coaching knowledge. Provide specific feedback."

*Gemini Review:*
> "Analyze this football content for accuracy and completeness. Cross-reference against your knowledge of football schemes and techniques. Highlight any discrepancies or areas needing improvement."

**Review Workflow Implementation:**
- Store review status in article metadata
- Track which AIs have reviewed
- Aggregate feedback into actionable items
- Human makes final call on conflicting AI opinions

**Quality Control:**
- Human review of AI-generated content for accuracy
- Expert consultation on technique pages
- Cross-reference with coaching literature

### 6.3 Content Style Guide

**Voice:**
- Authoritative but approachable
- Active voice preferred
- Define jargon on first use (with link to glossary)
- Use "the quarterback" not "you" (unless technique instruction)

**Structure:**
- Lead with the key insight
- Use subheadings liberally
- Keep paragraphs short (3-4 sentences)
- Always include a diagram for spatial concepts

**Accuracy Standards:**
- Cite sources for historical claims
- Note when terminology varies by region/level
- Flag "this is one approach" vs "this is standard"

---

## 7. Development Phases

### Phase 1: MVP (Weeks 1-6)
**Goal:** Core reading experience with AI navigator

- [ ] Next.js project setup with Tailwind
- [ ] Basic page templates (concept, overview)
- [ ] MDX content system
- [ ] Static play diagram component (SVG, no animation yet)
- [ ] Basic search (client-side to start)
- [ ] AI chat integration (Claude API + basic RAG)
- [ ] Generate 50 foundational articles
- [ ] Mobile-responsive design
- [ ] Deploy to Vercel

**Deliverable:** Functional site with core content, browsable and searchable, with working AI assistant.

### Phase 2: Rich Features (Weeks 7-12)
**Goal:** Animated diagrams, play designer, user accounts, enhanced AI

- [ ] Animated play diagram system
- [ ] **Play Designer (user-facing)** - core feature
  - [ ] Field canvas with drag-and-drop players
  - [ ] Route drawing tools
  - [ ] Formation templates
  - [ ] Export PNG/SVG
- [ ] User authentication (email + Google + Facebook)
- [ ] Favorites/bookmarks
- [ ] Reading history
- [ ] Enhanced search (Fuse.js → Supabase full-text)
- [ ] AI improvements (better RAG, diagram generation)
- [ ] Generate 150 more articles
- [ ] Performance optimization

**Deliverable:** Feature-rich reading experience with play designer and personalization.

### Phase 3: Community (Weeks 13-20)
**Goal:** Wiki editing, forums, play designer community features

- [ ] Wiki-style editing with version history
- [ ] Edit review/approval workflow
- [ ] Discussion tabs on articles
- [ ] Forum system
- [ ] User reputation system
- [ ] Moderation tools
- [ ] Notification system
- [ ] Personal playbook builder
- [ ] **Play Designer community features:**
  - [ ] Public play gallery
  - [ ] Fork/remix plays
  - [ ] Upvote/favorite
  - [ ] Submit plays to encyclopedia

**Deliverable:** Full community platform with user-generated content and shared playbooks.

### Phase 4: Polish & Scale (Weeks 21+)
**Goal:** Production hardening, advanced features

- [ ] Video/film integration
- [ ] Advanced analytics dashboard
- [ ] API for third-party access
- [ ] Mobile app consideration
- [ ] SEO optimization
- [ ] Internationalization groundwork
- [ ] Load testing and optimization

---

## 8. Claude Code Implementation Guide

### 8.1 Getting Started

```bash
# Create the project
npx create-next-app@latest gridiron-encyclopedia --typescript --tailwind --app --src-dir

# Essential dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install ai openai                           # OpenAI for chat
npm install framer-motion zustand fuse.js
npm install next-mdx-remote gray-matter

# Development dependencies  
npm install -D @types/node

# Netlify CLI (for local dev that matches production)
npm install -D netlify-cli
```

**GitHub Setup:**
```bash
# Initialize repo
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/gridiron-encyclopedia.git
git push -u origin main
```

**Netlify Setup:**
```bash
# Link to your Netlify account
npx netlify link

# Or create new site
npx netlify init

# Add to netlify.toml:
```

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NEXT_TELEMETRY_DISABLED = "1"
```

**Environment Variables (in Netlify dashboard):**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_key
```

### 8.2 Suggested File Structure

```
gridiron-encyclopedia/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (wiki)/
│   │   │   ├── [category]/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   ├── training/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── gear/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── shop/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts
│   │   │   └── search/
│   │   │       └── route.ts
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── AdSlot.tsx
│   │   ├── wiki/
│   │   │   ├── ArticlePage.tsx
│   │   │   ├── TableOfContents.tsx
│   │   │   └── RelatedArticles.tsx
│   │   ├── diagrams/
│   │   │   ├── PlayDiagram.tsx
│   │   │   ├── DiagramControls.tsx
│   │   │   └── DiagramRenderer.tsx
│   │   ├── ai/
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── monetization/
│   │   │   ├── AffiliateLink.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ComparisonTable.tsx
│   │   │   └── AffiliateDisclosure.tsx
│   │   └── ui/
│   │       └── (shared components)
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── mdx.ts
│   │   ├── search.ts
│   │   └── ai.ts
│   └── content/
│       ├── offense/
│       │   ├── formations/
│       │   ├── schemes/
│       │   └── techniques/
│       ├── defense/
│       ├── training/
│       ├── gear/
│       └── ...
├── public/
│   └── diagrams/
├── netlify.toml
└── package.json
```

### 8.3 Key Implementation Notes for Claude Code

**Content Generation:**
- Use Claude to research and write articles in MDX format
- Include frontmatter: title, category, tags, level, related articles
- Generate diagram data as JSON that the PlayDiagram component consumes
- Initial batch: aim for broad coverage across all major sections

**AI Chat:**
- OpenAI GPT-4o for user-facing chat (cheaper at scale)
- Implement streaming responses for better UX
- Include current page context in the system prompt
- Track usage per user/IP for rate limiting
- Store embeddings in Supabase with pgvector extension

**Play Diagrams:**
- Use the rich JSON schema defined in section 4.2
- SVG generation from JSON at render time
- CSS animations or requestAnimationFrame for smooth playback
- Start with a library of common formations as templates

**Content Strategy (Broad Coverage First):**
Week 1-2: Glossary (100 terms) + Fundamentals (10 articles)
Week 3-4: Offense overview + 15 formation/scheme articles
Week 5-6: Defense overview + 15 coverage/front articles
Week 7-8: Training section (10 articles) + Gear reviews (5 articles)

---

## 9. Success Metrics

| Metric | Target (6 months) |
|--------|-------------------|
| Articles published | 500+ |
| Monthly active users | 10,000 |
| AI queries/month | 50,000 |
| Average session duration | 8+ minutes |
| Registered users | 2,000 |
| Community contributions | 100 edits/month |

---

## 10. Remaining Open Questions

1. **Video licensing:** How to legally embed game film? (YouTube embeds of official channels? GIF-only?)
2. **Expert partnerships:** Recruit coaches as contributors/reviewers down the line?
3. **Mobile app:** Native app eventually, or PWA sufficient?
4. **Offline access:** Allow downloaded playbooks for coaches without internet?
5. **Dropship partner:** Printful vs Printify vs Gooten—need to evaluate
6. **Final name:** Brainstorm before domain purchase

---

## 11. Next Steps

1. **Review this spec** - Any missing features or changed priorities?
2. **Finalize tech decisions** - Confirm stack choices
3. **Set up project** - Initialize repo, configure tooling
4. **Build MVP skeleton** - Routes, layouts, basic components
5. **Generate seed content** - 20-30 foundational articles
6. **Implement AI chat** - Core differentiator
7. **Iterate** - User feedback → improvements

---

*This document should be treated as a living spec. Update as decisions are made and requirements evolve.*
