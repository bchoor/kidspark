# KidSpark — Interactive Learning App for Kids

## Context

Kids learn best through themed, character-driven experiences. KidSpark transforms educational topics into interactive lessons where a familiar character (e.g., Lightning McQueen) guides children through stories, quizzes, and sandbox activities. An admin CMS lets a parent/educator generate content with AI tools, review it, and publish it. Kids access lessons via password-protected links — no accounts needed.

**Pilot**: Dinosaurs topic + Lightning McQueen theme. 25 topics documented, 1 fully built.

## Architecture

**Standalone project** — new GitHub repo, deployed via Cloudflare Pages + D1 + R2. Not part of SiteVault.

**Single Cloudflare Pages project** with Advanced Mode (`_worker.ts`) serving two React SPAs:
- `/cms/*` → Admin CMS (React + Vite + DaisyUI)
- `/*` → Kid-facing learning app (React + Vite + DaisyUI)
- `/api/*` → API layer (D1 + R2)

**Domain**: `kidlearn.bchoor.com` (or similar, configured in Cloudflare Pages)

### Repo Structure

```
kidspark/
  package.json              # Bun workspaces: ["apps/*", "packages/*"]
  wrangler.toml             # Pages config (D1: kidspark-db, R2: kidspark-media)
  migrations/
    0001_initial.sql
  worker/src/               # Compiled to dist/_worker.js
    index.ts                # Routing: /api, /cms, /*
    env.ts                  # Env interface
    auth.ts                 # Admin + kid session auth
    lib/password.ts         # PBKDF2 (adapted from SiteVault share-auth.ts)
    lib/session.ts          # Session create/validate
    lib/json.ts             # Response helpers
    api/courses.ts          # CRUD
    api/topics.ts           # CRUD
    api/themes.ts           # CRUD
    api/lessons.ts          # CRUD + publish/unpublish
    api/media.ts            # R2 upload/serve
    api/kids.ts             # CRUD kid profiles
    api/progress.ts         # Per-kid per-lesson progress
    api/session.ts          # Password verify, session check
    api/admin-auth.ts       # Admin login
    api/passwords.ts        # Manage access passwords
  packages/shared/src/
    types.ts                # DB entity types, API response types
    constants.ts            # Status/activity enums, age ranges
    content-schema.ts       # Lesson content JSON interfaces
  apps/cms/                 # Vite SPA → dist/cms/ (base: '/cms/')
    src/
      components/layout/    # CmsLayout, Sidebar (DaisyUI drawer + navbar)
      components/courses/   # CourseListPage, CourseForm
      components/topics/    # TopicListPage, TopicForm
      components/themes/    # ThemeListPage, ThemeForm
      components/lessons/   # LessonListPage, LessonEditor, ActivityEditor, LessonPreview
      components/media/     # MediaUploader, MediaBrowser
      components/kids/      # KidListPage
      components/passwords/ # PasswordListPage
      hooks/                # useAuth, useCourses, useTopics, useThemes, useLessons, useMedia
      lib/api.ts            # CMS API calls
  apps/learn/               # Vite SPA → dist/ (base: '/')
    src/
      components/auth/      # PasswordGate, KidSelector
      components/layout/    # LearnLayout, KidNav
      components/courses/   # CourseSelector, CourseLessonsPage
      components/lessons/   # LessonViewer, StoryRenderer, QuizRenderer, SandboxRenderer
      components/shared/    # CharacterBubble, HintDisplay, ProgressBar, CompletionScreen
      hooks/                # useSession, useCourses, useLesson, useProgress
      lib/api.ts            # Learn API calls
      lib/progress.ts       # Debounced progress saves
  .github/workflows/
    deploy.yml              # Typecheck → build → migrate D1 → deploy Pages → smoke test
    pr-check.yml            # Typecheck + build dry-run + migration review
```

### Build Pipeline

1. `bun run build:learn` → Vite builds `apps/learn/` to `dist/`
2. `bun run build:cms` → Vite builds `apps/cms/` to `dist/cms/` (with `base: '/cms/'`)
3. `bun run build:worker` → esbuild compiles `worker/src/index.ts` to `dist/_worker.js`
4. `bunx wrangler pages deploy dist/` → deploys everything

### Worker Routing

```
/api/admin/*  → admin-only endpoints (courses, topics, themes, lessons, media, kids, passwords)
/api/learn/*  → kid-facing read endpoints (published courses/lessons)
/api/auth/*   → session management (password verify, admin login)
/api/media/*  → R2 media serving (public)
/cms/*        → serve CMS SPA (fallback to /cms/index.html)
/*            → serve learn SPA (fallback to /index.html)
```

## Data Model

```sql
courses    (id, title, description, slug UNIQUE, cover_image_key, status, sort_order, created_at, updated_at)
topics     (id, title, description, age_min, age_max, status, created_at, updated_at)
themes     (id, name, icon_key, color_palette JSON, description, created_at)
lessons    (id, course_id FK, topic_id FK, theme_id FK, title, slug, sort_order,
            status, activity_type [story|quiz|sandbox|mixed],
            content_json, hints_json, created_at, updated_at, published_at)
media      (id, lesson_id FK, filename, r2_key UNIQUE, mime_type, size_bytes, created_at)
kids       (id, name, avatar, age, created_at)
progress   (id, kid_id FK, lesson_id FK, status, score, time_spent_seconds,
            answers_json, started_at, completed_at, UNIQUE(kid_id, lesson_id))
access_passwords  (id, label, password_hash, salt, iterations, created_at, last_used_at)
sessions          (id TEXT PK, kid_id FK, password_id FK, created_at, expires_at)
admin_sessions    (id TEXT PK, created_at, expires_at)
```

## Content JSON Schemas

### Story
```typescript
{ type: 'story', character: { name, avatar_key, personality },
  pages: [{ id, narration, character_dialogue?, image_key?, choices?: [{ label, next_page_id, feedback }],
             age_variants?: { "3-5": { narration }, "6-8": { narration }, "9-12": { narration } } }] }
```

### Quiz
```typescript
{ type: 'quiz', character: { name, avatar_key, personality },
  questions: [{ id, question, question_type, options: [{ id, text, image_key? }],
                correct_answer, explanation, hints: { "3-5": "...", "6-8": "...", "9-12": "..." }, points }],
  passing_score?, completion_message }
```

### Sandbox
```typescript
{ type: 'sandbox', character: { name, avatar_key, personality },
  sandbox_type: 'drag_and_drop' | 'sorting' | 'matching',
  items: [{ id, label, image_key?, category?, correct_zone_id? }],
  zones?: [{ id, label, accepts }],
  completion_criteria: { type, value? }, hints: { "3-5": "...", ... } }
```

## Auth Design

**Admin CMS**: Simple password stored as env var (`ADMIN_PASSWORD`). Admin session in `admin_sessions` table with HttpOnly cookie `ks_admin`.

**Kid app**: Parent gets a password from the admin. PBKDF2 verification (adapted from SiteVault's `share-auth.ts`). Session stored in `sessions` table with HttpOnly cookie `ks_session`. 7-day expiry.

**Flow**: Password gate → kid selector (pick avatar) → courses → lessons.

## DaisyUI Themes

- **CMS**: `corporate` (light) + `business` (dark) — standard dashboard look
- **Learn app**: Custom `kidspark-light` / `kidspark-dark` themes — bright greens/purples/oranges, extra-rounded corners (`1.5rem`), large touch targets, playful feel

## 25 Topics (All documented, pilot = #1)

**Tier 1 — Obsession-level appeal:**
1. **Dinosaurs** ← PILOT
2. Space & planets
3. Sharks & deep sea creatures
4. Volcanoes & natural disasters
5. The human body (gross stuff)
6. Dino battles (who would win?)
7. Bugs & insects
8. How video games are made

**Tier 2 — High engagement:**
9. Coding basics (make your own game)
10. Optical illusions & brain tricks
11. Ancient Egypt & mummies
12. Extreme weather
13. Robots & AI
14. World records & extremes
15. How cars/rockets work
16. Secret codes & ciphers

**Tier 3 — Sneaky-educational:**
17. How food is made
18. Money & entrepreneurship
19. Survival skills
20. Why the sky is blue (everyday questions)
21. Roller coasters & physics
22. Animal superpowers
23. Forensic science (kid detective)
24. How YouTube/TikTok algorithms work
25. Maps & exploration (treasure hunts)

## Pilot Content: "Dino Racing Adventures"

Course with 5 lessons, each themed with Lightning McQueen:

| # | Lesson | Type | Description |
|---|--------|------|-------------|
| 1 | Meet the Dinos | story | Introduce dinosaur types with McQueen narrating |
| 2 | T-Rex vs Triceratops | mixed | Story about battle + quiz on dino facts |
| 3 | Dino Speed Challenge | quiz | Questions about dinosaur speed, size, diet |
| 4 | Build Your Dino Team | sandbox | Drag dinosaurs into racing teams by attributes |
| 5 | The Extinction Race | story | Dramatic finale about the asteroid event |

Each lesson has age variants (3-5, 6-8, 9-12), character dialogue, 3-5 illustrations, and pre-generated hints.

## Milestones

### M1: Project Scaffolding
- Repo init, bun workspaces, wrangler.toml, D1/R2 setup
- Minimal Vite apps (both render "Hello"), worker routing skeleton
- CI/CD (deploy.yml + pr-check.yml), D1 migration with full schema
- **Verify**: `bun install` + `bun run build` + `wrangler pages dev dist/` serves both apps

### M2: API Layer
- All CRUD endpoints in `worker/src/api/`
- Auth middleware (admin vs kid session)
- Password hashing + session management (adapted from SiteVault `share-auth.ts`)
- Media upload/serve via R2
- Shared types in `packages/shared/`
- **Verify**: curl tests against local wrangler — create course, lesson, upload media, auth flow

### M3: Admin CMS
- DaisyUI drawer + navbar layout with sidebar nav
- CRUD pages for courses, topics, themes, lessons, kids, passwords
- Lesson editor with section-based builder (story pages, quiz questions, sandbox config)
- Inline lesson preview, media uploader/browser
- Draft/publish workflow
- **Verify**: Create full "Dino Racing Adventures" course through the CMS UI

### M4: Kid-Facing App
- Password gate → kid selector → course grid → lesson list → lesson viewer
- Activity renderers: StoryRenderer, QuizRenderer, SandboxRenderer
- Age-adaptive content selection based on kid's age
- Character speech bubbles, progress tracking, completion screen
- Debounced progress saves to API
- **Verify**: Complete all pilot lessons as different-age kids, verify progress persists

### M5: Pilot Content
- Create Dinosaurs topic, Lightning McQueen theme via CMS
- Author 5 lessons with AI-generated content (structured JSON)
- Upload illustrations to R2
- Age variants for all text content (3-5, 6-8, 9-12)
- **Verify**: End-to-end walkthrough as a 5-year-old and 10-year-old kid

### M6: Polish
- Responsive design (mobile-first learn app, collapsible CMS sidebar)
- Dark mode (DaisyUI theme switching)
- Accessibility (focus-visible, reduced-motion, ARIA labels, keyboard nav)
- Error boundaries, loading skeletons, network error toasts
- Session cleanup (lazy expiry on validation)
- **Verify**: Lighthouse accessibility > 90, mobile usability, dark mode rendering

## SiteVault Patterns to Reuse

| Pattern | Source File | Adapt For |
|---------|------------|-----------|
| PBKDF2 password hashing | `sitevault/worker/src/share-auth.ts` | Kid + admin password auth |
| Request routing | `sitevault/worker/src/index.ts` | Worker routing to API / CMS / learn |
| CRUD API with D1 | `sitevault/worker/src/recipe-book/api.ts` | All entity CRUD endpoints |
| Frontend API client | `sitevault/apps/admin/src/lib/api.ts` | Typed fetch wrappers in both apps |
| CI/CD pipeline | `sitevault/.github/workflows/deploy.yml` | Pages deployment workflow |

## Verification Plan

1. **Local dev**: `wrangler pages dev dist/` + Vite dev servers with API proxy
2. **API**: curl/HTTPie tests for all CRUD endpoints + auth flow
3. **CMS**: Create course → topic → theme → lessons → publish through UI
4. **Learn app**: Full lesson completion as different-age kids
5. **Cross-browser**: Chrome + Safari mobile, verify touch targets
6. **Deploy**: PR → typecheck → build → merge → auto-deploy → smoke test (HTTP 200 on both apps)
