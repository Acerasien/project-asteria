# Graph Report - project_random  (2026-08-13)

## Corpus Check
- 112 files · ~221,866 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 656 nodes · 1125 edges · 64 communities (42 shown, 22 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
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
- validation.ts
- status-transition.ts
- drop.ts

## God Nodes (most connected - your core abstractions)
1. `verifySession` - 56 edges
2. `db` - 17 edges
3. `compilerOptions` - 17 edges
4. `hotelDate()` - 14 edges
5. `addCalendarDays()` - 14 edges
6. `Front-Desk Hotel Reservation System - Design Specification` - 14 edges
7. `reservations` - 13 edges
8. `scripts` - 12 edges
9. `revalidateOperations()` - 12 edges
10. `beds` - 12 edges

## Surprising Connections (you probably didn't know these)
- `DashboardLayout()` --calls--> `verifySession`  [EXTRACTED]
  src/app/dashboard/layout.tsx → src/lib/dal.ts
- `GuestProfilePage()` --calls--> `formatShortDate()`  [EXTRACTED]
  src/app/dashboard/guests/[id]/page.tsx → src/lib/hotel-date.ts
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

## Communities (64 total, 22 thin omitted)

### Community 0 - "Settings Actions and Admin Configurations"
Cohesion: 0.07
Nodes (59): bulkSchema, bulkUpdateRoomsAction(), createLocationAction(), createRoomAction(), createRoomTypeAction(), createStaffAction(), deleteLocationAction(), deleteRoomAction() (+51 more)

### Community 1 - "Guest Management Actions and Forms"
Cohesion: 0.11
Nodes (23): createGuestAction(), duplicateState(), GuestActionState, invalidInput(), updateGuestAction(), GuestDefaults, GuestForm(), GuestProfilePage() (+15 more)

### Community 2 - "Housekeeping Status Management and Board"
Cohesion: 0.06
Nodes (53): bedIdSchema, bedStatusSchema, RoomStatusActionState, updateRoomStatusAction(), filters, groupByFloor(), HousekeepingPage(), RoomStatusControl() (+45 more)

### Community 3 - "Reservation Lifecycle and Validation Rules"
Cohesion: 0.10
Nodes (21): DashboardPage(), ReservationActionState, GuestCombobox(), GuestComboboxProps, GuestOption, ReservationDetailPage(), LifecycleActions(), pageHref() (+13 more)

### Community 4 - "Interactive Calendar and Date Timeline Grid"
Cohesion: 0.08
Nodes (42): CalendarControls(), RoomStatus, CalendarPage(), CalendarStyle, dateIndex(), dayLabel(), groupBy(), guestLabel() (+34 more)

### Community 5 - "Project Dependencies and Metadata"
Cohesion: 0.05
Nodes (39): bcryptjs, drizzle-orm, @fontsource-variable/inter, @fontsource-variable/outfit, lucide-react, next, next-auth, dependencies (+31 more)

### Community 6 - "TypeScript Configuration and Node Modules"
Cohesion: 0.06
Nodes (30): dom, dom.iterable, es2022, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, ./src/* (+22 more)

### Community 7 - "Development Tools and Linters"
Cohesion: 0.07
Nodes (27): drizzle-kit, esbuild, eslint, eslint-config-next, jsdom, devDependencies, drizzle-kit, esbuild (+19 more)

### Community 8 - "Authenticated Layout Shell and Navigation"
Cohesion: 0.15
Nodes (13): DashboardLayout(), logout(), AppShell(), roleLabel(), Navigation(), formatHotelDay(), can(), Permission (+5 more)

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
Cohesion: 0.05
Nodes (37): 1. Masuk ke Sistem, 2. Dashboard, 3. Reservasi, 4. Tamu, 5. Kalender, 6. Housekeeping, 7.1 Tipe Kamar, 7.2 Kamar (+29 more)

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
Cohesion: 0.36
Nodes (6): locationInputSchema, roomInputSchema, roomTypeInputSchema, staffBase, staffCreateInputSchema, staffUpdateInputSchema

### Community 60 - "login-form.tsx"
Cohesion: 0.22
Nodes (8): 1. Understanding Summary, 2. Assumptions & NFRs, 3. Decision Log, 4. Proposed Implementation Detail, Components & Pages, Database Query, Design: Status Kamar & Kasur Page (Slice 7), Purpose

### Community 61 - "validation.ts"
Cohesion: 0.40
Nodes (4): isoDate, ReservationInput, reservationInputSchema, validInput

### Community 62 - "status-transition.ts"
Cohesion: 0.39
Nodes (4): authenticate(), LoginState, initialState, LoginForm()

## Knowledge Gaps
- **287 isolated node(s):** `nextConfig`, `name`, `version`, `type`, `private` (+282 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `verifySession` connect `Settings Actions and Admin Configurations` to `Guest Management Actions and Forms`, `Housekeeping Status Management and Board`, `Reservation Lifecycle and Validation Rules`, `Interactive Calendar and Date Timeline Grid`, `Authenticated Layout Shell and Navigation`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `db` connect `Housekeeping Status Management and Board` to `Settings Actions and Admin Configurations`, `Guest Management Actions and Forms`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `Front-Desk Hotel Reservation System - Design Specification` connect `Settings Validation Schemas` to `8. Dashboard UI & UX Specifications (Impeccable & UI/UX Pro Max)`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `NOTE: This file should not be edited`, `nextConfig`, `name` to the rest of the system?**
  _288 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Settings Actions and Admin Configurations` be split into smaller, more focused modules?**
  _Cohesion score 0.06882716049382716 - nodes in this community are weakly interconnected._
- **Should `Guest Management Actions and Forms` be split into smaller, more focused modules?**
  _Cohesion score 0.10873440285204991 - nodes in this community are weakly interconnected._
- **Should `Housekeeping Status Management and Board` be split into smaller, more focused modules?**
  _Cohesion score 0.061088485746019994 - nodes in this community are weakly interconnected._