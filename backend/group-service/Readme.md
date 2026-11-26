# StudyPeer — Group Service (`B2`)

![Node.js](https://img.shields.io/badge/Node.js-ESM-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2.1-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_ORM-6.19.3-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-4.6.5-3E67B1?style=flat-square&logo=zod&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-Stateless_JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)


> **Location:** `ft_transcendence/backend/group-service`
>
> **Service Role:** B2 Microservice — Study Communities, Campus Isolation & Membership Workflows

The **Group Service** is an isolated backend microservice within the **StudyPeer** (`ft_transcendence`) ecosystem. It manages study group lifecycles across two community tiers (`general` and `team`), enforces campus-level visibility boundaries (`Rabat`, `Tetouan`, `Benguerir`, `Khouribga`), orchestrates atomic join-request approval workflows, and enriches membership data via fault-tolerant inter-service communication with the **Users Service (`B1`)**.

## Table of Contents

* [Architecture & Inter-Service Design](#architecture--inter-service-design)
* [Engineering Highlights & Implemented Modules](#engineering-highlights--implemented-modules)
* [Project Structure](#project-structure)
* [Database Schema](#database-schema)
* [Local Setup & Running with Docker](#local-setup--running-with-docker)
* [API Endpoints Reference](#api-endpoints-reference)
* [Testing & Verification Guide](#testing--verification-guide)

## Architecture & Inter-Service Design

```text
┌────────────────────┐        Bearer JWT         ┌──────────────────────────────────┐
│                    │ ────────────────────────▶ │       Group Service (B2)         │
│  Client / Postman  │                           │  Express 5 · Zod · Prisma ORM    │
│                    │ ◀──────────────────────── │                                  │
└────────────────────┘        JSON + Meta        └───────────┬──────────────────────┘
                                                             │
                                     ┌───────────────────────┴───────────────────────┐
                                     │                                               │
                                     ▼                                               ▼
                     ┌───────────────────────────────┐               ┌───────────────────────────────┐
                     │   PostgreSQL 17 (postgres-b2) │               │      Users Service (B1)       │
                     │       groups_database         │               │   POST /users/batch           │
                     │   Dedicated Service Storage   │               │   (Graceful Fallback Enabled) │
                     └───────────────────────────────┘               └───────────────────────────────┘
```

* **Database-per-Service Isolation:** Owns its dedicated PostgreSQL 17 instance (`groups_database`) managed via Prisma ORM migrations and cascade deletion rules.
* **Stateless JWT Verification:** Authenticates incoming requests locally via `JWTauth.js` using a shared `JWT_SECRET`. Extracts `sub` (42 student user ID) and `campus` directly from verified token claims without synchronous database or auth-service round-trips.
* **Fault-Tolerant Profile Enrichment:** Endpoints returning user lists (`GET /groups/:id/members` and `GET /groups/:id/join-request`) batch-fetch user profiles from the B1 Users Service (`POST http://localhost:3000/users/batch`). If B1 is unreachable or returns missing records, the service degrades gracefully (`ProfilesLoaded: false` or `"Unknown user"` fallback) rather than failing the request.

## Engineering Highlights & Implemented Modules

* **Dual-Tier Study Communities (`Organization` — Major Module):**
  * **`general` groups:** Campus-wide open study hubs with instant membership (`POST /groups/:id/join`) and no capacity cap.
  * **`team` groups:** Restricted squads requiring `memberLimit` (`2–6` members), strict same-campus visibility/join isolation, and owner-moderated join requests.
* **Multi-Scope Discovery & Filtering (`Advanced Search` — Minor Module):**
  * Unified `GET /groups` endpoint supporting `mine`, `pending`, and `discover` scopes, dynamic `type` filtering, case-insensitive substring `search`, chronological `sort` (`newest`/`oldest`), and offset pagination (`take`/`skip`) with metadata.
* **Atomic Approval Workflows (`Advanced Permissions` — Major Module):**
  * Owner-restricted approval/rejection endpoints (`PATCH /groups/:id/join-request/:requestId/approve` & `/reject`) backed by Prisma `$transaction` to guarantee atomic status transitions and member insertion while enforcing group capacity limits.
* **Schema-First Validation & Error Handling:**
  * Centralized Zod middleware (`validate.js`) validating `params`, `query`, and `body` payloads with structured field-level error reporting before database execution, paired with Prisma error code handling (`P2025`).

## Project Structure

```text
group-service/
├── prisma/
│   └── schema.prisma             # PostgreSQL models, enums, and cascade relations
├── src/
│   ├── appRouter/
│   │   └── appRouter.js          # Route definitions, auth gate, and Zod validation bindings
│   ├── controller/
│   │   ├── control_groups.js     # Group CRUD, multi-scope discovery, and member listing
│   │   ├── healthcheck.js        # Service & database liveness check
│   │   └── joinGroup.js          # Instant join, team join requests, and owner approvals/rejections
│   ├── middleware/
│   │   ├── JWTauth.js            # Bearer token verification & req.user extraction
│   │   └── validate.js           # Reusable Zod validation middleware (body, params, query)
│   ├── utils/
│   │   └── AppError.js           # Custom application error utility
│   ├── ZODSchema/
│   │   └── GroupSchema.js        # Schemas & refinements for groups, IDs, and pagination
│   ├── db.js                     # Singleton PrismaClient instance
│   └── server.js                 # Express application entry point
├── .env.example                  # Environment variable template
├── docker-compose.yml            # PostgreSQL 17 container definition
└── package.json                  # ES Module configuration, scripts, and dependencies
```

## Database Schema

```mermaid
erDiagram
    Group ||--o{ member : "has"
    Group ||--o{ join_team : "receives"
    Group ||--o{ message : "contains"
    Group ||--o{ resources : "stores"

    Group {
        Int id PK
        String name
        GroupType type "general | team"
        String description
        CampusName campus "Rabat | Tetouan | Benguerir | Khouribga"
        Int memberLimit "2-6 for team, null for general"
        Int ownerID
        DateTime createdAt
    }

    member {
        Int id PK
        Int groupID FK
        Int userID
        MemberRole role "OWNER | ADMIN | MEMBER"
        DateTime joinedAt
    }

    join_team {
        Int id PK
        Int groupID FK
        Int userID
        RequestStatus status "PENDING | ACCEPTED | REJECTED"
        DateTime requestedAt
    }

    message {
        Int id PK
        Int groupID FK
        Int senderID
        String content
        DateTime createdAt
    }

    resources {
        Int id PK
        Int groupID FK
        Int addedBy
        String title
        String description
        String content
        DateTime createdAt
    }
```

> **Note:** `message` and `resources` tables are provisioned in `schema.prisma` with `onDelete: Cascade` relations ready for upcoming real-time chat and resource-vault endpoints.

## Local Setup & Running with Docker

### Prerequisites

* **Node.js** `v18+` (required for native `--watch` mode in `npm run dev`)
* **Docker** & **Docker Compose**

### 1. Configure Environment Variables

Navigate to the service directory and create your `.env` file from `.env.example`:

```bash
cd backend/group-service
cp .env.example .env
```

Update `.env` with your local database credentials and shared JWT secret:

```env
# PostgreSQL Docker Configuration
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=groupsDB
POSTGRES_PORT=5432

# Prisma Database Connection
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"

# Authentication
JWT_SECRET="your_shared_jwt_secret"
```

### 2. Start PostgreSQL & Sync Prisma Schema

```bash
# 1. Install dependencies
npm install

# 2. Start the PostgreSQL 17 container
docker compose up -d

# 3. Push the Prisma schema to the database & generate the client
npx prisma db push
```

### 3. Run the Server

```bash
# Development mode (auto-reloads on file changes)
npm run dev

# Production mode
npm start
```

## API Endpoints Reference

All `/groups` routes require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth / Role | Parameters / Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | None | Verifies server and PostgreSQL liveness. |
| `POST` | `/groups` | JWT User | **Body:** `name`, `type` (`general`\|`team`), `description?`, `memberLimit?` (`2–6` for `team` only) | Creates a study group using JWT `campus` and assigns creator as `OWNER`. |
| `GET` | `/groups` | JWT User | **Query:** `scope` (`mine`\|`pending`\|`discover`), `page?`, `type?`, `search?`, `sort?` (`oldest`) | Retrieves paginated study groups (4/page) with campus isolation on `team` groups. |
| `GET` | `/groups/:id` | JWT User | **Path:** `id` | Fetches group details; blocks cross-campus access for `team` groups. |
| `DELETE` | `/groups/:id` | Group `OWNER` | **Path:** `id` | Deletes a group and cascades deletion to members and requests. |
| `POST` | `/groups/:id/join` | JWT User | **Path:** `id` | Instantly joins a `general` group as `MEMBER`. |
| `POST` | `/groups/:id/join-request` | Same-Campus User | **Path:** `id` | Submits a `PENDING` join request for a same-campus `team` group. |
| `GET` | `/groups/:id/members` | JWT User | **Path:** `id` | Lists group members enriched with B1 user profiles (with fallback). |
| `GET` | `/groups/:id/join-request` | Group `OWNER` | **Path:** `id` | Lists `PENDING` join requests for a `team` group enriched with B1 profiles. |
| `PATCH` | `/groups/:id/join-request/:requestId/approve` | Group `OWNER` | **Path:** `id`, `requestId` | Atomically approves a pending request and adds the user as `MEMBER`. |
| `PATCH` | `/groups/:id/join-request/:requestId/reject` | Group `OWNER` | **Path:** `id`, `requestId` | Marks a pending team join request as `REJECTED`. |

## Testing & Verification Guide

### 1. Generate a Local Test JWT

To test endpoints independently without running the B1 authentication service, generate a signed token matching the expected JWT payload (`subject` and `campus`) using your `.env` `JWT_SECRET`:

```bash
node -e '
import("dotenv/config").then(async () => {
  const { default: jwt } = await import("jsonwebtoken");
  const token = jwt.sign(
    { subject: "12", campus: "Rabat" },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
  console.log("\nBearer Token:\n" + token + "\n");
});
'
```

### 2. Recommended Edge-Case Test Matrix

* **Campus Isolation:** Sign a second JWT with `"campus": "Tetouan"` and verify `GET /groups?scope=discover&type=team`, `GET /groups/:id`, and `POST /groups/:id/join-request` block access (`403`) to `Rabat` team groups while permitting `Rabat` general groups.
* **Capacity Enforcement:** Create a `team` group with `"memberLimit": 2`, approve one join request, and verify subsequent join requests or approvals return `409 Conflict`.
* **Input & Param Guardrails:** Send non-numeric IDs (`/groups/abc`), negative pages (`/groups?scope=discover&page=-1`), or a `memberLimit` on a `general` group to verify Zod `400` validation responses.
* **Graceful B1 Degradation:** Stop the B1 Users service and call `GET /groups/:id/members` to confirm the endpoint still returns `200 OK` with `"ProfilesLoaded": false`.