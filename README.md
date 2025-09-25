## ReachInbox Onebox (Assignment Submission)

Feature–complete minimal implementation of a multi‑account real‑time email Onebox with search, AI classification, notifications, and RAG reply suggestions.

---
## 1. Real‑Time IMAP Email Sync
Implemented using persistent IMAP connections (ImapFlow) with IDLE events – no cron / polling.
Highlights:
* Supports multiple accounts (array in `imap.services.ts`; one active + sample commented for extension)
* Initial backfill: last 30 days (date filter during `fetch`)
* Live updates: `client.on('exists')` indexes the newest message immediately
* Normalized document stored after lightweight parsing (`mailparser`)

Extension ideas (not required but straightforward): add more folders, retry/backoff, OAuth2.

## 2. Searchable Storage (Elasticsearch)
* Local ES (Docker) index: default `reachinbox_emails`
* Auto‑creates index on boot (`indexer()` in `es.config.ts`)
* Indexed fields: subject, body_text, from.address, to, folder, accountId, category, date, uid
* Endpoints:
	- `GET /search?q=...` multi_match across key text fields
	- `GET /get-all-email?page=` paginated (100/doc batch, newest first)
	- `GET /get-filtered-emails?accountId=&folder=&category=&page=` exact term filtering

## 3. AI Email Categorization
* Model: Google Gemini (`@google/generative-ai` – model `gemini-2.5-flash-lite`)
* Categories: Interested, Meeting Booked, Not Interested, Spam, Out of Office
* JSON‑schema constrained generation + validation fallback
* Classification performed on every ingested (historical + real‑time) email before indexing

## 4. Slack & Webhook Integration
* When category === Interested:
	- Slack message via Incoming Webhook
	- External automation webhook (e.g. https://webhook.site) receives JSON payload
* Graceful no‑op if env vars absent (logs a warning only)

## 5. Frontend Onebox UI (Next.js 15 / React 19)
* Email list with pagination (ES backend page size 100) & dynamic count
* Filters: account, folder, client‑side category refinement
* Full‑text search (disables pagination for clarity)
* Category chips & quick stats
* Reply modal with AI suggested replies (Feature 6)
* Modern responsive layout (sidebar on large screens, adaptive on mobile)

## 6. AI Suggested Replies (RAG) – Final Interview Feature
* Vector DB: Pinecone (namespace "general")
* Knowledge base: curated product + objection handling + scheduling snippets (see `vectordb.config.ts`)
* Ingestion helper: `run()` (commented by default; run once to upsert KB)
* Retrieval: semantic search topK=3 → concatenate snippets → Gemini prompt → JSON `{ replies: [...] }`
* Endpoint: `GET /suggest-replies?subject=&body_text=`
* Integrated in UI reply modal (up to 3 concise options)

---
## High‑Level Architecture
Backend (Express + TypeScript)
1. IMAP Sync (ImapFlow) → Parse (mailparser) → Categorize (Gemini) → Index (Elasticsearch)
2. Notification Pipeline (Slack + Webhook) triggered only for Interested
3. REST API layer (search, listing, filters, reply suggestions)
4. RAG Flow: Pinecone semantic search → context → Gemini generation

Frontend (Next.js App Router)
* `EmailDashboard` orchestrates search/filter/pagination state
* Service layer wraps fetch calls; env configurable base URL
* UI components for search, filters, email cards, reply modal

Data Flow (ingest): IMAP → parse → categorize → index → (notify) → UI queries ES.

---
## API Summary
| Endpoint | Query Params | Purpose |
|----------|--------------|---------|
| `/get-all-email` | page (default 1) | Paginated inbox (100/page) |
| `/get-filtered-emails` | accountId, folder, category, page | Precise filtering |
| `/search` | q | Full‑text search across key fields |
| `/suggest-replies` | subject, body_text | RAG based reply suggestions |

All responses are JSON arrays or objects; errors return `{ error: "message" }`.

---
## Environment Variables
Backend `.env` (example):
```
PORT=4000
ES_PORT=http://localhost:9200
ES_INDEX=reachinbox_emails
USER_EMAIL_1=youremail@example.com
USER_PASSWORD_1=app-specific-password
GEMINI_API_KEY=your_gemini_key
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
AUTOMATION_WEBHOOK_URL=https://webhook.site/unique-id
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=reach-inbox-kb
PINECONE_HOST=your-pinecone-host
```

Frontend `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---
## Local Setup (Backend)
1. Install dependencies: `cd backend && npm install`
2. Start Elasticsearch: `cd elastic-search && docker compose up -d`
3. Populate Pinecone KB (one time): uncomment `await run();` in `server.ts` then start once
4. Run server: `npm run dev`
5. Re-comment `run();` after KB load (avoid duplicate upserts)

## Local Setup (Frontend)
1. `cd frontend && npm install`
2. `npm run dev`
3. Open http://localhost:3000

---
## Testing the Features Quickly
1. Confirm ES index logs “Created index reachinbox_emails” or “exists”
2. Watch terminal: initial 30‑day sync + per‑email category logs
3. Send a test email classified as Interested → observe Slack + webhook.site request
4. Use `/search?q=pricing` to validate full‑text
5. Open UI → filter by account / folder / category
6. Open an email → Generate replies (network call to `/suggest-replies`)

---
## Key Trade‑Offs / Simplifications
* OAuth flow & token refresh omitted (app passwords assumed)
* Only INBOX synced (extend by iterating mailboxes)
* Basic error handling & no retry queue yet
* Pinecone chosen for rapid semantic setup; could swap for open-source (e.g. Qdrant) if required

---
## Possible Next Steps (If More Time)
* Add delivery status + thread grouping
* Batch ES bulk indexing for speed
* Dead‑letter queue for failed categorizations / webhooks
* OAuth2 + rotating tokens for Gmail / Outlook
* Websocket push to frontend for near real‑time UI updates

---
## Demo
See attached submission video (≤5 min) showing: sync logs, search, filters, Slack alert, webhook trigger, RAG reply suggestions.

---
## Author
Assignment implementation for ReachInbox Associate Backend Engineer role.

