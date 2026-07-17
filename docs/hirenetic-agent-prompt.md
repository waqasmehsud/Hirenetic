# Hirenetic — Build Prompt for AI Agent

## What we're building

Build **Hirenetic**, a web application where users upload their resume and receive AI-matched job suggestions. The backend runs web crawlers (powered by an AI agent, not hardcoded per-site scrapers) to pull fresh job listings from job boards and company career pages. An LLM then semantically compares each user's resume against these listings and produces an accuracy-scored match (0–100%) with a short explanation of _why_ it matched.

Core user flow:

1. User signs up and uploads a resume (PDF/DOCX)
2. System parses resume into structured data (skills, experience, education, roles)
3. Background crawler agents continuously pull fresh job postings into a database
4. Matching engine scores the user's resume against available jobs using LLM-based semantic comparison
5. User sees a ranked dashboard of job matches with score, reasoning, and apply link
6. (Later) Resume gap analysis, alerts for new matches, skill recommendations

## Core features for MVP

- Resume upload + parsing (extract structured profile data)
- Crawler pipeline: AI agent visits target sites/pages, extracts job listings into a strict JSON schema (title, company, location, description, requirements, apply URL, posted date)
- Matching engine: LLM compares structured resume vs. structured job, returns match score + 2–3 line reasoning
- Dashboard: ranked list of matched jobs, filterable by score/location/type
- Basic auth + user profile

## Tech expectations

- Keep crawler cost sane: use a lightweight fetcher to pull raw page content first, then hand only the relevant portion to the AI agent for structured extraction — don't run a full LLM call on every raw page
- Validate all AI agent output against a strict schema before it touches the database (LLM output can be malformed or hallucinated — never trust it raw)
- Respect robots.txt and each site's terms of service; prioritize sites/APIs that allow this kind of access

## Design language & theme

Do not default to the three generic AI-design looks (cream background + terracotta serif; near-black + single acid-green accent; broadsheet newspaper layout with hairline rules). Design something specific to what Hirenetic actually is: a system that reads a person's career signal and finds where it resonates.

**Concept — "Signal & Match":** the visual language should feel like precision instrumentation, not a generic job board. Think of it as a control room for someone's career: quiet, confident, data-literate, never noisy or corporate-generic.

- **Color palette** (name these as tokens, derive everything from them):
  - `--ink` `#0E1420` — near-black navy base, not pure black (background)
  - `--paper` `#F6F5F1` — soft warm-white for light surfaces/cards
  - `--signal` `#3DDC97` — emerald-green accent, used ONLY for a strong match / positive signal (score, success states, primary CTA)
  - `--caution` `#E8A33D` — amber, used only for mid-range match scores or warnings
  - `--muted-ink` `#5B6472` — secondary text, borders, dividers
  - `--wire` `#243044` — subtle line/graph color on dark surfaces (for connecting resume↔job elements)

- **Typography:**
  - Display face: a confident geometric/grotesk sans with some character (e.g. Söhne, General Sans, or Space Grotesk) — used sparingly for headlines and the match score itself
  - Body face: a clean humanist sans (e.g. Inter or IBM Plex Sans) for readability at data-density
  - Data/mono face: a monospace (e.g. JetBrains Mono or IBM Plex Mono) for scores, percentages, job metadata — reinforces the "instrument reading" feel

- **Layout concept:** avoid card-grid-of-everything defaults. The signature element is a **match visualization** — a simple line/thread connecting a resume node to a job node, with the match score sitting on the thread like a reading, not just a badge in the corner of a card. On the dashboard, jobs are literally laid out as signals coming into range, strongest signal (highest score) closest/brightest.

- **Motion:** subtle only — a match score can "settle" into place (count-up or brief pulse) when it loads, like a needle settling on a gauge. No decorative animation beyond that.

- **Voice/copy:** plain, direct, confident. Say "3 strong matches found," not "We've discovered exciting opportunities for you!" Buttons say what they do: "Upload resume," "Recalculate matches," not "Get Started" or "Submit." Empty states should read as instructions, not apologies: "No matches yet — upload a resume to begin scanning."

## What to avoid

- Generic recruiter-website aesthetics (blue corporate gradients, stock photos of handshakes, smiling office people)
- Overuse of the accent green — it should mean something (a strong match), not be a decorative brand color splashed everywhere
- Making the crawler/AI machinery visible to end users — they should only ever see clean, structured results
