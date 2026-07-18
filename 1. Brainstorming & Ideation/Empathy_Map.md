# Empathy Map

## Devotee

| Dimension | Observation |
|---|---|
| Says | “I want to know which slots are available before travelling.” |
| Thinks | “Will seats still be available while I enter all traveller details?” |
| Does | Searches by temple/location, compares dates, enters devotee details, confirms the simulated checkout, prints a ticket. |
| Feels | Uncertain about queues; reassured by capacity, countdown, status, and ticket code. |
| Pain points | Travel uncertainty, limited visibility, repeated data entry, expired holds, unclear refund behavior. |
| Gains | Remote planning, transparent price/capacity, booking history, printable proof, donation receipt. |

## Temple organizer

| Dimension | Observation |
|---|---|
| Says | “I need to publish capacity and see who booked.” |
| Thinks | “Which temple and date require more slots?” |
| Does | Creates or deletes slots, reviews booking records, updates profile. |
| Feels | Responsible for capacity and schedule accuracy. |
| Pain points | The current model has no organizer ownership/assignment and shows global data. |
| Gains | One slot scheduler and consolidated registry. |

## Administrator

| Dimension | Observation |
|---|---|
| Says | “I need control and a quick operational overview.” |
| Thinks | “Which temples are popular, what revenue is recorded, and what facilities need work?” |
| Does | Filters/deletes users, creates/deletes temples, schedules events, tracks maintenance, views analytics. |
| Feels | Accountable for integrity, access, and reporting. |
| Pain points | No edit UI for several resources, no audit trail, no cascade cleanup, and insecure public role selection. |
| Gains | Central management and summary metrics. |

## Design implications

- Keep temple/slot browsing public, but require authentication for state changes.
- Make availability and hold expiration prominent.
- Use server-authoritative prices, seat counts, roles, and status transitions.
- Associate every organizer with explicit temple IDs.
- Separate simulated checkout clearly from real payment.
- Add confirmation, audit history, notification, accessibility, and recovery flows before production use.
