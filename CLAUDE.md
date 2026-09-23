# deckkit — how this repo works

A sales deck as a web project. Presents like PowerPoint, shares like a link.

## Start here

This repo sets itself up for one company before any slide is written.

**Make it run first, without asking.**

1. No `node_modules/`? Run `npm install`. Do not ask permission and do not
   explain npm — just do it and say "preparando todo, un momento".
2. `npm install` fails because Node is missing or too old (needs 20+)? Say it in
   one line and give one command, then wait:
   *macOS* `brew install node` · *Windows and everything else*: the installer at
   [nodejs.org](https://nodejs.org).
3. Then read `canon/onboarding.yaml` and run `npm run check`. Tell the person
   which steps are done and which comes next, in their language, in a short
   paragraph.

If any step is not `done`, your first action is to follow the `deck-onboarding`
skill — it resumes where things were left. Never redo a `done` step unless asked.

### Who you are talking to

Most people opening this have never written a line of code. Assume that until
they show you otherwise.

- **Don't show commands, paths or file names** unless they ask. You run them.
  They hear what happened, not how.
- Say **"tu deck", "tu marca", "tu link"** — not `canon/brand.yaml`,
  `npm run build`, `src/content/slides/`.
- When something fails, say what it means for them and what you are doing about
  it. A stack trace is never an answer.
- Someone who types commands at you, or asks about the canon, has told you they
  are technical. Switch registers and stop translating.

The exception is anything they must do outside this folder — creating a Netlify
account, setting a password in a web UI. There, be exact: they are on their own
screen and cannot see yours.

The path, in order:

```
0. Orient           read canon/onboarding.yaml, say where we are
1. Company          what you sell, to whom, in one line          [required]
2. Brand            palette, type, logo → brand book              [required]
3. Resources        website, old decks, images                    [optional]
4. People & proof   team, customers, investors, facts             [optional]
5. Voice            banned words, disclaimers, tagline            [required]
6. Index access     who may see the deck list at /                [required]
7. First deck       pick an audience, write slides
8. Publish          exposure review, host, verify live
```

Steps 7 and 8 have their own skills (`deck-authoring`, `deck-publish`) when present;
until then, follow the editing guide below and `npm run check` tells you if the
canon is complete enough to start.

## Rules that don't bend

1. **Never write a color.** Pick a `background` and an `accent`; the system supplies the color. Palette lives only in `canon/brand.yaml`.
2. **Never write a bare number.** Every hard figure goes in `canon/facts.yaml` and is used with `<Fact id="..." />`. No source and review date, no entry.
3. **A slide is fixed in one place.** Don't duplicate a slide to change one word for one deck — decks reference slides, they never copy them.
4. **`canon/` is the source of truth.** `src/styles/tokens.generated.css` is generated from it on every `dev`/`build` and is gitignored. If you find yourself editing CSS colors, stop: edit the canon.

## A slide always fits the screen

No scrolling inside a slide: each one is exactly the viewport height, on a phone and on a projector alike. If you put too much in, the deck **won't let it grow** — it shrinks that slide's scale until it fits.

So the penalty for overwriting isn't a broken slide, it's a slide with smaller type than its neighbours. If one looks smaller than the rest, that's not a bug: it has too much content. Cut it or split it.

## Editing a slide

Slides live in `src/content/slides/*.mdx`:

```mdx
---
title: "Most teams ship <strong>the wrong thing first.</strong>"
template: numbered-split
background: paper
accent: blue
closing: "Expensive, and slow to find out."
visual: { type: image, src: /assets/some-image.png, alt: "..." }
notes: "What you say out loud when you reach this slide."
---

<List>
  <Numbered n={1}>No shared definition of done</Numbered>
</List>
```

- `title` accepts `<strong>`. If present, the first part renders regular and only the marked part bold — no weights to declare.
- `notes` show only when the URL has `?notes`. The audience never sees them.
- `template`, not `layout`: Astro reserves `layout` in MDX frontmatter.

### Valid values

| Field | Values |
|---|---|
| `template` | `cover` · `statement` · `numbered-split` · `pillar` · `metrics` · `product` · `team` · `logo-wall` · `closing` |
| `background` | whatever `canon/brand.yaml` declares under `backgrounds` (the demo canon has `paper`, `deep`) |
| `accent` | whatever `canon/brand.yaml` declares under `accents` (the demo canon has `blue`) |
| `visual.type` | `image` · `mockup` · `none` |
| `visual.component` | a component you registered in `src/components/Visual.astro` (empty by default) |

Anything outside these lists **fails the build and tells you what is valid**. That's the point: it keeps the deck from drifting.

`background` is what color the slide is; `accent` is the color world of the section. On a light background, text takes the accent color.

### Components available inside a slide

`<List>` `<Numbered n={1}>` `<Bullet>` `<Fact id="">` `<Metric id="">` `<Quote>`

Nothing else, and nothing to import. `<Quote>` is for the customer's own words.
Plain prose works too, in the templates that take a body.

### Which templates take a body

Only these render what you write under the frontmatter:

`statement` · `numbered-split` · `pillar` · `metrics` · `product` · `closing`

`cover`, `team` and `logo-wall` build themselves from the frontmatter and the
canon. Writing a body under one of them **fails the build** and says so — it
used to be discarded silently, which cost two slides their supporting line in a
deck that had already shipped.

## Adding a fact

In `canon/facts.yaml`:

```yaml
- id: customers
  value: "+120"
  label: "Customers"
  source: "Internal CRM export"
  reviewedOn: 2026-09-01
  validForDays: 180
  usage: [sales, marketing]
```

`usage: [internal]` marks a source that must never appear in an external deck; a slide that cites it fails the build. Expired facts warn at build today and will fail in phase 2.

## Creating a deck

A deck is an audience. It only lists slides:

```yaml
# src/content/decks/investors.yaml
name: "Investors"
audience: investors
slug: investors-7f3a9c2b1d4e   # the route — generate it, never type it
status: published              # `draft` stays out of the index
slides: [cover, problem, closing]
```

## The URL of a deck

The route is the `slug`, not the filename. The file stays `investors.yaml` so
you can find it; the URL carries a random suffix so that being handed one deck
tells you nothing about the others. `/contadores` implies `/investors`.
`/contadores-5ba6b70dde9b` implies nothing.

```bash
npm run deck:slug -- "Investors"            # a fresh slug to paste in
npm run deck:slug -- --rotate investors     # revoke a leaked link, in place
npm run deck:slug -- --check                # every deck and its URL
```

**The build refuses a deck without one**, and refuses a bare name like
`slug: investors` — otherwise a deck would ship a guessable URL by omission,
which is the whole failure this prevents.

Rotating changes only the suffix. The old link 404s on the next deploy.

**This is obscurity, not authentication.** Whoever holds the link holds it for
good and can forward it. It stops a client from poking at your other decks; it
does not make a deck secret. For something that truly must not leave the
building, do not publish it.

## The index is behind a password

`/` lists every deck you have, with their URLs, so it is the one page that turns
"a link someone sent me" into "a directory of everything".
`netlify/edge-functions/protect-index.js` puts a gate in front of it; the decks
stay open.

**One password, no username.** There is a single team credential, so a username
that never changes is just another field to get wrong.

**A real page, not the browser's dialog.** `src/pages/gate.astro` takes its
colours, type and logo from `canon/brand.yaml` like everything else, so the
first thing anyone sees of your deck site is your brand. The edge function
fetches that page and flips one attribute to show the wrong-password message —
it never assembles markup, and no colour is ever typed into JavaScript.

| variable | |
|---|---|
| `DECK_INDEX_PASSWORD` | the team password |
| `DECK_INDEX_PUBLIC` | `"true"` publishes the index with no password at all |

With neither set the index returns 503 rather than opening. A secret that went
missing must never fail towards "everyone can read it" — publishing the index
has to be something somebody typed on purpose.

The session is a cookie signed with the password itself
(`scripts/lib/session.mjs`), which has a useful consequence: **rotating the
password signs everyone out**, rather than leaving old sessions alive until
they expire. It lasts 8 hours — a working day, so nobody retypes it after
lunch, and a borrowed laptop is not open forever.

### Where the password lives, and where it does not

**Netlify's environment is the only copy production reads.** The edge function
calls `Netlify.env.get()`, which never sees a file in this repo. A `.env` here
changes nothing about the deployed site.

To share it with the rest of the team: they read it in the Netlify UI
(Site configuration → Environment variables), or you keep it in the team
password manager. **Not in a `.env` in git.** `.env*` is gitignored, so it would
not reach them anyway — and un-ignoring it would put a live credential in the
history of a repo, which is the one place a credential can never be taken back
out of.

`.env.example` exists to name the variables, never to hold values. It needs the
`!.env.example` line in `.gitignore`: `.env*` swallows it otherwise, and the
file silently never ships. Verify with `git add --dry-run .env.example`, not
with `git check-ignore` — check-ignore exits 0 even when the rule that matched
is the negation.

### Rotating the index password

Two steps, and skipping the second leaves you believing a lie:

1. Change `DECK_INDEX_PASSWORD` in the Netlify UI.
2. **Redeploy.** Netlify snapshots the environment into each deploy, so an edge
   function keeps reading the value from the build it shipped with.

Until that rebuild, **the old password still works and the new one does not.**
Measured, 45 seconds after changing the value with no redeploy:

```
password OLD  -> 200
password NEW  -> 401
```

And after a rebuild:

```
password OLD  -> 401
password NEW  -> 200
```

So changing the value is half a rotation. If you rotate because a password
leaked, the leak stays live until something rebuilds — "Trigger deploy" in the
Netlify UI, or any push.

The top bar's **← Decks** still points at `/`, so a client who clicks it meets
the password prompt. That is the intended answer, not a dead end.

## Publishing

Until `deck-publish` exists, follow this. It works from the local folder — the
person does not need a GitHub account, and nothing of theirs has to leave their
machine except the built site.

**Do not start this on your own.** Publishing puts their deck on the open
internet. Wait until they ask.

1. **Explain Netlify in two lines, once.** "Es donde va a vivir tu deck en
   internet, para que puedas mandar un link. Es gratis para esto." Nothing about
   CDNs, builds or DNS.
2. **Account.** Ask them to create one at [netlify.com](https://netlify.com) —
   signing in with Google is the shortest path. Wait for them to say they did.
3. **Log the CLI in.** `npx netlify-cli login` opens their browser; tell them a
   tab will open and they should approve it.
4. **Deploy.** `npx netlify-cli deploy --prod`. First run asks whether to create
   a new site — create one, and let it pick a name unless they have a
   preference. `netlify.toml` ships the edge function and headers, so the
   password gate travels with the deploy.
5. **The index password.** Ask what they want (see step 6 of the onboarding, and
   respect `index_access` if it is already decided):
   - protected: `npx netlify-cli env:set DECK_INDEX_PASSWORD "<theirs>"`
   - deliberately open: `npx netlify-cli env:set DECK_INDEX_PUBLIC true`

   Then **deploy again**. Netlify snapshots the environment into each deploy, so
   a value set after the last one does nothing until something rebuilds. Skipping
   this is how someone ends up believing a password is live when it is not.
6. **Hand them the link** — the deck's own URL, with its slug, not the root.
   Check it yourself first. Tell them the root asks for the password and the deck
   link does not, because that is the part that looks broken if unexplained.

**Never** write their password into a file in this repo. Not `.env`, not the
canon, not a note. `.env*` is gitignored so it would not reach their team, and
production reads the host's environment, not this folder.

GitHub is the advanced route, and only worth mentioning if they ask for it or
already have the repo there: connecting it makes the site rebuild on every push
instead of on every `deploy` command.

## Presenting

Move the cursor to the top edge and a bar appears with **← Decks**. On a phone, tap the top strip.

| Key | Does |
|---|---|
| `→` `space` | Next |
| `←` | Previous |
| `P` | Presentation mode (fixed 16:9 for projectors) |
| `O` | All slides |
| `Esc` | Back to normal |

`?present` opens straight into presentation mode. `?notes` shows your notes. `#7` opens on slide 7 — handy for a link that points at something specific.

## Story mode

`?story=5` plays the deck on its own, five seconds a slide, the way a story
does: one slide at a time, a segmented bar across the top, tap the right third
to skip ahead and the left third to go back, hold to pause.

It **stops on the last slide** with the bar full, rather than looping — a
closing slide usually carries the link, and it has to stay on screen long
enough to be used.

The duration is clamped to 2–30 seconds. Below that it flickers unreadably,
above it a viewer thinks the page froze; both ends are someone's typo rather
than someone's intent, so the link still plays instead of failing.

Build these links from the deck index: each row has a **Share** button that
writes the URL for you. `Esc` leaves story mode, and the controls bar carries a
pause button — content that advances on its own has to be stoppable, and
holding a finger down is an affordance nobody can see.

## Running

```bash
npm install && npm run dev
```

`npm run build` runs the content validation; if it passes, the deck is sound. `npm test` runs the canon generator's tests.

