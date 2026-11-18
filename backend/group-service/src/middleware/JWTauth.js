import jwt from 'jsonwebtoken'

export const authenticate = (req, res, next)=>{
	const {authorization: authHeader} = req.headers
	if (!authHeader)
		return res.status(401).json({error : 'Authorization header missing'});

	const match = authHeader.match(/^Bearer +(\S+)$/)
	if (!match)
		return res.status(401).json({error : 'Invalid Authorization header'});
	
	const token = match[1]
	const secret = process.env.JWT_SECRET
	try {
		req.user = jwt.verify(token, secret)
		next()
	} catch (error){
		console.log(`{error: {name: ${error.name}, message: ${error.message}}}`)
		return res.status(401).json({error: "Invalid or expired token"});
	}
}

/*package.json
{
  "name": "group-service",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "postinstall": "prisma skills sync || exit 0",
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
  },
  "type": "module",
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@prisma/client": "^6.19.3",
    "dotenv": "^18.0.7",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "zod": "^4.6.5"
  },
  "devDependencies": {
    "prisma": "^6.12.0"
  }
}

docker-compose.yml
`services:
  postgres-b2:
    image: postgres:17
    container_name: groups_database
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
- "${POSTGRES_PORT}:5432"
    volumes:
- /home/sfartah/postgres/groups_data:/var/lib/postgresql/data
`

.env.example
# PostgreSQL Docker Configuration
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=groupsDB
POSTGRES_PORT=5432

# Prisma Database Connection
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"

# Authentication
JWT_SECRET="your_shared_jwt_secret"

prisma/schema.prisma
generator client {
	provider = "prisma-client-js"
}

datasource db {
	provider = "postgresql"
	url      = env("DATABASE_URL")
}

// --- ENUMS ---
enum GroupType {
	general
	team
}

enum MemberRole {
	OWNER
	ADMIN
	MEMBER
}

enum RequestStatus {
	PENDING
	ACCEPTED
	REJECTED
}

enum CampusName {
	Rabat
	Tetouan
	Benguerir
	Khouribga
}


// --- MODELS ---

model Group {
	id          Int    @id @default(autoincrement())
	name        String    @db.VarChar
	type        GroupType
	description String?   @db.VarChar
	campus      CampusName
	memberLimit Int?      @db.SmallInt
	ownerID     Int
	createdAt   DateTime  @default(now()) @db.Timestamptz
	
	
	// Relations to other tables
	members     member[]
	joinTeams   join_team[]
	messages    message[]
	resources   resources[]
}

model member {
	id        Int     @id @default(autoincrement())
	groupID   Int
	userID    Int
	role      MemberRole
	joinedAt  DateTime   @default(now()) @db.Timestamptz

	group     Group      @relation(fields: [groupID], references: [id], onDelete: Cascade)
}

model join_team {
	id          Int        @id @default(autoincrement())
	groupID     Int
	userID      Int
	status      RequestStatus
	requestedAt DateTime      @default(now()) @db.Timestamptz

	group       Group         @relation(fields: [groupID], references: [id], onDelete: Cascade)
}

model message {
	id        Int   @id @default(autoincrement())
	groupID   Int
	senderID  Int
	content   String   @db.VarChar
	createdAt DateTime @default(now()) @db.Timestamptz

	group     Group    @relation(fields: [groupID], references: [id], onDelete: Cascade)
}

model resources {
	id          Int   @id @default(autoincrement())
	groupID     Int
	addedBy     Int
	title       String   @db.VarChar
	description String?  @db.VarChar
	content     String   @db.Text
	createdAt   DateTime @default(now()) @db.Timestamptz

	group       Group    @relation(fields: [groupID], references: [id], onDelete: Cascade)
}

appRouter.js
appRouter.use(healthcheck)

appRouter.use(authenticate)

appRouter.post('/groups', validate(GroupSchema), createGroup)
appRouter.get('/groups', validate(pageQuerySchema, 'query'), getGroups)
appRouter.get('/groups/:id', validate(idParamSchema, 'params'), getOneGroup)
appRouter.delete('/groups/:id', validate(idParamSchema, 'params'), deleteGroup)

appRouter.post('/groups/:id/join', validate(idParamSchema, 'params'), joinGeneralGroup)
appRouter.post('/groups/:id/join-request', validate(idParamSchema, 'params'), joinTeamGroup)

appRouter.get('/groups/:id/members', validate(idParamSchema, 'params'), getGroupMembers)
appRouter.get('/groups/:id/join-request', validate(idParamSchema, 'params'), getPendingRequest)

appRouter.patch('/groups/:id/join-request/:requestId/approve', validate(idParamSchema, 'params'), validate(reqIdSchema, 'params'), approveTeamJoin)
appRouter.patch('/groups/:id/join-request/:requestId/reject', validate(idParamSchema, 'params'), validate(reqIdSchema, 'params'), rejectTeamJoin)

export const authenticate = (req, res, next)=>{
	const {authorization: authHeader} = req.headers
	if (!authHeader)
		return res.status(401).json({error : 'Authorization header missing'});

	const match = authHeader.match(/^Bearer +(\S+)$/)
	if (!match)
		return res.status(401).json({error : 'Invalid Authorization header'});
	
	const token = match[1]
	const secret = process.env.JWT_SECRET
	try {
		req.user = jwt.verify(token, secret)
		next()
	} catch (error){
		console.log(`{error: {name: ${error.name}, message: ${error.message}}}`)
		return res.status(401).json({error: "Invalid or expired token"});
	}
}
*/