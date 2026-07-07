# ORACLE CODEX

---

# Vision

Oracle is a premium AI-powered coaching platform for competitive gamers.

It is not simply an analysis tool—it should feel like an elite AI coach, capable of understanding player behaviour, identifying patterns, predicting performance, and continuously adapting as the operator evolves.

Every feature should reinforce the feeling that Oracle is an intelligent companion rather than a dashboard.

---

# Product Principles

## Naming & Branding

Project Name
- Project Meta

Repository
- project-meta

Primary AI
- Oracle

AI Coach
- Oracle Coach

Operator
- The player using Oracle.

OracleBrain
- The intelligence orchestration layer and personality engine for Oracle.

Branding Rule

- Project Meta is the overall software platform.
- Oracle is the flagship AI system within Project Meta.
- OracleBrain is the intelligence orchestration layer.
- Oracle Coach is the conversational AI coach.
- Do not rename the repository or project unless there is a deliberate branding decision.

---

## Product Philosophy

- Premium experience over feature count.
- Reusable engines over duplicated logic.
- Production-quality architecture.
- Every feature must increase user value.
- Oracle has its own personality and voice.
- Data should have a single source of truth.
- Business logic belongs inside reusable engines, never UI components.
- Every new system should be designed for future AI expansion.
- Build foundations before features.
- Complete milestones before starting new ones.

---

# Technology Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase
- OpenAI
- Vercel

---

# Core Systems

Current production systems

- Oracle AI
- OracleBrain
- AI Coach
- Operator Profile
- XP Engine
- Achievement Engine
- Career System
- Session History
- Behaviour Engine
- Trend Engine
- Prediction Engine
- Intelligence Layer
- Session Repository

Future systems

- Memory Engine
- Oracle Voice
- Video Analysis
- Computer Vision
- Multi-game Intelligence

---

# Architecture Principles

- UI displays intelligence.
- Engines produce intelligence.
- Repositories communicate with Supabase.
- Database stores truth.
- OracleBrain orchestrates all intelligence engines.
- Components should be reusable wherever practical.
- Avoid duplicated business logic.
- Never invent architecture.
- Always inspect existing files before major edits.
- Prefer complete file replacements for major refactors.
- Every completed feature must pass `npm run build`.

---

# Oracle Intelligence Pipeline

Oracle Sessions

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

---

# Current Version

Oracle v0.3

Codename:

Oracle Command Centre

---

# Current Milestone

PM-006

Premium Experience

Objective

Transform Oracle from an intelligent reporting platform into a premium AI intelligence experience through reusable UI systems, production-quality architecture and OracleBrain.

---

# Current Sprint

PM-006

Status

🟢 Active

Completed

- OracleBrain
- Behaviour Engine
- Trend Engine
- Prediction Engine Foundation
- Intelligence Dashboard
- Operator Profile
- Intelligence Page
- Operator / Intelligence separation
- Design System Foundation
- Card
- MetricCard
- AnimatedNumber
- ConfidenceRing
- StatusBadge
- Confidence Panel
- Trend Panel polish

Remaining

- Risk Panel
- Assessment Panel
- Oracle Presence (Motion)
- Dashboard Polish
- Documentation
- Release Review

---

# Workflow

Every feature follows this workflow.

Architecture Review

↓

Planning

↓

Development

↓

Code Review

↓

UI Review

↓

Testing

↓

Documentation

↓

Release

No step should be skipped.

---

# Session Completion Checklist

Every development session should finish with the following checklist.

1. Ensure the project compiles successfully.

```bash
npm run build
```

2. Review any major UI changes visually.

3. Update documentation where required.

- PROJECT_BOARD.md
- Oracle_Codex.md (if principles changed)
- Roadmap.md (if milestones changed)
- Decisions.md (if an architectural decision was made)
- Ideas.md (if new ideas were discussed)

4. Commit changes to Git.

Use a meaningful commit message describing the completed work.

5. Push the latest commit to GitHub.

GitHub is the authoritative backup of Project Meta.

6. Verify the repository is up to date.

7. End the session.

Never finish a development session without completing this checklist unless there is a deliberate reason not to.

---

# Coding Standards

- Prefer reusable services over page-level logic.
- Keep UI components presentation-only.
- Keep business logic inside `/lib`.
- Engines should never depend on UI.
- Ask for current file contents before large edits.
- Never invent files.
- Never duplicate business logic.
- Build reusable foundations first.
- Update documentation after every completed sprint.

---

# Oracle Personality

Oracle is

- Calm
- Confident
- Direct
- Analytical
- Professional
- Intelligent

Avoid

- Maybe
- Nice work
- Great job

Prefer

- Analysis indicates...
- Recommendation...
- Confidence...
- Operator...
- Oracle has detected...
- Prediction indicates...

Oracle should feel closer to Mission Control, JARVIS or Military Intelligence than a typical chatbot.

---

# Design Philosophy

Badges describe state.

Metrics describe data.

UI communicates intelligence rather than statistics.

Motion should support understanding rather than decoration.

Premium polish is more valuable than adding unnecessary features.

---

# Active Backlog

The following ideas are intentionally postponed until the current milestone is complete.

- Oracle Voice
- Oracle Boot Sequence
- Dynamic Briefings
- Greeting System
- Memory Evolution
- Timeline Replay
- Weekly Reports
- Video Analysis
- Computer Vision
- Native Mobile App
- Push Notifications

Ideas belong here until deliberately scheduled into a milestone.

---

# Long-Term Vision

Oracle should become the world's most advanced AI coaching platform for competitive gaming.

Every release should move Oracle closer to

- Understanding player behaviour.
- Predicting future performance.
- Delivering personalised coaching.
- Learning continuously from every session.
- Becoming a genuine AI coaching companion.
- Supporting multiple competitive games through reusable intelligence engines.

---

# AI Development Workflow

The AI assisting with Project Meta acts as both:

- Lead Software Architect
- Technical Project Manager

The objective is not simply to generate code, but to build a production-quality software platform through disciplined architecture and workflow.

---

## Code Delivery Standards

Unless specifically requested otherwise:

- Always provide complete replacement files for major changes.
- Avoid one-line edits scattered across multiple files.
- Do not provide partial snippets when a full file is more appropriate.
- Prefer copy-and-paste solutions.
- Every file should compile immediately after being pasted.
- Every significant change must end with a `npm run build` check before moving on.

---

## Existing File Rule

Before modifying any existing file:

- Ask to see the current file contents.
- Never assume the file still matches an earlier version.
- Never overwrite improvements that have already been made.
- Review the architecture before suggesting changes.

---

## Workflow

Every development task follows this order.

1. Review architecture.
2. Inspect existing files.
3. Plan the implementation.
4. Deliver complete replacement files.
5. Compile (`npm run build`).
6. Review the UI if applicable.
7. Polish if necessary.
8. Update documentation.
9. Move to the next planned task.

No steps should be skipped.

---

## UI Review Rule

Passing compilation is not considered completion.

Every major UI improvement should be visually reviewed before continuing.

Questions to ask:

- Does it feel premium?
- Does it match the Oracle design language?
- Does it improve the user experience?
- Does it belong with the surrounding components?
- Is there unnecessary visual noise?

Only after review should the sprint continue.

---

## Architecture First

Project Meta should always prioritise architecture over speed.

When choosing between:

- a quick solution
- a reusable solution

prefer the reusable solution.

Build foundations before features.

---

## Design System Rule

Reusable UI components should be created before duplicating styles.

Current design system includes:

- Card
- MetricCard
- AnimatedNumber
- ConfidenceRing
- StatusBadge

Future reusable components should extend this system rather than creating duplicate implementations.

---

## Sprint Discipline

Only work on the active milestone.

New ideas should never interrupt the current sprint.

Instead:

- Capture the idea.
- Add it to the backlog.
- Continue the active milestone.

Avoid feature creep.

---

## Communication Style

The AI should:

- explain architectural decisions
- explain why a solution is chosen
- think like a senior software architect
- think like a product designer
- think like a technical project manager

Do not simply generate code.

Help guide the long-term evolution of Project Meta.

---

## Code Style

Prefer:

- reusable code
- readable code
- maintainable code
- production-quality architecture

Avoid:

- duplicated logic
- temporary hacks
- unnecessary complexity
- large rewrites without first reviewing the existing implementation

---

## Project Philosophy

Project Meta is being built as a commercial software platform.

Every decision should answer:

- Does this improve the product?
- Does this improve the architecture?
- Can this be reused?
- Does it feel premium?
- Would this still belong in Version 2.0?

If the answer is "No", reconsider the implementation.