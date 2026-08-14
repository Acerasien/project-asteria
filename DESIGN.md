# Design System

## Direction

An operational hotel product interface using a restrained light theme. Staff work under varied front-desk lighting for long periods, so the surface is neutral, highly legible, and low-glare. Visual emphasis belongs to current navigation, primary actions, and room or reservation status.

The approved composition follows the wireframes in `docs/wireframe-dashboard-overview.png` and `docs/wireframe-calendar-grid.png`. The dashboard's production north star is `docs/dashboard-direction-a.png`, supported by `docs/hotel-operations-palette.png`. Those references define information hierarchy and atmosphere; this document defines the implementation language.

Direction A carries forward a balanced four-summary row, paired arrivals/departures panels, a room-attention strip, neutral navigation, and a separately composed mobile dashboard with bottom navigation. The phone frame, generated sample data, and rasterized controls are presentation artifacts and must not be reproduced literally in code.

## Color

Use OKLCH tokens in implementation, derived from these approved semantic anchors:

- App background: neutral slate near `#F8FAFC`
- Primary surface: white near `#FFFFFF`
- Elevated/secondary surface: cool slate near `#F1F5F9`
- Border: slate near `#E2E8F0`
- Primary ink: slate near `#0F172A`
- Secondary ink: slate near `#475569`
- Accent and confirmed reservation: indigo near `#4F46E5`
- Checked in: emerald near `#059669`
- Clean: teal near `#0D9488`
- Dirty/warning: amber near `#D97706`
- Maintenance/error: rose near `#E11D48`
- Out of order: dark slate near `#1E293B`

Every text/background combination must meet the WCAG 2.1 AA contrast floor. Status is always paired with text or an icon and never communicated by color alone.

## Typography

Use Inter with a system-ui fallback and a fixed product-interface scale. Body copy is 0.875–1rem with a compact 1.4–1.5 line height. Page titles are 1.5–1.75rem; panel headings are 1–1.125rem. Data, labels, buttons, and headings use the same family with weight and spacing—not a display typeface—to establish hierarchy. Long prose is capped near 70 characters.

## Shape and Elevation

- Panels and cards: 8–12px radius
- Inputs and buttons: 6–8px radius
- Badges and reservation blocks: 4–6px radius
- Pills: reserved for compact filters or status controls
- Prefer borders or small, defined shadows; never combine a border with a wide decorative shadow
- Avoid nested cards when spacing, dividers, or section headings can establish structure

## Layout

Desktop uses an expanded left navigation and a content workspace. Tablet collapses navigation to an icon rail. Mobile replaces the sidebar with bottom navigation. Dashboard metrics form a compact responsive row, followed by arrivals/departures and rooms requiring attention. Calendar uses sticky date and room headers on desktop/tablet, then becomes a day-focused vertical list on mobile.

Use an 8px spacing foundation with optical adjustments where control density requires them. Product content should compose structurally at 375px, 768px, and 1280px rather than rely on fluid heading sizes.

## Components

All interactive components include default, hover, focus-visible, active, disabled, loading, error, and success behavior where applicable. Shared primitives include buttons, fields, select/combobox controls, status badges, data tables, confirmation dialogs, stat summaries, room-status controls, date-range selection, and reservation blocks. Use Lucide as the single icon family.

Native dialogs or portals must escape scrolling and overflow contexts. Tooltips never contain essential functionality. Minimum touch targets are 44×44px on touch layouts.

## Motion

Use 150–200ms state transitions with ease-out timing. Motion communicates selection, expansion, status change, or feedback; it is not decorative. Avoid page-load choreography and layout-property animation. Respect `prefers-reduced-motion` with instant transitions or simple crossfades.

## Content and States

Labels are explicit and operational: “Check in guest,” “Mark room clean,” and “Cancel reservation.” Expected domain failures explain the conflict and the next action. Tables and dashboard data use structural skeletons while loading. Empty states teach the available action. Unexpected errors reveal no internal implementation details and offer a clear retry path.
