# 10 — Role & Permission Matrix

## Roles

- `CUSTOMER` — posts and hires for jobs.
- `WORKER` — applies to and completes jobs; maintains profile.
- `ADMIN` — moderates, verifies, analyzes.

## Matrix (Y = allowed)

| Resource / Action           | CUSTOMER |     WORKER      |     ADMIN     |
| --------------------------- | :------: | :-------------: | :-----------: |
| Sign up                     |    Y     |        Y        | (invite only) |
| Login                       |    Y     |        Y        |       Y       |
| Update own profile          |    Y     |        Y        |       Y       |
| Create worker profile       |    —     |        Y        | Y (override)  |
| Verify worker               |    —     |        —        |       Y       |
| Suspend / reactivate user   |    —     |        —        |       Y       |
| Create / edit categories    |    —     |        —        |       Y       |
| View public worker list     |    Y     |        Y        |       Y       |
| View public job list        |    Y     |        Y        |       Y       |
| Create job                  |    Y     |        —        |       Y       |
| Edit own job (DRAFT/OPEN)   |    Y     |        —        |       Y       |
| Cancel own job              |    Y     | Y (if assigned) |       Y       |
| View own applications       |    —     |        Y        |       Y       |
| Apply to job                |    —     |        Y        |       —       |
| Withdraw application        |    —     |        Y        |       —       |
| View applicants on own job  |    Y     |        —        |       Y       |
| Accept / reject application |    Y     |        —        |       Y       |
| Start assigned job          |    —     |        Y        |       —       |
| Mark job complete           |    —     |        Y        |       —       |
| Confirm completion          |    Y     |        —        |       Y       |
| Review completed job        |    Y     |        Y        |       —       |
| Read notifications          |    Y     |        Y        |       Y       |
| Send reports                |    Y     |        Y        |       Y       |
| Resolve reports             |    —     |        —        |       Y       |
| View analytics              |    —     |        —        |       Y       |

## Enforcement Layers

1. **Middleware**: auth + role guard.
2. **Service layer**: ownership / state-machine checks.
3. **DB constraints**: foreign keys, unique indexes, check constraints.

## Default-Deny

Any action not explicitly allowed is **denied**.

## Admin Sub-Roles (Future)

- `SUPER_ADMIN` — all permissions including admin management.
- `SUPPORT_AGENT` — read-only + reports handling, no config changes.
- `TRUST_ANALYST` — worker verifications, report triage.
