# ORACLE COMPANION ARCHITECTURE

Version 1.0

Status: Beta 1 Foundation

---

# Purpose

Oracle Companion is Oracle's independent desktop application for in-game assistance.

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

Oracle Companion requires its own runtime.

The Companion Runtime is separate from the Oracle Intelligence Runtime.

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

Oracle Companion should be developed as a separate application repository.

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