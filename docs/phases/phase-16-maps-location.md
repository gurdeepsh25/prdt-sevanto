# Phase 16 — Maps & Location

## Objective

Add geo-discovery features: distance sorting, map view of workers/jobs, and geocoding for addresses.

## Business Purpose

- Hyperlocal relevance.
- Better discovery for customers and workers.
- Foundation for routing features.

## Database Changes

- **Changes to `jobs`**: ensure `lat`, `lng` populated.
- **Changes to `worker_profiles`**: add `lat`, `lng` (derived from primary address).
- **Migration**: backfill `lat`, `lng` for existing rows.

## Prisma Changes

- Add lat/lng fields where missing.
- Migration: `016_geo`.

## Backend Tasks

- [ ] Geocoding service (provider: Mapbox / Google / OSM).
- [ ] On address create/update, geocode → store lat/lng.
- [ ] Update worker profile coords when primary address changes.
- [ ] Search endpoints accept `lat`, `lng`, `radiusKm`.
- [ ] Distance calculation (Haversine).
- [ ] Performance: pre-filter by bounding box; refine by distance.

## Customer App Tasks

- [ ] Map view on `/workers` (clustered pins).
- [ ] Distance display.

## Worker App Tasks

- [ ] Map view on `/jobs`.

## Admin App Tasks

- [ ] Heatmap of demand (analytics).

## API Endpoints

- Existing list endpoints accept geo params.
- `GET /api/v1/geo/reverse?lat=&lng=` (reverse geocode).

## Validation Rules

- `lat`: -90..90; `lng`: -180..180; `radiusKm`: 1..100.

## Security Requirements

- Geocoding API key server-side only.
- Don't expose precise lat/lng to non-owners in MVP.

## Acceptance Criteria

- [ ] Customers can search workers within X km.
- [ ] Map view displays workers and jobs.
- [ ] Distance is shown in result cards.

## Testing Checklist

- [ ] Unit: Haversine, bbox math.
- [ ] Integration: search by location.
- [ ] Performance: query time with 100k workers.

## Deployment Notes

- Map provider API key + billing plan.
- Add monitoring for geocoding quota.

## Completion Checklist

- [ ] All tasks above checked.
- [ ] Tests pass.
- [ ] Progress tracker updated.
