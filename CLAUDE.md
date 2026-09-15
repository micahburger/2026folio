# 2026folio

Micah Lindenberger's 2026 mini portfolio. A Vite + React 18 + TypeScript
single-page site: five "chapters" (four project chapters plus a resume) that
behave as a slide deck on desktop and as a normal scrolling page on mobile,
with an overview grid you zoom in and out of.

Live at https://2026folio.micahburger.com

## Deploy — read this before you push

**Hostinger auto-deploys from `main`, serving the repo root.** The root
`index.html` and `assets/` are committed build output, not source. Source
lives in `app/`.

So any change to `app/` needs a rebuild committed alongside it:

```sh
./deploy.sh          # npm --prefix app run build, then copies app/dist/. to the repo root
git status           # review — the asset hashes will have changed
```

`deploy.sh` does **not** deploy. It only builds and copies. Pushing `main` is
what deploys.

Never commit a source change to `main` without the rebuilt root output in the
same commit, or the live site silently keeps serving the previous bundle.

### Working locally vs. in a remote session

- **Local (`claude` in a terminal)** — full loop: build, run the dev server,
  push `main`, deploy. Use this for anything that ends in a deploy.
- **Remote (claude.ai/code)** — sandboxed. Pushing to `main` is blocked as a
  production deploy, and `localhost` is unreachable from your browser. Work on
  a branch; you merge and push from your machine.

`.claude/` is gitignored and never reaches a remote session — which is why
this file is tracked. Put anything a fresh session must know here.

## Running it

```sh
npm --prefix app install
npm --prefix app run dev            # localhost:5173
npm --prefix app run dev -- --host  # also on your wifi, for testing on a real phone
npm --prefix app run build          # tsc -b && vite build — this is the typecheck too
```

There is no test suite and no linter. `npm run build` is the only gate; it
runs `tsc -b` first, so a type error fails the build.

Routing is path-based (`/messaging`, `/overview`), handled by history
pushState — Vite's SPA fallback serves them in dev, `.htaccess` in production.

## Layout of the source

```
app/src/
  components/
    PortfolioShell.tsx   deck state, nav (keys/wheel/swipe), overview zoom, URL sync
    ProjectView.tsx      picks a layout by project.layout; owns the media gallery hook
    MediaGallery.tsx     within-project example crossfade + dots
    MediaFrame.tsx       one media example's box
    CustomCursor.tsx     the dot cursor (desktop)
    layouts/             BleedLayout | PanelLayout | OpenLayout | ResumeLayout
  data/
    projects.ts          all content — copy, colors, media, work history
    types.ts             the shape of the above
  motion.ts              every duration/easing for the deck + gallery + zoom
  flip.ts                the overview <-> project FLIP zoom
  styles/global.css      all styling; the mobile rules live in @media (max-width: 900px)
  lib/color.ts           isLightColor, for picking a light/dark theme per chapter
```

Content changes are almost always `data/projects.ts` alone. Each standard
project carries exactly three media examples; `resume` is its own type with no
gallery.

## Things that will bite you

**`motion.ts` is the source of truth for timing, but CSS can't read it.** Some
durations are hand-mirrored in `global.css` (the gallery fade, the deck
transition, `DECK_BG_MS` vs `.deck-background`). Change one and you must change
the other — the comments at each site say which constant they track.

**On mobile, chapters are stacked absolutely, not in flow.** `.overview-frame`
is `position: absolute; inset: 0` so the deck can crossfade chapters in one
spot. That means `.shell-rail` holds nothing in flow, `.shell` collapses to its
`min-height: 100dvh`, and `.shell` — not the document — is the scroll
container. Consequences:

- Anything meant to sit *behind* a full chapter scroll must be `position:
  fixed`, not `inset: 0`. An absolute layer sizes to one screen and scrolls
  away with the content. `.deck-background` learned this the hard way.
- `.project-view.is-hidden { display: none }` is what stops idle chapters from
  padding the scroll to the height of the tallest one.
- Chapters mid-transition carry `is-leaving`/`is-entering` instead of
  `is-hidden`, so both sides render at once. Don't assume one chapter in the
  DOM.

**Overview cells size themselves from a container query.** `.overview-frame
--overview` sets `container-type: size` and the preview scales by
`100cqw / 100vw`. `flip.ts` scales by width to match. Change one and the
element pops the moment CSS takes back over.

**Verify mobile changes on a real mobile scroll**, not a narrow desktop window
— several of these bugs only appear once `.shell` is actually scrolling. A
headless browser at 390x844 with `isMobile: true`, scrolled to the bottom,
catches them.

## House style

- Comments explain *why*, at length, wherever a rule is non-obvious or was
  arrived at by ruling something else out. The existing CSS and components are
  dense with these — match that density rather than trimming it.
- Commit subjects are plain-English imperatives describing the change's intent,
  not its mechanics: "Shape the overview cards like the window", "Split the
  gallery fade by who asked for it". No `fix:`/`feat:` prefixes.
- British/American spelling is mixed in comments; nobody minds.
