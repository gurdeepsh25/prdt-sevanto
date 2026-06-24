# 16 — Development Phases

## Phase Overview

Each phase has its own implementation file in `docs/phases/`. The order is enforced — do not start a phase until the previous is complete.

| Phase | Name                    | Goal                                        | Depends On               |
| ----: | ----------------------- | ------------------------------------------- | ------------------------ |
|     1 | Authentication          | Email auth, JWT, refresh, verify, reset     | —                        |
|     2 | User Management         | Profiles + addresses                        | 1                        |
|     3 | Worker Profiles         | Skills + portfolio + verification flag      | 1, 4 (skills/categories) |
|     4 | Job Categories          | Categories + subcategories + skills catalog | 1                        |
|     5 | Job Posting             | Customer posts jobs                         | 2, 4                     |
|     6 | Job Discovery           | Browse open jobs + worker discovery         | 3, 4                     |
|     7 | Job Applications        | Worker applies; customer sees list          | 5, 6                     |
|     8 | Job Assignment          | Accept application → status ASSIGNED        | 7                        |
|     9 | Job Lifecycle           | Start → complete → confirm → cancel         | 8                        |
|    10 | Reviews & Ratings       | Post-completion reviews                     | 9                        |
|    11 | Notifications           | In-app + email triggers                     | 1                        |
|    12 | Search & Filters        | Cross-cutting search experience             | 5, 6, 10                 |
|    13 | Admin Dashboard         | Admin auth + management screens             | 1, 2, 5, 9               |
|    14 | Reports & Analytics     | Trust + growth dashboards                   | 13                       |
|    15 | Chat System             | Realtime chat (Socket.io)                   | 11                       |
|    16 | Maps & Location         | Geo discovery, distance, map view           | 6, 12                    |
|    17 | Payments & Monetization | Commissions, subscriptions                  | 9, 13                    |
|    18 | Production Launch       | Hardening, observability, deploy            | 17                       |

## Phase Lifecycle (Standard)

1. **Plan** — read phase doc; list subtasks in [23-progress-tracker.md](23-progress-tracker.md).
2. **Backend First** — DB → API → tests.
3. **Frontend** — UI for each of 3 apps.
4. **Integration** — wire apps to backend; cross-app UX validated.
5. **QA** — full testing checklist for the phase.
6. **Acceptance** — meet all acceptance criteria.
7. **Close** — mark phase complete in tracker.

## Definition of Done (per phase)

- All acceptance criteria met.
- All tests pass (unit + integration).
- API endpoints documented.
- Database changes captured.
- Progress tracker updated.
- No P1/P2 bugs open.
