# Onebox

A **personal project** born from the frustration of juggling multiple inboxes, missing follow-ups, and manually typing repetitive replies.
**ReachInbox Onebox** is my attempt to build a minimal, real-time multi-account email dashboard — with built-in AI classification, search, and reply assistance — to make email management *smarter and calmer*.

---

## What It Does

A feature-complete, minimal Onebox that syncs emails in real-time, classifies them using AI, indexes them for instant search, triggers smart notifications, and even suggests context-aware replies using RAG.

---

## 1. Real-Time IMAP Email Sync

Built with persistent IMAP connections (`ImapFlow`) and live `IDLE` updates — no polling or cron jobs.
It syncs all inboxes I care about, automatically categorizes new messages, and stores them in Elasticsearch for quick access.

**Highlights:**

* Multi-account support (configurable in `imap.services.ts`)
* Initial backfill for the last 30 days
* Real-time message ingestion (`client.on('exists')`)
* Lightweight parsing via `mailparser`

*(Future idea: add OAuth2, retry/backoff, and multi-folder sync)*

---

## 2. Searchable Email Storage (Elasticsearch)

Every message is indexed for blazing-fast search and filtering.

* Local ES index (`reachinbox_emails`)
* Auto-creates index on startup
* Indexed fields: subject, body, from/to, folder, accountId, category, date, uid
* Endpoints:

  * `GET /search?q=...` – full-text multi_match
  * `GET /get-all-email?page=` – paginated listing (100/page)
  * `GET /get-filtered-emails?accountId=&folder=&category=&page=` – precise filtering

---

## 3. AI-Powered Categorization

Because not every email deserves equal attention.

* Uses **Google Gemini** (`gemini-2.5-flash-lite`)
* Categories: `Interested`, `Meeting Booked`, `Not Interested`, `Spam`, `Out of Office`
* JSON-schema validated output with fallback handling
* Every new or historical email is classified before indexing

---

## 4. Smart Notifications (Slack + Webhook)

If a message is marked as **Interested**, I get notified instantly:

* Slack DM via webhook
* Automation webhook (e.g. to trigger follow-up tools or custom scripts)

If no webhook is configured, it just logs a friendly warning — no crashes.

---

## 5. Onebox Frontend (Next.js 15 + React 19)

A simple, clean UI that helps me stay on top of what matters.

* Email list with pagination (100/page)
* Filters by account, folder, category
* Full-text search across indexed emails
* Quick stats and category chips
* AI-powered reply modal for instant responses
* Responsive layout (sidebar for desktop, adaptive mobile view)

---

## 6. AI Suggested Replies (RAG-Based)

When writing back, I wanted my past notes and snippets to help me.
This feature combines **semantic search (Pinecone)** and **Gemini** to suggest context-aware replies.

* Pinecone vector DB (`namespace: general`)
* Curated knowledge base: product info, objection handling, scheduling snippets
* Retrieval: top-3 semantic matches → Gemini prompt → structured reply suggestions
* Endpoint: `GET /suggest-replies?subject=&body_text=`
* Integrated into the UI’s reply modal (up to 3 concise options)

---

## Architecture Overview

**Backend (Express + TypeScript)**

1. IMAP Sync → Parse → Categorize → Index
2. Notification pipeline (Slack + Webhooks)
3. REST API (search, filters, replies)
4. RAG workflow (Pinecone + Gemini)

**Frontend (Next.js App Router)**

* `EmailDashboard` manages state for search, filters, and pagination
* Service layer wraps backend APIs
* Clean UI built around utility and clarity

**Data Flow:**
`IMAP → Parse → Categorize → Index → (Notify) → Frontend via Elasticsearch`

---

## API Summary

| Endpoint               | Params                                    | Description                |
| ---------------------- | ----------------------------------------- | -------------------------- |
| `/get-all-email`       | `page`                                    | Paginated inbox (100/page) |
| `/get-filtered-emails` | `accountId`, `folder`, `category`, `page` | Filtered listing           |
| `/search`              | `q`                                       | Full-text search           |
| `/suggest-replies`     | `subject`, `body_text`                    | RAG reply suggestions      |

---

## Environment Setup

### Backend `.env`

```env
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

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Local Setup

### Backend

1. `cd backend && npm install`
2. Start Elasticsearch: `cd elastic-search && docker compose up -d`
3. (Optional) Populate Pinecone KB – uncomment `await run();` once in `server.ts`
4. `npm run dev`
5. Re-comment `run();` to avoid duplicate upserts

### Frontend

1. `cd frontend && npm install`
2. `npm run dev`
3. Open `http://localhost:3000`

---

## Design Choices & Simplifications

* App passwords instead of OAuth (to focus on core logic)
* Single mailbox (extendable)
* Minimal error handling; no retry queue yet
* Pinecone chosen for simplicity (easily swappable with Qdrant or others)

---

## Future Improvements

* OAuth2 login + token rotation
* Bulk indexing optimization
* Thread grouping & delivery status
* WebSocket push updates for live UI
* Dead-letter queue for webhook failures

---

## About This Project

I built **Onebox** to make my own email workflow less chaotic — a single place that brings together all my accounts, lets AI do the sorting, and gives me smart context before replying.

What started as an experiment in IMAP, Elasticsearch, and AI workflows has become a real personal productivity tool — and a fun playground for integrating real-time sync, search, and RAG in a cohesive system.
