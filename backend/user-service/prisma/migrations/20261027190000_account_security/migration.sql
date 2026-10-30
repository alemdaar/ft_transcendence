ALTER TABLE "User" ADD COLUMN "authVersion" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PendingRegistration" ADD COLUMN "codeSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "PasswordReset" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
    "tokenHash" TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AuthRateLimit" (
    "key" TEXT PRIMARY KEY,
    "attempts" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "AuthRateLimit_expiresAt_idx" ON "AuthRateLimit"("expiresAt");

CREATE TABLE IF NOT EXISTS "user_sessions" (
    "sid" VARCHAR PRIMARY KEY,
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS "user_sessions_expire_idx" ON "user_sessions"("expire");
