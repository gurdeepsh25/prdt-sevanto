# 13 — UI Pages (Admin App)

## Auth-Required Routes (Role = ADMIN)

| Route              | Purpose                                                           |
| ------------------ | ----------------------------------------------------------------- |
| `/`                | Overview dashboard (KPI cards, charts)                            |
| `/users`           | User list (search, filter by role/status)                         |
| `/users/:id`       | User detail (profile, jobs, actions: suspend, reactivate, verify) |
| `/workers/pending` | Queue of worker verifications                                     |
| `/categories`      | Manage categories + subcategories                                 |
| `/jobs`            | All jobs (filter by status, city, date)                           |
| `/jobs/:id`        | Job detail (admin view)                                           |
| `/reports`         | Reports queue (open / in review / resolved)                       |
| `/reports/:id`     | Report detail + resolve actions                                   |
| `/notifications`   | Admin broadcast (future)                                          |
| `/analytics`       | Time-series analytics, funnels, cohort tables                     |
| `/settings`        | Admin profile + system settings                                   |

## Reusable Components

- KpiCard, LineChart, BarChart, DataTable, FilterPanel, StatusBadge, UserDetailCard, ReportCard, Pagination.

## Page-Level Behaviors

- **Overview**: active users (24h/7d/30d), jobs by status, completed jobs today, top categories, recent reports.
- **Users**: row actions (suspend, reactivate, mark as worker verified).
- **Reports**: triage with status transitions; resolution notes stored as audit log.
- **Categories**: tree view with drag-and-drop sort order.

## Charts

- Recharts (via Shadcn wrappers) for line/bar/pie.

## State Management

- **Zustand**: admin session, UI prefs (theme, density).
- **TanStack Query**: paginated lists, analytics endpoints.

## Permissions

- All admin pages require `ADMIN` role.
- Action buttons gated by sub-role in future.

## Accessibility

- Data tables keyboard navigable.
- Charts have textual summaries for screen readers.
