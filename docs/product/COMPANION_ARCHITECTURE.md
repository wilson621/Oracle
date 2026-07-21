# ORACLE COMPANION ARCHITECTURE

Version 1.6

Status: Sprint 14 Companion Guidance Application boundary

---

# Purpose

Oracle Companion is an Oracle Application and Platform subsystem delivered
through an external desktop host for in-game assistance.

Its purpose is to help the Operator:

- Discover hidden content
- Locate collectibles
- Navigate objectives
- Track quests
- Identify missable items
- Access relevant game knowledge
- Receive contextual puzzle hints
- Understand nearby discoveries

Oracle Companion improves the gameplay experience.

It does not replace Oracle Intelligence.

---

# Product Boundary

Oracle consists of two complementary experiences.

## Oracle Intelligence

Oracle Intelligence helps the Operator improve as a player.

It owns:

- Behaviour analysis
- Trend analysis
- Prediction
- Missions
- Strategy
- AI coaching
- Explainability
- Progress tracking

## Oracle Companion

Oracle Companion helps the Operator explore and understand the game.

It owns:

- Overlay presentation
- Hidden-item assistance
- Collectible tracking
- Quest guidance
- Navigation assistance
- Puzzle hints
- Game knowledge
- Contextual discoveries

Oracle Intelligence improves the player.

Oracle Companion improves the experience.

---

# Companion Principle

Oracle Companion is an external desktop application.

The Oracle Platform Constitution is the normative source for this boundary.
Any proposed feature requiring a prohibited technique is an architectural
blocker and must be escalated rather than implemented.

It must never:

- Inject code into a game process
- Modify game memory
- Read protected process memory
- Hook a game's rendering pipeline
- Modify game files
- Simulate gameplay input
- Automate combat
- Control the mouse or keyboard on behalf of the Operator
- Circumvent anti-cheat systems
- Interfere with network traffic
- Provide unfair competitive information

Oracle Companion observes permitted desktop output and presents independent information through its own window.

---

# Overlay Model

Oracle Companion uses an independent desktop overlay window.

The overlay must be:

- Borderless
- Transparent
- Always on top when enabled
- Click-through by default
- Hardware accelerated
- Resizable
- Multi-monitor aware
- DPI aware
- User-positionable
- Independently hideable
- Safe to run above borderless or windowed games

The overlay must sit above the game window.

It must not exist inside the game process.

---

# Interaction Model

Oracle Companion operates in two modes.

## Passive Mode

Passive Mode is the default.

In Passive Mode:

- The overlay is click-through.
- Mouse input passes directly to the game.
- Keyboard input remains with the game.
- Oracle displays information without blocking gameplay.
- The Operator cannot accidentally interact with the overlay.
- Companion does not simulate or redirect game input.

Passive Mode is designed for uninterrupted gameplay.

## Interactive Mode

Interactive Mode is enabled manually by the Operator.

In Interactive Mode:

- The overlay accepts mouse interaction.
- Companion panels can be opened or closed.
- Cards can be moved or resized.
- Settings can be adjusted.
- Search and knowledge tools can be used.
- The game remains untouched.

Interactive Mode is entered and exited using a configurable global shortcut.

The default shortcut should be selected during implementation and must be changeable by the Operator.

## Visibility Mode

The Operator must also be able to:

- Show the overlay
- Hide the overlay
- Temporarily suspend Companion
- Exit Companion completely

These actions must be available through configurable shortcuts and the desktop application controls.

---

# Window Behaviour

The Companion window should support the following states:

## Hidden

The Companion process remains active, but no overlay is visible.

## Passive Overlay

The overlay is visible and click-through.

## Interactive Overlay

The overlay is visible and accepts user interaction.

## Suspended

Screen observation and contextual processing are paused.

## Closed

The Companion application is no longer running.

State transitions must be explicit and controlled by the Operator.

---

# Supported Display Modes

Oracle Companion is intended to work with:

- Borderless windowed games
- Windowed games
- Multi-monitor desktop setups

Exclusive fullscreen support may differ by game, operating system and display configuration.

Beta 1 should prioritise reliable support for borderless windowed mode.

Oracle Companion must not claim universal compatibility until each game and display mode has been tested.

---

# Anti-Cheat and Game Rules

Oracle Companion must be designed conservatively.

Compatibility with one game does not guarantee compatibility with another.

Every supported game must have a documented compatibility profile covering:

- Publisher rules
- Terms of service
- Anti-cheat restrictions
- Screen-capture restrictions
- Overlay restrictions
- Competitive-mode restrictions
- Permitted game APIs
- Permitted accessibility features

A game must not be marked as supported until its compatibility profile has been reviewed.

Where rules are unclear, Companion functionality should remain disabled until the position is confirmed.

Oracle must favour player account safety over feature availability.

---

# Fair-Play Boundary

Oracle Companion exists to assist exploration, discovery and access to game knowledge.

It must not provide information that the Operator could not reasonably obtain through permitted gameplay, approved game data or openly available knowledge.

Companion must not provide:

- Enemy locations hidden from the player
- Information derived from protected memory
- Competitive player tracking unavailable through the game
- Automated aiming
- Automated movement
- Automated interaction
- Combat automation
- Input timing assistance
- Recoil control
- Network manipulation
- Anti-cheat evasion
- Competitive advantages prohibited by the game publisher

For competitive games, Companion features may require a stricter reduced-function mode.

---

# Companion Scope

## Hidden Content

Companion may help identify:

- Collectibles
- Secret rooms
- Easter eggs
- Hidden containers
- Missable quest items
- Optional objectives
- Lore entries
- Environmental puzzles

The source of each discovery should be traceable.

Possible sources include:

- Approved game data
- Publicly documented locations
- User-created tracking data
- Permitted visual recognition
- Official APIs
- Community knowledge that has been reviewed

---

## Quest Assistance

Companion may provide:

- Current objective summaries
- Quest-stage reminders
- Missable-step warnings
- Relevant NPC information
- Item requirements
- Optional objective reminders
- Non-spoiler guidance
- Full guidance when explicitly requested

Guidance should respect the Operator's spoiler preference.

---

## Navigation Assistance

Companion may provide:

- Directional guidance
- Location descriptions
- Map references
- Route suggestions
- Floor or room guidance
- Return-path reminders
- Previously visited location markers

Navigation should remain advisory.

Companion must never control movement.

---

## Puzzle Assistance

Companion may provide progressive assistance.

Suggested hint levels:

1. Subtle clue
2. Strong hint
3. Step guidance
4. Complete solution

The Operator chooses the level of help.

Companion should avoid revealing full solutions unless requested.

---

## Game Knowledge

Companion may surface contextual information about:

- Items
- Weapons
- Armour
- Crafting materials
- NPCs
- Locations
- Quests
- Achievements
- Collectibles
- Lore
- Puzzles
- Game mechanics

Information should be relevant to the current context rather than presented as an unrestricted data dump.

---

## Achievement and Collectible Tracking

Companion may track:

- Collected items
- Missing items
- Completion percentage
- Achievement requirements
- Missable achievements
- Area completion
- Quest completion
- Discovery history

Tracking should be associated with:

- Operator
- Game
- Save or playthrough where applicable
- Platform
- Game version where relevant

---

# Spoiler Controls

Spoiler control is a core Companion requirement.

The Operator should be able to choose:

- No spoilers
- Minimal hints
- Contextual hints
- Full guidance

The selected preference should apply consistently across:

- Quests
- Collectibles
- Puzzles
- Hidden areas
- Bosses
- Story information
- Achievements

Companion should default to the least revealing useful response.

---

# Companion Runtime

Oracle Companion requires an explicit runtime boundary within the Oracle
Platform.

The Companion Runtime remains separate from the Oracle Intelligence Runtime,
while both remain owned by the Oracle Platform.

It owns:

- Desktop application lifecycle
- Overlay-window lifecycle
- Overlay state
- Global shortcuts
- Game detection
- Active-window detection
- Screen-observation coordination
- Context assembly
- Companion feature coordination
- Communication with Oracle services
- Local settings
- Local cache
- Compatibility enforcement

The Companion Runtime coordinates assistance.

It does not contain game-specific knowledge directly.

---

# Technical Architecture

The intended high-level architecture is:

```text
Running Game
      │
      ▼
Permitted Desktop Observation
      │
      ▼
Companion Sensors
      │
      ▼
Companion Context
      │
      ▼
Companion Runtime
      │
      ├── Game Connector
      ├── Knowledge Service
      ├── Discovery Service
      ├── Navigation Service
      ├── Quest Service
      └── Overlay Controller
      │
      ▼
Companion Overlay Window
```

Oracle Intelligence remains separate:

```text
Oracle Platform
      │
      ├── Oracle Intelligence Runtime
      │
      └── Oracle Companion Services
```

The two systems may share Operator identity, game context and approved data contracts.

They must not become tightly coupled.

---

# Primary Technology Direction

Oracle Companion should use the best technology for each responsibility.

The initial direction is:

## Desktop Shell

TypeScript-based desktop application.

A technology such as Electron may be used if it provides the required:

- Transparent windows
- Frameless windows
- Click-through behaviour
- Global shortcuts
- Multi-monitor support
- Windows integration
- Packaging support
- Auto-update support

The final desktop-shell decision must be confirmed through a technical proof of concept.

## Overlay Interface

React and TypeScript should be preferred so Companion can reuse Oracle's existing design language and frontend expertise.

## Computer Vision

Computer-vision functionality may use Python where it provides a clear advantage through libraries such as:

- OpenCV
- OCR tooling
- Object-detection models
- Image preprocessing
- Template matching

Python should operate as a specialist service.

It should not own the desktop UI or Oracle's core product logic.

## Shared Services

Oracle Platform services may continue using:

- Next.js
- TypeScript
- Supabase
- OpenAI services
- Structured APIs

Technology decisions must follow responsibility boundaries rather than language preference.

---

# Companion Sensors

Companion Sensors observe permitted information and convert it into structured events.

Potential sensors include:

- Active-window detector
- Game-process presence detector
- Screen-capture adapter
- OCR adapter
- HUD-region detector
- Map-region detector
- Menu-state detector
- Game API connector
- User-input context detector
- Manual context input

Sensors observe.

They do not decide what guidance to show.

---

# Screen Observation

Screen observation must be:

- User enabled
- Clearly disclosed
- Pausable
- Limited to the selected game or display where possible
- Processed only for defined Companion features
- Protected according to Oracle privacy standards

Companion should avoid collecting unrelated desktop content.

Where technically possible, observation should be constrained to the target game window or a user-defined capture region.

---

# Vision Services

Vision Services interpret permitted screen data.

Possible responsibilities include:

- Text recognition
- HUD-state recognition
- Menu recognition
- Map recognition
- Item recognition
- Location recognition
- Quest-state recognition
- Collectible recognition
- Puzzle-state recognition

Vision Services return structured observations.

Example:

```json
{
  "gameId": "example-game",
  "location": "Old Ruins",
  "screenState": "exploration",
  "detectedText": ["Ancient Door"],
  "possibleDiscoveries": [
    {
      "type": "collectible",
      "confidence": 0.84
    }
  ]
}
```

Vision Services must not directly render the overlay.

---

# Game Connectors

Each supported game should have a dedicated connector.

A Game Connector may define:

- Game identity
- Executable detection
- Window-title matching
- Supported display modes
- Screen regions
- HUD layouts
- Map layouts
- Quest models
- Collectible models
- Knowledge sources
- Compatibility rules
- Restricted features
- Version support

Example structure:

```text
games/
  example-game/
    connector
    compatibility
    screen-regions
    quests
    collectibles
    maps
    knowledge
```

Game-specific logic must remain isolated from the shared Companion Runtime.

---

# Companion Context

Companion Context is the shared input used by Companion capabilities.

It may contain:

```ts
type CompanionContext = {
  operatorId: string;
  gameId: string;
  gameVersion: string | null;
  activeWindow: {
    title: string;
    bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  } | null;
  overlayMode: "hidden" | "passive" | "interactive" | "suspended";
  location: string | null;
  currentQuest: string | null;
  currentObjective: string | null;
  discoveries: CompanionDiscovery[];
  spoilerPreference: CompanionSpoilerPreference;
  capturedAt: string;
};
```

The final contract should evolve through implementation.

Companion Context should remain structured and versioned.

---

# Companion Events

Companion should communicate through structured events.

Examples:

- GameDetected
- GameClosed
- GameWindowChanged
- OverlayShown
- OverlayHidden
- InteractiveModeEnabled
- InteractiveModeDisabled
- LocationDetected
- QuestDetected
- ObjectiveDetected
- DiscoveryDetected
- CollectibleRecorded
- HintRequested
- CompanionSuspended

Events should be timestamped and traceable.

---

# Companion Discoveries

A discovery represents useful contextual assistance.

Example:

```ts
type CompanionDiscovery = {
  id: string;
  type:
    | "collectible"
    | "secret"
    | "quest_item"
    | "optional_objective"
    | "lore"
    | "puzzle"
    | "achievement";
  title: string;
  summary: string;
  confidence: number;
  location: string | null;
  source: string;
  spoilerLevel: "none" | "minor" | "major";
  detectedAt: string;
};
```

Companion must avoid presenting low-confidence discoveries as facts.

---

# Confidence

Every automated observation should carry confidence.

Confidence may consider:

- Vision certainty
- OCR certainty
- Location certainty
- Game-version compatibility
- Data-source quality
- Context agreement
- Historical confirmation

Low-confidence results should be:

- Hidden
- Labelled as uncertain
- Presented as optional suggestions
- Sent for additional verification

Confidence is never invented.

---

# Knowledge Sources

Companion knowledge may come from:

- Official game APIs
- Official game documentation
- Licensed datasets
- Approved public sources
- Curated community information
- User-provided notes
- Oracle-generated structured knowledge

Every knowledge source should record:

- Source name
- Source type
- Attribution requirements
- Usage rights
- Last verification date
- Supported game version
- Confidence level

Oracle must not assume public availability means unrestricted commercial use.

---

# Privacy

Oracle Companion may observe sensitive desktop information if poorly constrained.

Privacy controls are therefore mandatory.

Companion must provide:

- Clear capture indicator
- Pause control
- Capture-area selection where supported
- Data-retention controls
- Local-processing preference where available
- Deletion controls
- Explanation of what is captured
- Explanation of what is uploaded
- Explanation of what remains local

Companion should minimise data collection.

Only information required for an enabled feature should be processed.

---

# Security

The desktop application must:

- Use signed releases
- Use secure update channels
- Validate downloaded updates
- Protect authentication tokens
- Avoid storing secrets in plain text
- Use secure API communication
- Restrict preload and desktop privileges
- Prevent arbitrary remote content from gaining desktop access
- Validate all IPC messages
- Apply least-privilege principles

Desktop integration must not weaken Oracle Platform security.

---

# Performance

Companion must remain lightweight enough not to materially degrade gameplay.

Performance targets should cover:

- CPU usage
- GPU usage
- Memory usage
- Capture frequency
- Vision-processing frequency
- Overlay-render time
- API latency
- Startup time

Heavy processing should be:

- Throttled
- Pausable
- Performed only when needed
- Moved off the UI thread
- Configurable by quality level

The Operator must be able to disable expensive features.

---

# Offline Behaviour

Companion should define clear offline behaviour.

Potential offline capabilities include:

- Overlay shell
- Local settings
- Cached knowledge
- Previously recorded collectibles
- Manual search of cached data
- Local map references
- Basic game detection

Cloud-dependent features should clearly indicate when connectivity is required.

---

# Companion Presentation

The overlay should remain calm, minimal and unobtrusive.

It should feel like Oracle.

The overlay should prioritise:

- Clarity
- Restraint
- Context
- Confidence
- Fast dismissal
- Minimal obstruction
- Readability over gameplay
- Consistent positioning

The overlay should not become a dashboard placed over the game.

It should present only what is useful at that moment.

---

# Overlay Components

Potential overlay components include:

## Discovery Card

Displays nearby or relevant hidden content.

## Objective Card

Displays current objective guidance.

## Quest Card

Displays quest progress and missable information.

## Hint Card

Displays progressive puzzle or navigation hints.

## Collectible Tracker

Displays completion progress.

## Search Panel

Allows the Operator to search game knowledge while in Interactive Mode.

## Companion Status

Displays:

- Active game
- Overlay state
- Capture state
- Compatibility state
- Connection state

Beta 1 should begin with the smallest useful set.

---

# Notifications

Companion notifications should be:

- Relevant
- Dismissible
- Rate limited
- Non-blocking
- Spoiler aware
- Confidence aware

Repeated low-value notifications must be avoided.

The Operator should control notification categories.

---

# Accessibility

Companion should support:

- Scalable text
- High-contrast mode
- Reduced motion
- Configurable placement
- Keyboard navigation in Interactive Mode
- Screen-reader-friendly desktop controls where practical
- Colour-independent status communication
- Configurable notification duration

Accessibility should be considered from the first overlay prototype.

---

# Multi-Monitor Support

Companion must detect:

- The game display
- Display resolution
- Display scaling
- Window bounds
- Display changes

The overlay should follow the selected game window when appropriate.

It must not unexpectedly appear over unrelated applications.

---

# Configuration

Companion settings should include:

- Overlay enabled
- Passive-mode shortcut
- Interactive-mode shortcut
- Show/hide shortcut
- Overlay opacity
- Overlay scale
- Overlay position
- Spoiler preference
- Notification categories
- Capture source
- Capture frequency
- Performance profile
- Game-specific settings
- Data-retention preferences

Settings should be stored locally and optionally synchronised to the Operator account.

---

# Logging and Diagnostics

Developer diagnostics should record:

- Application lifecycle
- Game detection
- Window detection
- Overlay state changes
- Capture state
- Sensor results
- Vision-processing duration
- API requests
- Connector compatibility
- Errors
- Performance metrics

Logs must avoid storing unnecessary captured content or sensitive user data.

Customer-facing diagnostics should use clear language and avoid exposing internal implementation details.

---

# Beta 1 Scope

Beta 1 must prove the complete Companion experience without attempting universal game support.

## Required Beta 1 Capabilities

- Independent desktop application
- Borderless transparent overlay
- Click-through Passive Mode
- Interactive Mode
- Configurable show/hide shortcut
- Game detection for the selected Beta 1 title
- Game-window tracking
- Multi-monitor awareness
- Basic Companion Context
- At least one game connector
- At least one reliable contextual-assistance flow
- Collectible or hidden-content assistance
- Quest or objective assistance
- Spoiler controls
- Companion settings
- Clear capture and privacy controls
- Compatibility documentation
- Signed distributable build
- Crash and error reporting
- Performance monitoring
- End-to-end testing

## Not Required for the First Companion Prototype

- Universal game support
- Combat coaching
- Health warnings
- Ammo warnings
- Resource warnings
- Input automation
- Full local AI
- Full computer-vision coverage
- Every collectible
- Every quest
- Voice control
- Mobile Companion
- Console overlay support

These may be added only after the core Companion experience is stable.

---

# Beta 1 Success Criteria

Oracle Companion Beta 1 is successful when an Operator can:

1. Launch Companion.
2. Launch the supported game.
3. Have Companion detect the game safely.
4. See a transparent click-through overlay.
5. Toggle Interactive Mode.
6. Receive useful exploration or discovery assistance.
7. Request a hint without leaving the game.
8. Track at least one form of progress.
9. Hide or suspend Companion instantly.
10. Complete a session without Companion materially affecting game performance.
11. Understand what Companion observed and why.
12. Use Companion without violating the supported game's rules.

---

# Repository Strategy

The separate-repository layout below was the original planning direction. The
accepted Platform decision and current implementation keep Companion in the
Oracle repository so it can share controlled lifecycle, contracts and
diagnostics. A future repository split would require a new ADR and migration
plan; it is not current architecture.

Recommended structure:

```text
Oracle/
  oracle-platform/
  oracle-companion/
  oracle-vision/
```

## oracle-platform

Owns:

- Web application
- Accounts
- Oracle Intelligence
- APIs
- Supabase integration
- Operator data
- Shared cloud services

## oracle-companion

Owns:

- Desktop shell
- Overlay
- Global shortcuts
- Game detection
- Desktop settings
- Companion Runtime
- Game connectors
- Companion presentation

## oracle-vision

Owns specialist vision services if and when a separate service becomes justified.

Vision may begin inside the Companion repository during experimentation, but production boundaries should remain clear.

---

# Shared Contracts

The Platform and Companion applications should communicate through explicit versioned contracts.

Potential shared contracts include:

- Operator identity
- Authentication
- Companion Context
- Companion Discovery
- Game identity
- Quest state
- Collectible progress
- Companion settings
- Knowledge requests
- Knowledge responses
- Compatibility status

Shared contracts should not require either application to import the other application's internal code.

---

# Companion Guidance Framework

Sprint 14 establishes one permanent Guidance Framework for every form of
Companion guidance. The framework transforms immutable Session Context into a
shared, explainable recommendation language without granting guidance systems
Session lifecycle or gameplay authority.

The ownership model is explicit:

```text
Platform / Companion Foundation
        │
        ├── Immutable Guidance contracts
        ├── Session projection contract
        ├── Runtime validation
        ├── Versioning and compatibility
        └── Provider boundary
        │
        ▼
Oracle Services
        │
        ├── Generation
        ├── Selection
        ├── Ranking
        └── Orchestration
        │
        ▼
Oracle Applications
        │
        └── Presentation and Operator interaction
        │
        ▼
Game Integrations
        │
        └── Game-specific packages and knowledge
```

Game Integrations consume the framework. They do not define it. Applications
present validated Guidance. They do not generate or rank it. Services will
coordinate providers in later Sprint 14 work. No generation, selection or
presentation runtime is introduced by the contract foundation.

## Guidance Contract

`oracle.companion-guidance` version 1 represents an explainable recommendation
to the Operator. It is not a command to a game or a gameplay-control payload.

Every Guidance result contains:

- open category and type identifiers
- title, summary, fixed advisory delivery and recommendation
- optional detailed explanation
- rationale and structured evidence
- calculated confidence and derived confidence level
- priority
- source attribution where applicable
- spoiler classification
- optional reassessment trigger
- provider provenance
- game, integration and Companion compatibility metadata
- creation and optional expiry timestamps

Curated, deterministic, AI-generated and hybrid providers use the same result
contract. AI providers do not receive a separate Guidance model.

## Immutable Session Projection

`oracle.companion-guidance-session-projection` version 1 is a data-only view of
authoritative Companion Session Context. It contains Session identity, capture
time, a minimal serializable Session-context record and optional serializable
game identity and context. The general context record allows future
performance, clip, Session-coaching and Operator-development Services to
project only the information they require without exposing the Session object
or replacing the contract.

The projection:

- is constructed from authoritative Session Context
- is cloned and deeply frozen during validation
- cannot mutate or transition the Session
- contains no Electron object, desktop controller, detector, process handle,
  integration instance or provider implementation
- grants no attachment, presentation or lifecycle authority

Guidance requests may include Operator intent and maximum spoiler level, but
remain immutable data. Future Services will decide which providers execute.

## Validation and Immutability

Version 1 validators inspect the complete incoming value, including unknown
future extension fields. They reject:

- functions and executable values
- symbols and symbol keys
- accessors and non-data properties
- class instances and platform objects
- circular references
- sparse arrays
- non-finite numbers
- malformed timestamps, versions, URIs, references and enumerations

Accepted values are normalised into new objects and deeply frozen. Provider
output remains untrusted `unknown` data until it passes this boundary.

Category, type, source-type and provenance-method identifiers are deliberately
open strings. Consumers must handle unfamiliar values safely. This allows new
guidance domains to appear without redesigning the contract or breaking older
consumers.

## Compatibility

Guidance, Guidance Request and Session projection contracts version
independently. Version 1 guarantees that existing required fields retain their
names, types and meanings. Compatible optional serializable fields may be added
when older consumers can ignore them safely. Incompatible schema changes
require a new contract version, migration plan and accepted ADR.

The Guidance Framework is designed to extend to:

- curated game knowledge
- AI-generated guidance
- performance-analysis guidance
- clip-analysis guidance
- Session-level coaching
- long-term Operator development

These capabilities extend the shared model. They do not replace it.

## Fair Play Boundary

The Constitution defines Oracle's permanent External Companion and Fair Play
rule. ADR-032 explains why Guidance adopts this ownership and contract model.

Guidance must never become a mechanism for injection, memory inspection or
modification, hooks, executable patching, gameplay automation, simulated input,
anti-cheat interaction or real-time tactical assistance that requires access
to the game process. Guidance helps the Operator through coaching, insight and
permitted knowledge while Oracle remains entirely external.

## Guidance Provider Service

Sprint 14 Commit 2 implements the Services-owned orchestration boundary for
Guidance providers. Providers are discovered only through explicit constructor
injection. The Service validates and snapshots each package manifest, rejects
duplicate provider identities and retains no mutable global provider registry.

The provider lifecycle is:

```text
Injected
    │
    ▼
Manifest Validated and Snapshotted
    │
    ▼
Eligibility Evaluated
    ├── Ineligible → Recorded without execution
    │
    ▼
Executed Sequentially
    │
    ▼
Each Output Validated Independently
    ├── Invalid → Structured failure
    ├── Disallowed spoiler or expired → Filtered
    │
    ▼
Immutable Result Produced
```

Eligibility is game agnostic. It considers only the provider manifest, active
integration identity and optional category or type requested through the
shared contract. A provider may declare `*` for categories or types when it can
support present and future identifiers. Ineligible providers are never called.

Execution is deterministic and supports both synchronous and asynchronous
providers through one Promise-based Service method. Providers execute
sequentially in injection order. Accepted Guidance retains provider injection
order and each provider's original output order. The Service does not sort by
priority or confidence and does not make coaching, personalisation or
recommendation decisions.

Every output remains unknown until the Platform Guidance validator accepts it.
The Service additionally verifies:

- provenance matches the executing package manifest
- category and type were declared by the provider
- requested category and type are respected
- integration compatibility matches the immutable Session projection
- integration-specific providers declare integration-specific output
- accepted Guidance identifiers remain unique
- spoiler and expiry constraints are respected

One provider exception does not prevent later providers from executing. One
invalid item does not discard valid sibling items from the same provider.
Failures contain provider identity and version, lifecycle stage, stable code,
diagnostic message and optional output index. Provider execution summaries
record ineligibility, completion, filtering and failure counts for future
operational reporting.

The Service returns only deeply immutable Guidance, structured failures and
provider execution summaries. It exposes no provider instance and introduces
no Guidance content, UI, AI inference, renderer access, desktop lifecycle
authority or game-specific behaviour.

## First Game Integration Guidance Package

The Call of Duty integration provides the first curated Guidance package and
is the canonical structural example for future Game Integrations. It consumes
the Platform contract and is explicitly injected into the Services-owned
provider boundary; it does not define a parallel contract, register itself or
introduce integration-specific behaviour into the Service.

Its responsibilities are limited to:

- an immutable, reviewed Warzone guidance catalogue
- source and evidence attribution
- integration and experience eligibility based on the immutable Session
  projection
- deterministic conversion of catalogue entries into Guidance candidates
- package ownership, scope, assumptions and Fair Play documentation

The initial catalogue covers pre-session control preparation, loadout
familiarity, fundamentals practice and conditional PC shader-preload readiness.
It deliberately excludes named weapon recommendations, seasonal balance
claims, map tactics, live observation and any behaviour requiring game-process
interaction.

The provider snapshots its catalogue dependency at construction and uses no
runtime networking or system clock. For an identical validated request and
catalogue snapshot, it returns structurally identical candidates in catalogue
order. Category and type filtering is exact. It does not rank, personalise,
schedule or present recommendations.

Warzone Guidance is produced only when the Session projection conclusively
identifies the Warzone experience. A Call of Duty family-level detection is
not sufficient, and an unknown future integration version remains ineligible
until reviewed. This is integration knowledge inside the provider, not a new
rule in the shared orchestration Service.

The reviewed sources, accepted and excluded claims, assumptions, Fair Play
assessment and known limitations are recorded in
`docs/product/CALL_OF_DUTY_GUIDANCE_PACKAGE.md`.

## Companion Guidance Application Boundary

Sprint 14 Commit 4 adds the Applications-owned adapter between validated
Guidance Service results and future React presentation. The boundary is a pure
projection: it receives a completed Service result and returns a deeply
immutable application state. It cannot discover or execute providers and has
no access to provider registration, Session lifecycle, desktop runtime,
renderer objects or game-specific knowledge.

The application state has five explicit outcomes:

- `loading` while a future composition layer prepares a result
- `ready` when one or more cards are available without failures
- `empty` when the completed request has no applicable guidance
- `partial-success` when useful cards remain but some guidance was unavailable
- `unavailable` when no card can be presented safely

React will consume application-owned Guidance Card view models rather than raw
Platform Guidance contracts. Cards retain the presentation information needed
for an explainable experience: category, type, recommendation, detail,
rationale, evidence, confidence, priority, source attribution, spoiler level,
reassessment trigger and freshness timestamps. Open category, type and source
identifiers receive safe display labels without becoming closed enumerations.

The projection deliberately removes contract identity, compatibility metadata,
provider provenance and Service execution summaries from each card. React does
not need those domain or orchestration details in order to render guidance.
Card order remains Service order; the Application does not rank, select or
personalise recommendations.

Structured failures are collapsed by failure stage into stable Operator-safe
diagnostics. Execution failures become a generic source-availability warning.
Rejected output becomes a generic safely-omitted-content warning. Provider
identifiers, versions, internal codes, exception messages and output indexes
never enter application state. Repeated failures of the same class produce one
diagnostic, avoiding implementation leakage and notification noise.

This boundary introduces no UI, renderer integration, networking, provider
composition, AI inference or runtime orchestration. A later commit may render
the immutable application models through `/companion` without importing raw
Guidance or provider contracts into React.

---

# Current Verified Implementation

As of Sprint 13, Oracle contains two distinct Companion foundations:

- `lib/companion` defines the Platform-level Companion Runtime, presentation
  state, extensions, capabilities and connector contracts.
- `desktop/companion` defines the active desktop Session lifecycle and immutable
  Context snapshots used by the Electron host.

The Electron host additionally implements window discovery, deterministic
target selection, attachment, native observation, Desktop Host Snapshots,
events, diagnostics, recovery, Timeline and Telemetry.

Sprint 13 connects the production Game Integration registry to the desktop
Companion through a game-agnostic coordinator. Detection produces deterministic
not-detected, detected or ambiguous outcomes. Ambiguity never selects an
arbitrary game, and one integration failure does not stop evaluation of later
integrations.

The Companion lifecycle remains the single attachment authority. Discovery,
attachment and process replacement are serialized, and obsolete discovery work
cannot overwrite newer lifecycle state. Supported attachment installs context
from the exact integration that produced the selected result. Detach, process
loss and shutdown clear that context; reattach reuses the active Session; and
process replacement clears the old attachment before installing the new one.

The desktop Companion Session Manager remains the single Session-state
authority. Game context is immutable, serializable and clone-isolated when it
enters Session ownership and when consumers receive snapshots. Omission
preserves existing game context; an explicitly present `game` property replaces
or clears it. Replacement is total and never merges stale integration state.

The public renderer boundary is the restricted preload `OracleDesktopBridge`.
One versioned presentation contract is used for both initial reads and
subscription events. It exposes only a UTC ISO 8601 capture timestamp, status
and minimal active-game identity. Payloads are validated, subscriptions use a
fixed channel with idempotent cleanup, and renderer code fails safely when the
bridge is unavailable. Presentation publishes only after authoritative Session
transitions complete.

Desktop Platform API version 1 separately exposes the immutable desktop data
contracts through `desktop/platform/index.ts`, the sole supported external
import surface. Desktop services, controllers and Electron/native details
remain internal.

Call of Duty is the first production implementation used to prove this shared
vertical slice. Its executable and title knowledge stays inside its Game
Integration. Detection outcomes, coordination, Session ownership, lifecycle
rules and presentation contracts remain fully game-agnostic.

---

# Development Sequence

The recommended Companion implementation order is:

## Milestone 1 — Desktop Shell

- Launch desktop application
- Create borderless transparent window
- Keep window above selected game
- Enable click-through mode
- Toggle Interactive Mode
- Show and hide overlay

## Milestone 2 — Window and Game Detection

- Detect target game
- Track game-window position
- Match overlay bounds
- Handle minimisation
- Handle focus changes
- Handle display changes

## Milestone 3 — Companion Runtime

- Define Companion Context
- Define runtime state
- Define events
- Define settings
- Define connector contract

## Milestone 4 — First Game Connector

- Identify the Beta 1 game
- Define supported screens
- Define compatibility rules
- Define one contextual-assistance flow

## Milestone 5 — Observation and Vision Prototype

- Capture permitted game output
- Detect one reliable visual state
- Return structured observations
- Measure performance

## Milestone 6 — Companion Assistance

- Display discoveries
- Display quest guidance
- Apply spoiler controls
- Track progress

## Milestone 7 — Beta Hardening

- Testing
- Performance
- Security
- Privacy
- Packaging
- Signing
- Updates
- Compatibility review
- Beta onboarding

---

# Engineering Principles

Oracle Companion follows these principles:

## External, Never Injected

Companion remains outside the game process.

## Assistance, Never Automation

Companion informs the Operator.

It never plays for them.

## Context Before Noise

Companion displays only information relevant to the current situation.

## Safety Before Coverage

Unsupported or uncertain functionality remains disabled.

## Confidence Before Assertion

Automated observations carry confidence.

## Privacy by Design

Companion captures and stores only what is required.

## Game-Specific Logic Stays Isolated

Shared runtime code must not contain hard-coded assumptions for one game.

## Platform Intelligence Remains Separate

Companion must not duplicate Oracle Intelligence.

## Progressive Enhancement

Companion begins with reliable assistance and expands incrementally.

## Production Stability

Every milestone must leave the Companion application buildable and testable.

---

# Product Principle

Oracle Intelligence helps the Operator become better.

Oracle Companion helps the Operator experience more.

The two systems share the Oracle identity while maintaining distinct responsibilities.

---

# Final Architectural Rule

Oracle Companion must behave like a modern independent desktop overlay.

It must remain external to the game process.

It must respect game rules, anti-cheat systems, user privacy and fair-play boundaries.

It must assist without interfering.

It must reveal without automating.

It must improve the gameplay experience without compromising the Operator's account, system or trust.

---

# The Oracle Has Spoken
