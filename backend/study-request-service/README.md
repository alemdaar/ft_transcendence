# B3: Study Requests Service (quick start)

This service handles study requests: posting, claiming, the session hub, chat (online) and the meetup buttons (in-site).

**Stack:** Node.js, Express, Prisma 6, PostgreSQL, zod, jsonwebtoken.

You run the Node server on your machine. Docker is used only for the database.

---

## What you need

- Node.js 20 or newer
- Docker
- A `JWT_SECRET` that the whole team shares (see the `.env` step)

---

## Run it

**1. Install the packages**

```bash
npm install
```

**2. Create a `.env` file** in this folder. Do not commit it. Add `.env` and `pgdata` to `.gitignore`.

```dotenv
POSTGUSER=studyuser
POSTGPWD=secret
POSTGRESDB=studydb
HOST_DATA_PATH=./pgdata

DATABASE_URL=postgresql://studyuser:secret@localhost:2450/studydb
JWT_SECRET=choose-a-long-random-dev-secret-32-chars-min
PORT=3000
```

| Variable | What it is |
|---|---|
| `POSTGUSER`, `POSTGPWD`, `POSTGRESDB` | the database user, password and name. Docker reads them to create the database |
| `HOST_DATA_PATH` | a folder on your machine where the database files are saved |
| `DATABASE_URL` | how the server connects. It must use the same user, password and name as above, and the port `2450` |
| `JWT_SECRET` | the secret used to sign and check tokens (32 characters or more). The team picks one dev secret and everybody uses the same. Later it must be the same as B1's |
| `PORT` | the port of this server |

**3. Start the database.** This is the `docker-compose.yml` in this folder:

```yaml
services:
  postgres:
    image: postgres:15
    container_name: studyreq-db
    restart: always
    environment:
      POSTGRES_USER: ${POSTGUSER}
      POSTGRES_PASSWORD: ${POSTGPWD}
      POSTGRES_DB: ${POSTGRESDB}
    ports:
      - "2450:5432"
    volumes:
      - ${HOST_DATA_PATH}:/var/lib/postgresql/data
```

```bash
docker compose up -d
```

Docker reads the four variables from `.env` by itself. If one is missing, compose fails with an error.

**4. Create the tables**

```bash
npx prisma generate
npx prisma db push
```

**5. Start the server**

```bash
node src/server.js
```

**6. Check it works.** Build a token (see "Get a token"), then:

```bash
API=http://localhost:3000
TOKEN=paste-your-token-here
curl -i $API/peer-request -H "Authorization: Bearer $TOKEN"
```

You should get `200` and an empty list `[]`.

---

## Get a token

Build a test token on **jwt.io**.

1. Open [jwt.io](https://jwt.io) and go to the encoder.
2. Algorithm: `HS256`.
3. Payload (`sub` is the user id, use another number for a second user):

```json
{
  "sub": "42",
  "campus": "Khouribga",
  "iss": "user-service",
  "aud": "ft-transcendence-services",
  "exp": 2000000000
}
```

4. Secret: the same value as `JWT_SECRET` in your `.env`.
5. Copy the token and send it in the header.

Every request needs this header:

```
Authorization: Bearer <token>
```

---

## Endpoints

`:id` is the post id. Every endpoint needs the token. Endpoints without a body in the notes take no body.

| Method | Path | Who | Notes |
|---|---|---|---|
| `POST` | `/peer-request` | any user | create a post (body below) |
| `GET` | `/peer-request` | any user | the feed: open posts, never your own |
| `GET` | `/peer-request/:id` | any user | details of one post |
| `POST` | `/peer-request/:id/claim` | any user except the asker | claim an open post. In-site needs a body (below) |
| `GET` | `/peer-request/myactivity/mine` | you | your posts, any status |
| `GET` | `/peer-request/myactivity/claimed` | you | posts you claimed |
| `PATCH` | `/peer-request/myactivity/:id` | the asker, while `open` | edit `topic` and `description` |
| `DELETE` | `/peer-request/myactivity/:id` | the asker, while `open` | delete the post |
| `GET` | `/sessions/:id` | asker or helper | session hub info |
| `POST` | `/sessions/:id/completed` | the asker | mark the session done |
| `POST` | `/sessions/:id/leaveit` | asker or helper | undo the claim, the post goes back to `open` |
| `GET` | `/sessions/:id/messages` | asker or helper | **online only.** Saved messages |
| `POST` | `/sessions/:id/messages` | asker or helper | **online only.** Send a message (body below) |
| `POST` | `/sessions/:id/accept` | the asker | **in-site only.** Accept the helper's plan |
| `POST` | `/sessions/:id/on-the-way` | asker or helper | **in-site only.** Set your flag |
| `POST` | `/sessions/:id/arrived` | asker or helper | **in-site only.** Set your flag |

**Post status:**

```
online:   open --claim--> claimed --complete--> completed
in-site:  open --claim--> pending --accept--> claimed --complete--> completed
leaveit:  pending or claimed --leaveit--> open
```

**Bodies**

Create a post:

```json
{ "topic": "C pointers", "description": "need help", "mode": "online" }
```

Claim an in-site post (an online claim has no body):

```json
{ "specificSpot": "Library, 2nd floor", "meetTime": "14:00" }
```

Send a message:

```json
{ "text": "hello" }
```

---

## Try it

Use two tokens from jwt.io with a different `sub`: `TOKEN_A` (sub 42) is the asker, `TOKEN_B` (sub 43) is the helper.

```bash
TOKEN_A=paste-the-token-with-sub-42
TOKEN_B=paste-the-token-with-sub-43

# A creates a post (use the id from the answer below)
curl -X POST $API/peer-request -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"topic":"C pointers","description":"need help","mode":"online"}'

ID=1

# B claims it
curl -X POST $API/peer-request/$ID/claim -H "Authorization: Bearer $TOKEN_B"

# A completes it
curl -X POST $API/sessions/$ID/completed -H "Authorization: Bearer $TOKEN_A"
```

---

## Useful commands

```bash
docker compose ps                 # is the database running?
docker compose logs -f postgres   # database logs
docker compose down               # stop the database (the data stays)
npx prisma studio                 # look at the tables in the browser
npx prisma db push --force-reset  # DELETE everything and recreate the tables (dev only)
```

To delete the database files completely: `docker compose down`, then `sudo rm -rf ./pgdata`.

---

## Not done yet

- Real-time updates (WebSocket): the frontend reloads with the GET endpoints.
- Points, badges and the leaderboard.