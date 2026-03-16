# AGENTS.md

## Project
Digital multiplayer board game inspired by **Dog / Tock-style card-based race games**, hosted by one player and joined by invited friends. The experience should feel like a normal physical board game: shared board state, low-latency turn updates, visible card play, strict rule enforcement, and room-based sessions.

This file defines the product intent, technical constraints, rules, architecture boundaries, and implementation priorities for coding agents working on the project.

---

## Primary goal
Build a **real-time online board game** for browser play where:
- one person can create a room and invite friends,
- all players see the same game state in real time,
- the server is authoritative,
- rules are enforced consistently,
- the game supports both free-for-all and team modes.

The app must be practical for a solo maintainer to ship and operate.

---

## Supported game modes
Implement support for these room configurations:
- Free-for-all
- 2v2
- 3v3
- 2v2v2
- 4v4

Agents must treat **player count, team count, turn order, card exchange logic, and win conditions** as mode-dependent configuration, not hardcoded assumptions.

---

## Core board model
- The board is **square-shaped**.
- Each player owns one corner.
- Each player has:
  - one **start area** containing 4 pieces,
  - one **entry/exit lane** adjacent to that corner,
  - one **home nest / bo** that can only be entered after a full lap.
- There are **16 spaces between each player’s start/entry point and the next player’s start/entry point**.
- A piece exits start onto the first board space immediately outside the start area.
- A piece must travel **one full lap** before it is allowed to enter its home lane / bo.
- Entry to bo requires **exact movement count**.
- If a move would overshoot bo, the piece must continue around the board until it can legally enter later, unless repositioned by a Jack swap.

---

## Piece rules
### General
- Each player has 4 pieces.
- Landing on another piece knocks that piece back to its own start area.
- If a rule says a piece is sent back to start, it returns to its owner’s start area.

### Immunity rule
When a piece has just exited start and stands on the first square outside start:
- it is **immune** until its owner moves that same piece away,
- it cannot be passed,
- it cannot be landed on,
- it cannot be moved by any effect,
- it cannot be swapped by a Jack,
- it can therefore block traffic for multiple turns/rounds if its owner keeps moving other pieces.

Agents must model this as explicit piece state, not as an inferred UI rule.

Recommended boolean/state fields:
- `isInStart`
- `isOnBoard`
- `isInHome`
- `isImmune`
- `hasCompletedLap`

---

## Card rules
Implement the following card behavior exactly.

- **Ace** = move 1 or 11 forward, or exit start onto the first square outside start.
- **2** = move 2 forward.
- **3** = move 3 forward.
- **4** = move 4 forward **or** 4 backward.
- **5** = move 5 forward.
- **6** = move 6 forward.
- **7** = split a total of 7 forward across one or more legal piece moves.
  - Any pieces passed during the split are sent back to start.
  - This also applies to allied pieces.
- **8** = move 8 forward.
- **9** = move 9 forward.
- **10** = move 10 forward.
- **Jack** = swap one of your pieces with another player’s piece that is currently in play.
  - Immune pieces cannot be targeted.
- **Queen** = move 12 forward.
- **King** = move 13 forward, or exit start onto the first square outside start.
- **Joker** = acts as any card.

### Must-play rule
If a player has at least one legal move using at least one available card, they **must** play.

### No-legal-move rule
If a player has no valid move, they are marked as unable to act for the remainder of that round.

Agents must implement **legal move generation first**, and derive UI actions from those legal moves.

---

## Round structure
### Initial deal
At the start of a game, each player receives **6 random cards**.

### Hand cycle
Rounds follow this repeating hand-size cycle:
- Round 1: 6 cards
- Round 2: 5 cards
- Round 3: 4 cards
- Round 4: 3 cards
- Round 5: 2 cards
- Then repeat back to 6 cards

### Team card exchange
At the start of each round in team modes:
- teammates must exchange exactly 1 card,
- the exchanged card is not revealed to the receiving teammate until the exchange is completed.

This exchange phase is mandatory before card play begins.

### Team continuation rule
In team modes, if one player has already brought all 4 of their own pieces into bo:
- that player does **not** stop participating,
- they continue taking turns and playing cards as normal,
- from that point onward, their playable movement actions may target their teammate's pieces instead of their own,
- they may still be subject to the normal must-play rule,
- this support-play behavior only applies after their own 4 pieces are fully home.

Agents must model this explicitly in legal move generation for team modes.

### Turn flow
- Turn order follows seat order and mode configuration.
- In team modes, teams alternate properly according to seating/order rules.
- Each active player plays one card on their turn.
- When all playable cards are exhausted, or when the final remaining players have no legal move, the round ends.
- A new round begins with the next hand size in the cycle.

### Hidden information
Players must **not** be allowed to reveal their full hand to others through the product.
Only the owning player may see their hand.

---

## Win condition
A player/team wins when all required pieces are placed into bo according to the selected game mode.

Agents must keep win condition logic mode-aware:
- free-for-all: individual win,
- team modes: team win.

Do not hardcode a 2-team assumption.

---

## Product requirements
### Required for MVP
- Account creation and login
- Room creation by a host
- Invite/join via room code or private invite link
- Lobby with ready-state
- Real-time synchronized board state
- Authoritative server-side move validation
- Turn system
- Card dealing and round cycle
- Team exchange phase
- Legal move highlighting
- Reconnect handling
- Basic chat or emote/ping system (optional but recommended)
- Match result screen

### Strongly recommended soon after MVP
- Spectator mode
- Match history
- Friend invites / friend list
- Rematch in same room
- Host migration if host disconnects
- Resume interrupted game within a short window
- Simple anti-cheat audit log

### Explicit non-goals for first release
- Native mobile apps
- Voice chat
- Public matchmaking
- Ranked ladder
- Cosmetics/store
- AI opponents

---

## Architecture principles
### 1. Server-authoritative game logic
Never trust the client for:
- legal moves,
- turn order,
- card effects,
- piece collisions,
- win detection,
- team exchange validity.

Client sends **intent**, server returns accepted state transition or rejection.

### 2. Deterministic rules engine
The core rules engine must be isolated from UI and transport.
Given the same input state + command, it must produce the same output.

### 3. Room-scoped state
Each active match must have a single authoritative room state.
No split-brain state across clients.

### 4. Event-sourced enough for debugging
Persist a compact move/event log so matches can be replayed or audited.
Recommended event types:
- room_created
- player_joined
- seat_assigned
- teams_locked
- round_started
- card_exchanged
- turn_started
- card_played
- move_applied
- piece_knocked_home
- swap_applied
- round_ended
- game_finished
- player_disconnected
- player_reconnected

### 5. UI is a projection
Frontend should render from authoritative room snapshots + server events.
Do not let frontend invent hidden rules.

---

## Recommended stack

## Recommended production stack
### Frontend
- **Next.js + React + TypeScript**
- Tailwind CSS for UI
- Zustand for local ephemeral UI state only

Why:
- Mature TypeScript ecosystem
- Fast iteration for a solo developer
- Easy auth flows, routing, lobby pages, room pages, profile pages
- Good hosting ergonomics on Vercel or Cloudflare

### Real-time game backend
**Recommended:** **Cloudflare Workers + Durable Objects**

Use one Durable Object per active game room.

Why this is the strongest fit:
- one room = one authoritative coordinator,
- very good for turn-based multiplayer state,
- supports WebSockets directly,
- avoids building your own room coordinator on top of stateless serverless functions,
- easier to reason about than stitching together cron/jobs/locks/polling,
- suitable for a solo-maintained realtime game backend.

### Database / persistence
Choose one of these:

#### Option A — recommended balance
- **Supabase Postgres** for persistent data
- Cloudflare Durable Objects for active room state

Store in Postgres:
- users
- friendships / invites
- room metadata
- finished matches
- event logs / replays
- preferences

Keep active transient room coordination inside Durable Objects.

#### Option B — single-vendor direction
- Cloudflare Durable Objects + D1

This reduces moving parts, but relational querying and admin ergonomics are generally less comfortable than Postgres for account/social/history features.

### Authentication
- **Supabase Auth** or **Clerk**

Recommended default: **Supabase Auth**
- email/password or magic link,
- straightforward integration with Postgres-backed user data,
- lower operational friction for a solo builder.

### Hosting
#### Frontend hosting
- **Vercel** for the Next.js frontend, or
- **Cloudflare Pages** if you want to stay closer to the realtime backend.

Preferred split recommendation:
- **Vercel for frontend**
- **Cloudflare Workers/Durable Objects for realtime game server**
- **Supabase for auth + persistent relational data**

This is a pragmatic hybrid.

### Why not put the realtime engine inside Vercel functions?
Because Vercel Functions do **not** act as WebSocket servers. Realtime room coordination should therefore live in a dedicated realtime layer instead of plain Vercel serverless functions.

---

## Alternative simpler MVP stack
If development speed is more important than backend elegance:
- Next.js frontend
- Supabase Auth
- Supabase Postgres
- Supabase Realtime for live updates/presence
- Edge Functions / RPC for move validation

This is viable for an MVP, but it is less ideal than Durable Objects for strict room authority and turn coordination.
Use this path only if you want to optimize for familiarity and fastest initial shipping.

---

## Codebase structure
Recommended monorepo:

```text
/apps
  /web                # Next.js frontend
/packages
  /game-rules         # Pure TypeScript rules engine
  /shared-types       # DTOs, room types, commands, events
  /ui                 # Optional shared UI components
/services
  /realtime-server    # Cloudflare Workers / Durable Objects
  /db                 # SQL migrations, seed, helpers
```

### Hard rule
The `game-rules` package must contain no framework code, no DOM code, and no direct network/database code.
It should be unit-testable in isolation.

---

## Domain model guidance
Recommended entities:
- `User`
- `Friendship`
- `Invite`
- `Room`
- `RoomSeat`
- `Match`
- `MatchPlayer`
- `Team`
- `Piece`
- `Round`
- `Turn`
- `Card`
- `PlayerHand`
- `MoveOption`
- `GameEvent`

### Room state should minimally include
- room id
- mode
- seat order
- player list
- team assignments
- connection status
- ready states
- current round number
- current hand size
- deck/discard state
- current player turn
- players skipped this round
- board occupancy
- piece states
- pending seven-split state (if mid-resolution)
- pending team card exchange state
- winner / finished flag

---

## Rules engine requirements
Agents must implement move resolution in this order:
1. validate phase,
2. generate legal moves,
3. apply selected move,
4. apply collisions / knockouts,
5. update immunity,
6. update lap completion,
7. resolve bo entry,
8. advance turn/round,
9. check win condition,
10. emit event(s).

### Critical edge cases to cover in tests
- Ace as 1 vs 11
- Ace/King start exit when no piece can otherwise move
- 4 backward crossing special board boundaries
- 7 split across multiple pieces
- 7 split knocking allied pieces
- 7 split with immune blocker present
- Jack swap with enemy piece
- Jack forbidden against immune piece
- Joker mirroring every card type
- exact bo entry
- overshoot bo and continue around board
- must-play logic when only one obscure move exists
- round ending when remaining players are blocked
- card exchange visibility in team modes
- teammate support-play after one player has all 4 pieces home
- must-play logic while only teammate pieces remain movable
- reconnect during exchange phase
- reconnect during partially resolved 7 action

---

## Networking model
Client messages should be intent-based, for example:
- `join_room`
- `sit_seat`
- `set_ready`
- `exchange_card`
- `play_card`
- `choose_move_option`
- `resume_seven_split`
- `send_emote`

Server broadcasts state updates/events such as:
- `room_snapshot`
- `player_joined`
- `player_left`
- `phase_changed`
- `turn_changed`
- `legal_moves`
- `card_played`
- `piece_moved`
- `round_started`
- `round_ended`
- `game_finished`

Never let clients directly mutate shared state.

---

## Security / trust boundaries
- Validate every move server-side.
- Do not expose opponents’ hands.
- Use signed/private room invites.
- Rate-limit room joins and action spam.
- Persist an append-only action log for dispute/debugging.
- Revalidate player identity on reconnect.
- Prevent duplicate command submission with idempotency keys.

---

## UX guidance
- Make legal moves obvious.
- Show why an action is invalid.
- Show whose turn it is at all times.
- Distinguish start area, immune square, track, and bo clearly.
- Make team relationships visually obvious in team modes.
- During exchange phase, hide received card until both exchanges are locked.
- Make reconnect recovery seamless.

---

## Delivery plan
### Phase 1 — rules prototype
- Implement board indexing model
- Implement pieces and movement
- Implement all card effects
- Build exhaustive unit tests for rules
- Add text-based simulation harness

### Phase 2 — realtime room prototype
- Create rooms
- Join by code
- Sync room state live
- Run authoritative turns
- Support reconnect

### Phase 3 — playable MVP
- Full lobby
- Team assignment
- Exchange phase
- Basic board UI
- Match completion
- Rematch

### Phase 4 — persistence/social
- Accounts
- Friends
- Match history
- Invite flows
- Simple profile pages

### Phase 5 — polish
- Animations
- Spectators
- Host migration
- Replay viewer
- Mobile responsiveness

---

## What coding agents should optimize for
Prioritize in this order:
1. rule correctness,
2. deterministic state transitions,
3. reconnect safety,
4. anti-desync architecture,
5. maintainability,
6. visual polish.

Do not sacrifice correctness for animation or flashy UI.

---

## What coding agents should avoid
- Do not hardcode 2-player or 4-player assumptions.
- Do not place rules in React components.
- Do not trust client-calculated legal moves.
- Do not couple room state to animation completion.
- Do not depend on polling for core game synchronization.
- Do not expose hidden information through API payloads.
- Do not implement the full product in one giant repo package without boundaries.

---

## Final recommendation
For this project, the best overall starting path is:

1. **Next.js + TypeScript frontend**
2. **Pure TypeScript rules engine in a shared package**
3. **Cloudflare Durable Objects for authoritative realtime rooms**
4. **Supabase Auth + Postgres for users, invites, history, and social data**
5. **Vercel or Cloudflare Pages for frontend deployment**

If you want the fastest MVP with the least architecture overhead, start with:
- Next.js
- Supabase Auth
- Supabase Postgres
- Supabase Realtime
- server-side move validation via RPC / functions

Then migrate the active room engine to Durable Objects if coordination complexity grows.
