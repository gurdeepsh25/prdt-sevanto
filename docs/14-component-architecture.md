# 14 — Component Architecture

## Layering

1. **UI Primitives** (`components/ui/*`) — Shadcn-derived (Button, Input, Dialog, Sheet, DropdownMenu, Tabs, Card, Badge, Avatar, Toast, Tooltip, Skeleton).
2. **Domain Components** (`components/<domain>/*`) — composed of primitives; encode domain rules.
3. **Feature Components** — pages and large widgets using domain components.

## Shared Component Examples

### Auth

- `AuthForm` (wraps form fields, validation, error display).
- `EmailField`, `PasswordField`, `SubmitButton`.

### Jobs

- `JobCard` (variants: `customer`, `worker`, `admin`).
- `JobStatusBadge`.
- `JobStatusTimeline`.
- `BudgetRange`.
- `PostJobWizard`.

### Workers

- `WorkerCard`.
- `WorkerProfileHeader`.
- `SkillChips`, `SkillPicker`.
- `PortfolioGrid`.
- `RatingStars`, `ReviewItem`.

### Notifications

- `NotificationItem`, `NotificationList`.

### Layout

- `AppShell` (sidebar + header).
- `MobileNav`.
- `EmptyState`, `ErrorState`, `LoadingState`.

## Hooks (Shared Across Apps)

- `useAuth()` — current user, login/logout/register.
- `useDebouncedValue`.
- `usePagination`.
- `useFilters`.
- `useToast`.
- `useUpload` (handles signed-URL flow).

## Stores (Zustand)

### `authStore`

- `user`, `accessToken`, `isAuthenticated`, `setUser`, `logout`.

### `uiStore`

- `theme`, `sidebarOpen`, `toasts`.

### `draftJobStore`

- Multi-step wizard state.

### `onboardingStore` (worker)

- Profile draft.

## API Client

- `lib/api.ts` — fetch wrapper with auth header injection, error normalization, refresh-on-401 retry once.
- TanStack Query default options: staleTime 30s, retry 1, refetchOnWindowFocus true.

## Form Pattern

- Zod schema → react-hook-form resolver.
- Field-level error rendering.
- Submit button disabled while pending.

## Theming

- Tailwind + CSS variables (Shadcn).
- Dark mode via class strategy.

## Icons

- Lucide-react (Shadcn default).

## Testing Hooks for Components

- Render with `render(<X />)` from `@testing-library/react`.
- Mock API via MSW for integration-style component tests.
