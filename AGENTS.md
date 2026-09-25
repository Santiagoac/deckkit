# AGENTS.md

This repo configures itself for one company through a guided onboarding before
any slide is written.

1. **Read `CLAUDE.md` in full and follow it.** It is the source of truth for how
   this repo works — the rules that do not bend, the templates, the canon.
2. **Check `canon/onboarding.yaml` first.** If any step is not `done`, or
   `index_access` is `pending`, follow
   `.claude/skills/deck-onboarding/SKILL.md` step by step. It resumes wherever
   it was left; never redo a `done` step unless asked.
3. **For the brand step**, follow
   `.claude/skills/brand-book-generator/SKILL.md`.
4. **Run `npm install` yourself** if `node_modules/` is missing. Do not ask.
5. **"busca actualizaciones"** or anything like it: run
   `npm run update -- --check`, report what it found in their language, and on
   their say-so run `npm run update`. Their own files are protected by
   `.gitattributes`; do not try to merge by hand.
6. **After writing or changing any slide, run `npm run evals`.** It measures
   every slide in a real browser at desktop and phone sizes. Overflow and a
   fit below 60% are failures; below 85% is a warning worth acting on.
7. **Run `npm run check`** to see where things stand, and say it back to the
   person in their own language.

`.claude/skills/` is a Claude Code convention. Under Codex the files are plain
Markdown you read and follow directly — the content is the same, nothing in
them depends on Claude Code.

> Codex support is **beta**: the path above has not been tested end to end.
> Claude Code is the recommended one. If something here does not work under
> Codex, that is a bug worth reporting.
