# 12 — UI Pages (Worker App)

## Public Routes

| Route                                                  | Purpose                                        |
| ------------------------------------------------------ | ---------------------------------------------- |
| `/`                                                    | Landing tailored to workers (apply, get hired) |
| `/login`                                               | Login                                          |
| `/signup`                                              | Signup with role=Worker                        |
| `/forgot-password`, `/reset-password`, `/verify-email` | Same as customer                               |

## Worker (Auth-Required) Routes

| Route                | Purpose                                                                          |
| -------------------- | -------------------------------------------------------------------------------- |
| `/dashboard`         | Overview: active jobs, new applications, profile completion %, earnings (future) |
| `/profile`           | Edit worker profile (headline, bio, hourly rate, radius, address)                |
| `/skills`            | Add/remove skills, set levels                                                    |
| `/portfolio`         | Upload portfolio images (drag & drop)                                            |
| `/jobs`              | Browse open jobs (filter by category, city, budget)                              |
| `/jobs/:id`          | Job detail + Apply CTA                                                           |
| `/applications`      | List of own applications (status filter)                                         |
| `/assigned-jobs`     | Jobs where worker is assigned                                                    |
| `/assigned-jobs/:id` | Job actions: start, mark complete                                                |
| `/notifications`     | Notifications                                                                    |
| `/reviews`           | Reviews received                                                                 |
| `/settings`          | Account settings                                                                 |

## Reusable Components

- JobCard (worker variant), SkillPicker, PortfolioUploader, ApplicationCard, StatusBadge, ProfileCompletionMeter, RatingStars.

## Page-Level Behaviors

- **Profile**: completion meter; required fields highlighted.
- **Portfolio**: image grid with reordering + delete.
- **Job detail (apply)**: show job summary + cover note + proposed price; submit creates application.
- **Assigned job detail**: action buttons reflect current status (Start → Mark Complete).
- **Reviews**: list with rating breakdown; respond (future).

## Onboarding

First-login flow:

1. Welcome screen.
2. Fill headline + bio.
3. Add at least one skill.
4. (Optional) Upload portfolio.
5. Browse jobs.

## State Management

- **Zustand**: auth session, onboarding draft state, UI prefs.
- **TanStack Query**: jobs, applications, profile.

## Accessibility

- Same standards as customer app; focus on mobile-friendly tap targets (≥44px).
