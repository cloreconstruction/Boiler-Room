# Boiler Room — CLAUDE.md (read this first, every session)

Boiler Room is the construction day-log PWA for **Eric Clore, Clore Construction, Kenai Peninsula, Alaska**. Eric dictates messages and reads on a phone — keep replies **short, plain, no jargon**. He is the owner and only decision-maker; Logan is the bookkeeper, Shevaun handles C&C properties paperwork, Phil/Kevin/Jason/Elodie/Milo are crew.

## What this repo is

- **The repo root IS the live site.** Netlify auto-deploys on every push to `main` at https://cloreconstdailylog.netlify.app
- `index.html` — the entire app: ONE self-contained file (~15,000 lines, HTML+CSS+JS, no build step, no framework). This is deliberate. Keep it one file.
- `c/index.html` — the homeowner (client) page, served at `/c/?c=<code>`; data via `/.netlify/functions/client-portal`
- `netlify/functions/` — `client-portal.mjs`, `notify.mjs` (web-push, VAPID keys in Netlify env), `plan-reminder.mjs` (scheduled 5pm). Functions are pre-BUNDLED single files (esbuild) — bundle locally before committing changes.
- `sw.js` — push service worker. `version.txt` — must match the app version every release.

## Release rules (never skip)

1. Bump `const APP_VER = 'vX.YY'` AND the `<footer>vX.YY` line — both, every build. The app polls `version.txt` and offers "tap to load" when it's newer.
2. Update `version.txt` in the same commit.
3. **Commit author must be `Eric Clore <cloreconstruction@yahoo.com>`** — Netlify's contributor check rejects other authors. Committer may be Claude.
4. **NEVER drag-and-drop files onto Netlify.** A single-file drop replaces the ENTIRE published site (it killed all nine client pages on 2026-08-25). GitHub push is the only deploy route.
5. Test before shipping: Playwright suites named `_testNNN.js` load the file:// page on a 390×844 mobile viewport and assert behavior (see `tests/` if present; earlier suites are in build logs). Run the newest suite plus the last few before any release.

## Hard rules (Eric's, standing, non-negotiable)

- **Personal entries (`personal:true` / a Personal tag) NEVER leave the phone** — not in sync payloads, summaries, crew publishes, or anything client-facing. The lock wins over everything.
- **Markup and vendor names NEVER appear client-side.** Markup folds into client numbers invisibly (`estMk()`), never named. Breakdowns must sum exactly.
- **Per-person wage isolation**: a crew member's files carry ONLY their own rates.
- **No guess-based matching.** Eric rejected AI scoring (v5.26). Prefer tap-to-learn exact-name allow-lists (`prefs.vendCat`, `prefs.jobCats`); pre-light, never auto-commit — his tap decides.
- **Accessibility: nothing depends on colour alone.** Every state = brightness + glyph + spelled word (e.g. "⚠ SURE?", "✓ ON PAGE", "▸ NEXT").
- **Nothing opens in external tabs on the phone** (PWA trap): no target=_blank flows Eric must return from.
- **Bank/loan account numbers: last-four only** in anything summarized or displayed.
- Never put dollar amounts or client names in push-notification text (lock screens).
- Client data files in Dropbox use **create-first replacement**: CREATE `.new` → verify → MOVE old to Backups/Archive → MOVE `.new` live. Never delete in Dropbox; move instead.
- `pending.json` writer contract: writers APPEND unique ids only; the app owns removal.
- Never shrink lifetime invoiced figures from a WINDOWED QuickBooks export; a true All-Dates ledger IS lifetime truth and may reduce figures.
- **Park ideas, build on Eric's go.** When Eric muses, give feedback and park it (see `claude/next-up-cards.md` in the claude.ai Project); build only when he says go.

## Where the data lives (NOT in this repo)

All app data syncs to Eric's Dropbox under `/Clore DayLog/` (entries.json, master-log.csv, qb-refresh.json + heartbeat/state, profit-ticker.html, qb-costs.json, Client Portal/*.json + estimates, Crew/<name>/). QuickBooks exports land in `/Clore Project Tracker/QB Exports/`. Sessions without Dropbox access work on the app code only — that's fine; the chat (Cowork) sessions handle data runs (a weekly Tuesday 13:00Z chain refreshes the books by hand).

## Current state (as of 2026-09-05)

- Latest built: **v6.26** (journal shows every photo of a multi-photo entry, per-photo picking, ➕ Add photos in the journal that grinds + stamps in one move). v6.25 = five-step grinder card + alphabetical category window. v6.24 = calendar fix (saidDay/weekday pinning), ⚠ heads-up, 🧾 receipt category funnel, tag scrub.
- The live site may lag the latest build — check `version.txt` on the site vs `APP_VER` here; Eric was hand-uploading while pushes were blocked.
- **Next up (spec agreed, parked):** homeowner push notifications — opt-in on client page, per-client subs walled off from `App Data/push-subs.json`, ONLY two triggers (journal release, budget change), generic message text, one ping per burst, delivery only 9am–5pm Alaska (off-hours actions queue to 9am). Full spec in the claude.ai Project doc `claude/next-up-cards.md`.
- Deeper history: the Project docs (`claude/build-log-*.md`, `claude/how-to-run-boiler-room.md`, `claude/deploy-pipeline.md`) in the "Dashboard App" project on claude.ai.

## Working style

Small, surgical edits to the one big file; comment new blocks with the version + Eric's own words for the why (the file reads as a decision log). Steampunk skin: brass/dark, plates and lamps — match it. When Eric reports a bug, reproduce it in a Playwright test first, fix, keep the test green.
