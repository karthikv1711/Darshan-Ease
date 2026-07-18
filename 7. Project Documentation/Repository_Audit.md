# Repository Audit

## Review basis

- Repository: `https://github.com/karthikv1711/Darshan-Ease`
- Branch reviewed: `main`
- Commit: `d1c1a5fe2cbdb2c254892f51d9ba0d3832b1bced`
- Commit subject/date: `Update README.md`, 12 July 2026 (UTC+05:30)
- Review date: 18 July 2026
- Approximate checkout size: 35 MB
- Approximate JavaScript/JSX/CSS project lines counted: 7,584

## Source inventory

| Area | Notable files |
|---|---|
| Root | `.gitignore`, `README.md` |
| Client configuration | `package.json`, `package-lock.json`, `vite.config.js`, `.oxlintrc.json` |
| Client pages | Home, Login, Register, TempleDetails, Donation, three dashboards |
| Client components | Navbar, Footer, BookingModal, DeityIntroModal, audio player |
| Client contexts | AuthContext, AudioContext |
| Static content | Six temple/deity images, three MP3 tracks, icons/favicon |
| Server configuration | Database connection and seeder |
| Server routes | Auth, temples, slots, bookings, donations, admin |
| Server controllers | Six controller modules |
| Server models | User, Temple, DarshanSlot, Booking, Donation |
| Server middleware | JWT protection and role checks |

## Feature-to-source map

| Feature | Frontend | Backend |
|---|---|---|
| Authentication/profile | `AuthContext`, Login, Register, dashboards | `authRoutes`, `authController`, User model, auth middleware |
| Temple discovery/details | Home, TempleDetails | temple routes/controller/model |
| Slots | TempleDetails, Organizer dashboard | slot routes/controller/model |
| Booking hold/ticket | BookingModal, User dashboard | booking routes/controller/model |
| Donation receipt/history | Donation, User dashboard | donation routes/controller/model |
| Admin management/analytics | Admin dashboard | admin routes/controller plus temple controller |
| Seed content | Public images/audio | `config/seeder.js` |

## README discrepancies

The repository README is visually polished but generic and materially outdated relative to the code:

- It lists only HTML/CSS/JavaScript rather than React/Vite/Axios/Router.
- It says Express is used “if used,” although Express is the implemented backend.
- It does not identify MongoDB/Mongoose, JWT, bcrypt, roles, booking, donations, reviews, or dashboards.
- It describes authentication, database integration, and admin dashboard as future work even though they exist.
- It instructs frontend `npm start`, but the client has no `start` script.
- It suggests port 3000; Vite normally uses 5173 and the API uses 5000.
- It claims an MIT license, but no `LICENSE` file is present in the reviewed tree.
- It contains no API reference, environment variable guide, test status, security limitations, or simulated-payment warning.

## Maintainability observations

- Business logic is concentrated in controllers and large JSX pages/components.
- Inline styling is extensive, which makes consistent UI evolution harder.
- There is repeated form/payment validation between booking and donation.
- There is no API client abstraction beyond global Axios defaults.
- Error handling/logging is inconsistent and sometimes ignores caught errors.
- No pagination exists for users, bookings, donations, temples, or slots.
- `server/index.js` only requires `server.js` and is not the package entrypoint used by scripts.
- Both `npm start` and `npm run dev` execute `node server.js`; no development watcher is configured.
- `server/node_modules` is committed even though dependency lockfiles exist.

## Recommended documentation ownership

| Document | Update trigger | Owner suggestion |
|---|---|---|
| SRS/use cases | User-visible behavior or policy changes | Product + engineering |
| Architecture/data design | Component, schema, or authorization changes | Tech lead |
| API reference | Route/payload/status changes | Backend owner |
| Developer guide | Toolchain/configuration changes | Engineering |
| Test/security review | Every release and security fix | QA + security + engineering |
| User manual/demo | UI workflow changes | Product/QA |
| Deployment/operations | Infrastructure/runbook changes | Platform/operations |

