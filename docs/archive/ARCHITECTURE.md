# Oracle Architecture Blueprint

## Product

Oracle is a commercial AI coaching platform for competitive gamers.

Oracle must feel like an elite AI coach, not a statistics dashboard.

---

## Core Architecture

Oracle follows this structure:

UI
↓
Services
↓
Repositories
↓
Database

AI intelligence follows this structure:

Session Data
↓
Repositories
↓
Engines
↓
OracleBrain
↓
UI

---

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- OpenAI
- Vercel

---

## Core Systems

- Oracle AI
- OracleBrain
- Behaviour Engine
- Trend Engine
- Prediction Engine
- AI Coach
- Operator Profile
- Session History
- Memory Engine
- XP Engine
- Achievement Engine
- Career System

---

## Folder Strategy

Current and future systems should move toward:

```txt
lib/
  oracle/
    behaviour/
    trend/
    prediction/
    repositories/
    memory/
    coach/
    services/
    types/