# 11 — UI Pages (Customer App)

## Public Routes

| Route                       | Purpose                                                             |
| --------------------------- | ------------------------------------------------------------------- |
| `/`                         | Landing page: value prop, featured categories, CTAs to login/signup |
| `/login`                    | Email + password login                                              |
| `/signup`                   | Email signup with role choice (Customer default)                    |
| `/forgot-password`          | Request password reset                                              |
| `/reset-password?token=...` | Set new password                                                    |
| `/verify-email?token=...`   | Email verification landing                                          |
| `/workers`                  | Browse workers (filters: category, city, rating)                    |
| `/workers/:id`              | Public worker profile + reviews                                     |
| `/categories`               | Browse categories                                                   |
| `/categories/:slug`         | Subcategories + featured workers                                    |
| `/jobs`                     | Browse public open jobs (community feed, optional)                  |

## Customer (Auth-Required) Routes

| Route            | Purpose                                                                      |
| ---------------- | ---------------------------------------------------------------------------- |
| `/dashboard`     | Overview: active jobs, recent applications on own jobs, notifications        |
| `/profile`       | Edit name, phone, avatar, addresses                                          |
| `/my-jobs`       | List of customer's jobs (filter by status)                                   |
| `/my-jobs/new`   | Post a job (multi-step form)                                                 |
| `/my-jobs/:id`   | Job detail + applicants + actions (assign, cancel, complete confirm, review) |
| `/notifications` | List + mark read                                                             |
| `/settings`      | Account settings, change password, delete account                            |

## Reusable Components

- JobCard, WorkerCard, CategoryCard, ReviewList, RatingStars, AddressPicker, ApplicationList, NotificationItem, EmptyState, SkeletonCard, FileUpload.

## Page-Level Behaviors

- **Landing**: hero, "How it works", featured categories, footer.
- **Workers list**: server-rendered for SEO; client-side filtering.
- **Worker detail**: portfolio carousel, skills chips, reviews, "Request" CTA.
- **Post Job**: step 1 (category) → step 2 (details) → step 3 (budget + schedule) → step 4 (address) → review & post.
- **Job detail (owner)**: tabbed view — Overview, Applicants, Messages (future), Status history.

## State Management

- **Zustand**: auth session, UI prefs (theme), draft job form.
- **TanStack Query**: server data (jobs, workers, notifications).

## Accessibility

- All forms labeled; tab order verified.
- Color contrast WCAG AA.
- Keyboard-navigable filters and pagination.
