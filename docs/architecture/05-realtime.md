# 05 — Realtime Layer

## Decision: **Socket.io for transport; Redis Pub/Sub for horizontal fan-out.**

**Tag:** Socket.io — **Future Enhancement** (Phase 15); Redis Pub/Sub — **Future Enhancement** (Phase 15); both required together before scaling beyond a single backend instance.

## Why Socket.io

- **Rooms + namespaces** map cleanly to chats, job channels, notifications.
- **Auto-reconnect, fallback, ack callbacks** — saves us from hand-rolling.
- **JWT auth during handshake** — integrates with our existing auth model.
- **Battle-tested** under high concurrency.

## Why Not Alternatives

| Option                | Verdict   | Reason                                                  |
| --------------------- | --------- | ------------------------------------------------------- |
| Raw WebSockets (`ws`) | ❌        | No rooms, no auto-reconnect. We'd reinvent Socket.io.   |
| Server-Sent Events    | ❌        | One-way, no binary, no rooms.                           |
| Pusher / Ably         | ⏳ Future | Vendor lock-in + cost at scale. Consider post-Series A. |
| Firebase Realtime DB  | ❌        | Vendor + not aligned with our DB story.                 |

## Architecture

### Single Backend Instance (MVP / Phase 15)

```
[ Client ] ── socket.io ──▶ [ API server (Socket.io attached) ]
                              │
                              └── in-process EventEmitter
```

### Horizontally Scaled (Pre-launch hardening)

```
[ Client A ] ──▶ [ API server #1 ] ──┐
                                    ├──▶ Redis Pub/Sub ──▶ [ API server #2 ] ──▶ [ Client B ]
[ Client C ] ──▶ [ API server #2 ] ──┘
```

## Use Cases (Phased)

| Use Case                          |  Phase | Notes                                             |
| --------------------------------- | -----: | ------------------------------------------------- |
| Realtime chat (customer ↔ worker) |     15 | Room = jobId; persistent message log in Postgres. |
| Typing indicators                 |     15 | Ephemeral, not persisted.                         |
| Read receipts                     |     15 | Persist on `messages.readAt`.                     |
| Live notifications (admin → user) |     15 | Targeted emit by userId room.                     |
| Presence (online/offline)         |     15 | Redis sliding TTL keyed by userId.                |
| Live job status updates           | Future | Subscribe to a job channel.                       |
| Live admin dashboards             | Future | Metrics streaming.                                |

## Auth

- JWT verified in `io.use((socket, next) => ...)`.
- Room assignment checked on `socket.join` (e.g., only participants in `job:<id>`).

## Scaling Plan

| Scale                   | Approach                                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| < 1k concurrent sockets | Single instance, in-process rooms.                                                                                                                 |
| 1k–10k                  | Socket.io **Redis Adapter** (`@socket.io/redis-adapter`).                                                                                          |
| 10k–50k                 | Multiple Socket.io nodes behind a load balancer with **sticky sessions** (session affinity by `sid` cookie or IP-hash). Redis adapter for fan-out. |
| 50k+                    | Dedicated realtime cluster; consider shedding to specialized service.                                                                              |

## Sticky Sessions

- Configure LB to hash on a Socket.io handshake cookie or `sec-websocket-key`.
- Alternative: implement custom handshake token + hash at LB.

## Backpressure

- If a client is slow, Socket.io buffers. Set buffer limits and disconnect if exceeded.

## Mobile / Push (Future)

- Web Push API for browser push.
- FCM (Android) + APNs (iOS) when mobile apps exist.

## Message Persistence

- Chat messages persist in `messages` table.
- Realtime channel is the _transport_, not the source of truth.

## Tagging Summary

| Tech                    | Tag                                                           |
| ----------------------- | ------------------------------------------------------------- |
| Socket.io               | Future Enhancement (Phase 15)                                 |
| Socket.io Redis Adapter | Required Before Production Launch (when Socket.io is enabled) |
| Redis Pub/Sub           | Future Enhancement                                            |
| Pusher/Ably             | Future Enhancement                                            |
