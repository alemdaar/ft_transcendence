# User service

Express/TypeScript authentication and account API backed by PostgreSQL and Prisma. Supports 1337 student email registration, password login, 42 OAuth, database sessions, and short-lived JWTs.

## Run locally

Use Node.js 22.12+ (the Docker image uses Node.js 24) and PostgreSQL 17. Start PostgreSQL with the root project's Compose configuration, then run these commands in `backend/user-service`:

```sh
npm ci
cp .env.example .env
# Fill in DATABASE_URL, independent random secrets, Gmail app password and 42 credentials.
npm run prisma:generate
npm run db:deploy
npm run dev
```

`db:deploy` applies migrations to the database selected by `DATABASE_URL`. It also creates `user_sessions`; the application does not create tables automatically. Existing sessions are invalidated by the security upgrade; users must sign in again. `npm run build` and `npm start` run the compiled service.

The frontend already proxies `/auth` through Vite. Set the registered 42 redirect URI to `http://localhost:5173/auth/42/callback` so the browser uses the same host for the OAuth session cookie. `FRONTEND_URL` controls the successful OAuth redirect and allowed frontend origin. Production requires HTTPS for session cookies (`NODE_ENV=production`). Route `/auth` through your frontend's public origin. Cross-origin credential sharing is not configured.

`PORT` defaults to 3001. `TRUST_PROXY` defaults to disabled; set exact trusted proxy IPs/CIDRs (for example `loopback` for a local proxy). Do not expose a backend through untrusted alternate proxy paths. Generate secrets with `openssl rand -hex 32` and use a different value for each secret.

## API

Requests with bodies use `Content-Type: application/json`. Existing registration field names and response shapes are retained. Emails are trimmed and lowercased; only `@student.1337.ma` is accepted.

| Method | Endpoint | Authentication / body |
| --- | --- | --- |
| POST | `/auth/register` | `{email, password, confirmpassword}` |
| POST | `/auth/verify-email` | `{email, code}`; six-digit code, five-minute expiry |
| POST | `/auth/resend-code` | `{email}`; 60-second cooldown |
| POST | `/auth/login` | `{email, password}`; sets `ft.sid` cookie |
| GET | `/auth/42` | Starts 42 OAuth |
| GET | `/auth/42/callback` | 42 callback with code and session-bound state |
| GET | `/auth/me` | Session cookie or `Authorization: Bearer <token>` |
| PATCH | `/auth/me` | Session; one or more of `{displayname, location, avatarUrl}` |
| POST | `/auth/logout` | Session; destroys current session |
| POST | `/auth/token` | Session; returns a JWT valid for 900 seconds |
| POST | `/auth/change-password` | Session; `{currentPassword, password, confirmpassword}` |
| POST | `/auth/forgot-password` | `{email}`; generic response for unknown accounts |
| POST | `/auth/reset-password` | `{token, password, confirmpassword}` |
| DELETE | `/auth/me` | Session; `{confirmation: "DELETE", currentPassword}` |
| GET | `/health` | Process liveness |
| GET | `/ready` | Database connectivity and required tables/columns |

Profile edits accept display names of 1–80 characters, locations up to 80 characters or `null`, and HTTPS avatar URLs up to 2048 characters or `null`. Identity fields, campus and points cannot be changed through this API.

A local account needs its current password for deletion. An OAuth-only account needs a 42 sign-in within the last ten minutes and `{confirmation: "DELETE"}`. OAuth-only users can establish a local password using the email reset flow. The service deletes its own account data; other services must handle their own related data when those integrations are implemented.

Reset emails currently contain a token to submit to `/auth/reset-password`. Tokens expire after 15 minutes and are stored only as SHA-256 hashes. A frontend reset form can accept this token; the frontend account-management screens are not part of this backend change.

## Authentication behavior

- Passwords are hashed with Argon2. Session IDs regenerate after login, and cookies are HTTP-only, SameSite=Lax, and secure in production.
- Registration cannot overwrite an active pending password. Use verification/resend, or restart registration after the five-minute code expiry.
- Registration/resend share a database lock and cooldown. Verification rechecks and consumes the exact unexpired registration in the same transaction as user creation.
- Email delivery runs inside the transaction with bounded SMTP timeouts. A delivery failure rolls back the new code/token. SMTP acceptance and database commit cannot be atomic: if commit fails after SMTP accepts a message, a retry may still be necessary.
- IP limits supplement persistent, atomic PostgreSQL limits per normalized email. Account limits apply to register (5/15min), login (10/15min), verification (10/5min), resend (3/15min), and reset requests (3/15min). Resending does not reset verification limits. `429` cooldown responses include `Retry-After` and `retryAfter`.
- Password changes/resets increment the user's authentication version, revoking all previous sessions and JWTs. Account deletion removes reset tokens and sessions. Old sessions/JWTs are rejected when the account no longer exists.
- JWTs use HS256, issuer `user-service`, audience `ft-transcendence-services`, `sub` containing the local user ID as a string, `campus` containing the stored campus name, and `version` containing the user's authentication version. Campus must be a non-empty string; tokens issued before the campus claim was added must be reissued through `/auth/token`. Other services must validate these fields and check account/version validity (for example with bearer-authenticated `/auth/me`) to honor revocation. Signature validation alone does not provide revocation.
- Logout destroys the current session. Previously issued JWTs remain valid until expiry or an account-wide revocation.
- Cross-site mutation requests are rejected by origin checks; browsers use the same-origin proxy. API clients without an Origin header may authenticate using their cookie.
- Expired rate limits/reset tokens and pending registrations older than an additional 24 hours are cleaned every five minutes.

## Checks

```sh
npm run build
npm test
npm run test:integration
```

Integration tests need a reachable PostgreSQL account with `CREATEDB` permission, using `TEST_DATABASE_URL` or falling back to `DATABASE_URL`. They create a randomly named temporary database, apply all migration SQL there, test real HTTP/session/database behavior and concurrency, and drop only that database. Email and 42 responses are stubbed; no real emails or OAuth exchanges occur. Never point these tests at a connection pool that prevents database creation.

For expanded TAP output, run `node --require tsx/cjs tests/auth.integration.cjs` directly.

## Docker

Apply migrations before starting the runtime image. From this directory:

```sh
docker build --target build -t user-service-migrations .
# DATABASE_URL must be reachable from the container. Attach the PostgreSQL Docker network as needed.
docker run --rm --env-file .env user-service-migrations npm run db:deploy
docker build -t user-service .
docker run --rm --env-file .env -p 3001:3001 user-service
```

The runtime image runs as the `node` user, contains compiled code and production dependencies, and checks `/ready`. It excludes `.env`, source credentials, local dependencies and tests. Configure HTTPS termination, proxy trust, and container networking in your deployment. The root Compose file currently starts PostgreSQL only.
