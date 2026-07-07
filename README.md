# Project Meta

> **Building the world's most advanced AI coaching platform for competitive gaming.**

Project Meta is a software platform focused on creating intelligent coaching systems that help competitive players improve through behavioural analysis, performance prediction and long-term AI guidance.

The flagship product is **Oracle**.

---

# What is Oracle?

Oracle is an AI-powered gaming intelligence platform.

Unlike traditional stat trackers, Oracle is designed to understand **how** an Operator plays rather than simply recording what happened.

Oracle analyses gameplay behaviour, identifies patterns, predicts future performance and delivers personalised coaching recommendations that evolve over time.

Oracle is being built as a long-term AI coaching companion rather than a reporting dashboard.

---

# Current Status

Version

**Oracle v0.3 — Oracle Command Centre**

Current Milestone

**PM-006 — Premium Experience**

Build Status

✅ Passing

---

# Current Features

- Operator Profiles
- Oracle Sessions
- Behaviour Intelligence
- Trend Analysis
- Prediction Engine
- OracleBrain Intelligence Layer
- Confidence Analysis
- Intelligence Dashboard
- Career Progression
- XP System
- Achievement System
- Reusable Design System

---

# Technology Stack

Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

Backend

- Supabase

Artificial Intelligence

- OpenAI

Deployment

- Vercel

---

# Architecture

Oracle follows a layered architecture.

```text
Operator

↓

Oracle Session

↓

Supabase

↓

Repositories

↓

Behaviour Engine
Trend Engine
Prediction Engine

↓

Oracle Intelligence Layer

↓

OracleBrain

↓

Dashboard UI
```

Full architecture documentation is available in:

```text
docs/Architecture.md
```

---

# Documentation

Project Meta maintains comprehensive documentation inside the `/docs` directory.

| Document | Purpose |
|----------|---------|
| Oracle_Codex.md | Engineering philosophy and development standards |
| Architecture.md | Technical architecture |
| Oracle-Principles.md | Oracle personality and behaviour |
| Brand-Bible.md | Visual identity and design system |
| Branding.md | Product naming and hierarchy |
| PROJECT_BOARD.md | Current milestone and sprint |
| Roadmap.md | Long-term product roadmap |
| Decisions.md | Architectural decision log |
| Ideas.md | Future ideas and backlog |
| Manifesto.md | Project vision and philosophy |

---

# Development

Install dependencies

```bash
npm install
```

Start the development server

```bash
npm run dev
```

Production build

```bash
npm run build
```

Run production server

```bash
npm run start
```

---

# Project Structure

```text
app/
components/
docs/
lib/
public/
```

The project follows a modular architecture where business logic is separated from presentation.

UI components display intelligence.

OracleBrain produces intelligence.

Repositories communicate with Supabase.

---

# Design Principles

Project Meta is built around several core principles.

- Premium user experience
- Reusable architecture
- AI-first design
- Production-quality engineering
- Behaviour over statistics
- Intelligence over dashboards
- Long-term maintainability

---

# Vision

Project Meta exists to build AI systems that genuinely improve competitive players.

Oracle is the first product in that journey.

The long-term vision is to create the world's most advanced AI coaching companion capable of understanding player behaviour, predicting future performance and continuously adapting as the Operator evolves.

---

# License

Private Project

Copyright © Project Meta

All rights reserved.