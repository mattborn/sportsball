# Sportsball

Daily sports briefing email. Your sports, your teams, one email, every morning.

## How it works

1. Scrapes live data from Safari tabs (standings, brackets, schedules)
2. Merges with manually curated content
3. LLM summarizes only what's new since yesterday
4. Sends a clean email — one section per sport, favorites highlighted

## Current state

MVP lives in `hatch/scripts/sportsball.js` with config in `hatch/src/data/sportsball.json`. Will migrate to this repo as a standalone product.

## Migration from Hatch

These files move from Hatch:
- `scripts/sportsball.js` — the job
- `src/data/sportsball.json` — sports config (groups, URLs, favorites)
- `src/data/sportsball-2026.json` — season calendar
- `src/data/daily/*/sportsball-manual.json` — curated content
- `src/data/daily/*/sportsball.txt` — cached email output
- `src/data/daily/*/sportsball-scraped.json` — cached scrape data

Hatch retains: job scheduling, performance grading, alerting if quality drops.

## Domain

sportsball.dev — owned by Matt, not yet built.
