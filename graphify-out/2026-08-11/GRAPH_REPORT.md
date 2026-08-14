# Graph Report - project_random  (2026-08-11)

## Corpus Check
- 100 files · ~216,030 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 553 nodes · 920 edges · 61 communities (40 shown, 21 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Settings Actions and Admin Configurations
- Guest Management Actions and Forms
- Housekeeping Status Management and Board
- Reservation Lifecycle and Validation Rules
- Interactive Calendar and Date Timeline Grid
- Project Dependencies and Metadata
- TypeScript Configuration and Node Modules
- Development Tools and Linters
- Authenticated Layout Shell and Navigation
- Login and Authentication Management
- Visual Design System and Assets
- Settings Validation Schemas
- NextAuth Type Extensions
- Product Specifications and Principles
- Root HTML Document Layout
- Guest Management Specifications
- Administration Page Specifications
- Next.js Build Configuration
- Next.js Environment Type Setup
- NextAuth API Endpoint Handler
- 8. Dashboard UI & UX Specifications (Impeccable & UI/UX Pro Max)
- Action Items
- actions.ts
- Slice 3 — Room Availability Calendar
- Slice 4 — Guest Management
- Slice 5 — Housekeeping Room-Status Board
- Slice 6 — Administrator Settings
- Administrator-Only Development Seed
- AGENTS.md
- Color Palette
- Shape and Elevation Rules
- Responsive Layout Breakpoints
- docs/admin-only-seed-design.md
- Database Seed Specification
- docs/hotel-reservation-design.md
- Overlap Check Validation
- Reservation Lifecycle
- docs/slice-3-calendar-design.md
- CSS Grid Calendar Timeline
- Guest Search & Deduplication
- docs/slice-5-housekeeping-design.md
- Room Status Board
- docs/slice-6-administration-design.md
- queries.ts
- login-form.tsx

## God Nodes (most connected - your core abstractions)
1. `verifySession` - 44 edges
2. `compilerOptions` - 17 edges
3. `db` - 15 edges
4. `Front-Desk Hotel Reservation System - Design Specification` - 14 edges
5. `reservations` - 12 edges
6. `8. Dashboard UI & UX Specifications (Impeccable & UI/UX Pro Max)` - 12 edges
7. `scripts` - 11 edges
8. `rooms` - 11 edges
9. `formatShortDate()` - 11 edges
10. `hotelDate()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `DashboardLayout()` --calls--> `verifySession`  [EXTRACTED]
  src/app/dashboard/layout.tsx → src/lib/dal.ts
- `RoomsList()` --indirect_call--> `bulkUpdateRoomsAction()`  [INFERRED]
  src/app/dashboard/settings/rooms-list.tsx → src/app/dashboard/settings/actions.ts
- `createGuestAction()` --calls--> `verifySession`  [EXTRACTED]
  src/app/dashboard/guests/actions.ts → src/lib/dal.ts
- `updateGuestAction()` --calls--> `verifySession`  [EXTRACTED]
  src/app/dashboard/guests/actions.ts → src/lib/dal.ts
- `GuestsPage()` --calls--> `formatShortDate()`  [EXTRACTED]
  src/app/dashboard/guests/page.tsx → src/lib/hotel-date.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Reservation Stay Lifecycle Flow** — docs_hotel_reservation_design_reservation_lifecycle, src_modules_reservations_status_transition_cantransition, src_db_schema_reservations [INFERRED 0.95]
- **Room Housekeeping Status Flow** — docs_hotel_reservation_design_housekeeping_workflow, src_modules_housekeeping_status_rules_cansetroomstatus, src_db_schema_rooms [INFERRED 0.95]

## Communities (61 total, 21 thin omitted)

### Community 0 - "Settings Actions and Admin Configurations"
Cohesion: 0.07
Nodes (33): SettingsActionState, DeleteControl(), roleLabel(), SettingsPage(), tabCopy, EditRoomTypePage(), EditRoomPage(), RoomRow (+25 more)

### Community 1 - "Guest Management Actions and Forms"
Cohesion: 0.13
Nodes (18): createGuestAction(), duplicateState(), GuestActionState, invalidInput(), updateGuestAction(), GuestDefaults, GuestForm(), GuestsPage() (+10 more)

### Community 2 - "Housekeeping Status Management and Board"
Cohesion: 0.08
Nodes (29): roomIdSchema, RoomStatusActionState, roomStatusSchema, updateRoomStatusAction(), filters, groupByFloor(), HousekeepingPage(), RoomStatusControl() (+21 more)

### Community 3 - "Reservation Lifecycle and Validation Rules"
Cohesion: 0.10
Nodes (21): createReservationAction(), databaseMessage(), invalidInput(), ReservationActionState, transitionReservationAction(), updateReservationAction(), LifecycleActions(), Defaults (+13 more)

### Community 4 - "Interactive Calendar and Date Timeline Grid"
Cohesion: 0.14
Nodes (27): CalendarControls(), RoomStatus, CalendarPage(), CalendarStyle, dateIndex(), dayLabel(), groupBy(), guestLabel() (+19 more)

### Community 5 - "Project Dependencies and Metadata"
Cohesion: 0.05
Nodes (38): bcryptjs, drizzle-orm, @fontsource-variable/inter, @fontsource-variable/outfit, lucide-react, next, next-auth, dependencies (+30 more)

### Community 6 - "TypeScript Configuration and Node Modules"
Cohesion: 0.06
Nodes (30): dom, dom.iterable, es2022, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, ./src/* (+22 more)

### Community 7 - "Development Tools and Linters"
Cohesion: 0.07
Nodes (27): drizzle-kit, esbuild, eslint, eslint-config-next, jsdom, devDependencies, drizzle-kit, esbuild (+19 more)

### Community 8 - "Authenticated Layout Shell and Navigation"
Cohesion: 0.20
Nodes (9): DashboardLayout(), logout(), AppShell(), roleLabel(), Navigation(), formatHotelDay(), can(), Permission (+1 more)

### Community 9 - "Login and Authentication Management"
Cohesion: 0.22
Nodes (8): Anti-Patterns Verdict, Critique Report: src/app/dashboard, Design Health Score, Overall Impression, Persona Red Flags, Priority Issues, Questions to Consider, What's Working

### Community 10 - "Visual Design System and Assets"
Cohesion: 0.20
Nodes (9): Color, Components, Content and States, Design System, Direction, Layout, Motion, Shape and Elevation (+1 more)

### Community 11 - "Settings Validation Schemas"
Cohesion: 0.05
Nodes (37): 10. Data Flow & Validation Rules, 11. Empty, Loading & Error States, 12. Seed Data Specification, 13. Implementation & Verification Roadmap, 1. Overview & Purpose, 2. Understanding Summary, 3. Key Assumptions, 4. Decision Log (+29 more)

### Community 12 - "NextAuth Type Extensions"
Cohesion: 0.29
Nodes (6): JWT, next-auth, next-auth/jwt, Session, StaffRole, User

### Community 13 - "Product Specifications and Principles"
Cohesion: 0.18
Nodes (10): Accessibility & Inclusion, Anti-references, Brand Personality, Design Principles, Platform, Positioning, Product, Product Purpose (+2 more)

### Community 30 - "8. Dashboard UI & UX Specifications (Impeccable & UI/UX Pro Max)"
Cohesion: 0.09
Nodes (22): 8. Dashboard UI & UX Specifications (Impeccable & UI/UX Pro Max), Bottom Row: "Rooms Needing Attention", Dashboard Overview Page (`/dashboard`), Design System Tokens, Grid Structure (CSS Grid), Guest Directory (`/dashboard/guests`), Housekeeping Status Board (`/dashboard/housekeeping`), Middle Row: Two Side-by-Side Panels (+14 more)

### Community 31 - "Action Items"
Cohesion: 0.17
Nodes (11): Action Items, Decision Log, Implementation Plan, Open Questions, Scope, Slice 2 — Reservations, Slice 3 — Room Availability Calendar, Slice 4 — Guest Management (+3 more)

### Community 32 - "actions.ts"
Cohesion: 0.16
Nodes (27): bulkSchema, bulkUpdateRoomsAction(), createRoomAction(), createRoomTypeAction(), createStaffAction(), deleteRoomAction(), deleteRoomTypeAction(), deleteStaffAction() (+19 more)

### Community 33 - "Slice 3 — Room Availability Calendar"
Cohesion: 0.29
Nodes (6): Assumptions, Decision Log, Final Design, Slice 3 — Room Availability Calendar, Understanding Summary, Verification Strategy

### Community 34 - "Slice 4 — Guest Management"
Cohesion: 0.29
Nodes (6): Assumptions, Decision Log, Final Design, Slice 4 — Guest Management, Understanding Summary, Verification Strategy

### Community 35 - "Slice 5 — Housekeeping Room-Status Board"
Cohesion: 0.29
Nodes (6): Assumptions, Decision Log, Final Design, Slice 5 — Housekeeping Room-Status Board, Understanding Summary, Verification Strategy

### Community 36 - "Slice 6 — Administrator Settings"
Cohesion: 0.29
Nodes (6): Assumptions, Decision Log, Final Design, Slice 6 — Administrator Settings, Understanding Summary, Verification Strategy

### Community 37 - "Administrator-Only Development Seed"
Cohesion: 0.33
Nodes (5): Administrator-Only Development Seed, Assumptions, Decision Log, Final Design, Understanding

### Community 59 - "queries.ts"
Cohesion: 0.18
Nodes (16): GuestProfilePage(), DashboardPage(), ReservationDetailPage(), pageHref(), ReservationsPage(), Status, StatusBadge(), users (+8 more)

### Community 60 - "login-form.tsx"
Cohesion: 0.39
Nodes (4): authenticate(), LoginState, initialState, LoginForm()

## Knowledge Gaps
- **238 isolated node(s):** `nextConfig`, `name`, `version`, `type`, `private` (+233 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `verifySession` connect `actions.ts` to `Settings Actions and Admin Configurations`, `Guest Management Actions and Forms`, `Housekeeping Status Management and Board`, `Reservation Lifecycle and Validation Rules`, `Interactive Calendar and Date Timeline Grid`, `Authenticated Layout Shell and Navigation`, `queries.ts`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `Front-Desk Hotel Reservation System - Design Specification` connect `Settings Validation Schemas` to `8. Dashboard UI & UX Specifications (Impeccable & UI/UX Pro Max)`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `db` connect `Settings Actions and Admin Configurations` to `actions.ts`, `Guest Management Actions and Forms`, `Housekeeping Status Management and Board`, `Reservation Lifecycle and Validation Rules`, `Interactive Calendar and Date Timeline Grid`, `queries.ts`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `NOTE: This file should not be edited`, `nextConfig`, `name` to the rest of the system?**
  _239 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Settings Actions and Admin Configurations` be split into smaller, more focused modules?**
  _Cohesion score 0.07184325108853411 - nodes in this community are weakly interconnected._
- **Should `Guest Management Actions and Forms` be split into smaller, more focused modules?**
  _Cohesion score 0.12698412698412698 - nodes in this community are weakly interconnected._
- **Should `Housekeeping Status Management and Board` be split into smaller, more focused modules?**
  _Cohesion score 0.08392603129445235 - nodes in this community are weakly interconnected._