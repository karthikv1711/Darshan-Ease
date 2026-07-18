# Project Vision

## Problem statement

Temple visitors often face uncertain schedules, physical queues, fragmented event information, and limited visibility into slot capacity. Temple staff need one place to publish darshan availability and review bookings. Administrators need consolidated control over temples, users, events, maintenance, donations, and operational metrics.

## Proposed solution

DarshanEase is a responsive web platform that centralizes temple discovery, timed-slot reservations, simulated donation receipts, temple reviews, and role-specific administration. It uses a React client, REST API, and MongoDB persistence.

## Target users

| Persona | Goal | Current implementation |
|---|---|---|
| Devotee (`USER`) | Find a temple, reserve seats, obtain a ticket, donate, and review | Implemented |
| Temple organizer (`ORGANIZER`) | Schedule slots and inspect bookings | Implemented, but not restricted to assigned temples |
| System administrator (`ADMIN`) | Manage users, temples, events, maintenance, and analytics | Implemented |
| Guest | Browse temples, details, reviews, events, and public slots | Implemented |

## Value proposition

- Reduces uncertainty by displaying dates, time windows, prices, and live seat counts.
- Replaces a single-step reservation with a five-minute seat hold and explicit confirmation.
- Gives users printable tickets and donation receipts.
- Gives staff separate operational dashboards.
- Seeds meaningful sample content so the application can be demonstrated quickly.

## Core product goals

1. Allow public discovery of temple and slot information.
2. Authenticate users and enforce API permissions by role.
3. Prevent booking beyond available capacity.
4. Track a clear booking lifecycle and return expired capacity.
5. Record donations and generate traceable transaction identifiers.
6. Provide administrators with useful counts, revenue totals, popularity, and devotee demographics.

## In-scope capabilities in the repository

- Temple name/location search.
- Temple media, hours, amenities, events, ratings, and reviews.
- Date-based slot browsing and capacity display.
- Devotee detail capture and five-minute seat hold.
- Simulated card validation and booking confirmation.
- Booking and donation history.
- User profile updates.
- Organizer slot creation/deletion and booking registry.
- Admin analytics, user deletion/filtering, temple creation/deletion, events, and maintenance tracking.
- Light/dark theme and temple audio player.

## Explicitly out of scope or not implemented

- Real payment processing, refunds, settlement, or PCI-compliant card handling.
- Email/SMS/WhatsApp notifications.
- QR/barcode validation at temple entry.
- Organizer-to-temple assignment.
- Password reset, email verification, MFA, and session revocation.
- File/media upload; URLs/paths are entered manually.
- Automated tests, observability, containerization, and CI/CD.
- Production deployment configuration.

## Success indicators

For a production evolution, measure booking completion rate, hold-expiry rate, API error rate, oversell incidents, average booking latency, slot utilization, organizer response time, donation completion rate, and accessibility conformance. These metrics are recommendations; the current application does not collect them.

