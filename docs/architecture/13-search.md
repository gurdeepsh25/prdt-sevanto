# 13 — Search

## Decision: **PostgreSQL Full-Text Search for MVP**, with `pg_trgm` for fuzzy matching and GIN indexes.

**Tag:** Required For MVP.

## Why FTS First

- We already have Postgres.
- No new infrastructure.
- Native ranking (`ts_rank`).
- Combines well with structured filters (category, city, budget).
- Strong for: title + description + skill name lookups.

## Schema Setup

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

ALTER TABLE jobs ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(description,'')), 'B')
  ) STORED;

CREATE INDEX jobs_search_idx ON jobs USING GIN (search_vector);

CREATE INDEX jobs_title_trgm ON jobs USING GIN (title gin_trgm_ops);
```

Similar for `worker_profiles` (headline + bio).

## Query Pattern

```sql
SELECT id, ts_rank(search_vector, plainto_tsquery('english', $1)) AS rank
FROM jobs
WHERE search_vector @@ plainto_tsquery('english', $1)
  AND status = 'OPEN'
  AND category_id = $2
ORDER BY rank DESC, created_at DESC
LIMIT 20;
```

## Typeahead

- Use `ILIKE '%q%'` with limit 10, or trigram similarity for typo-tolerance.
- Cache hot prefixes in Redis for 60s.

## When to Migrate

| Symptom                             | Trigger          | Action                                                  |
| ----------------------------------- | ---------------- | ------------------------------------------------------- |
| Search p95 > 300 ms                 | Sustained        | Add materialized view + more indexes                    |
| Relevance complaints                | Frequent         | Tune ranking weights                                    |
| High write contention               | Slowdowns        | Move writes to a read replica; denormalize search index |
| Need rich typo tolerance / synonyms | Product feedback | Migrate to Meilisearch                                  |
| Need multi-language                 | i18n expansion   | Migrate to OpenSearch                                   |

## Migration Targets

### Meilisearch (Recommended first move)

- **Tag:** Future Enhancement.
- Drop-in API; handles typo tolerance, instant search, faceting out of the box.
- Sync via BullMQ `search.index.update` jobs.
- Estimated cost at 100k docs: ~$30/mo (self-hosted) or similar on Meilisearch Cloud.

### OpenSearch / Elasticsearch

- **Tag:** Enterprise Scale Requirement.
- Consider only at very large scale (multi-million docs, multi-language, complex analytics).
- Higher operational cost.

## Tagging Summary

| Tech                       | Tag                          |
| -------------------------- | ---------------------------- |
| Postgres FTS               | Required For MVP             |
| `pg_trgm` extension        | Required For MVP             |
| GIN indexes                | Required For MVP             |
| Meilisearch                | Future Enhancement           |
| OpenSearch / Elasticsearch | Enterprise Scale Requirement |
