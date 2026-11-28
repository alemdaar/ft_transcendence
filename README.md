# Frontend Quick Start

Run from the project root (Node.js 22.12+ required):

```powershell
cd frontend/src
npm install
```

For normal login, start the backend services, disable mock/test-token flags in your frontend environment files, then run:

```powershell
npm run dev
```

## Test Study Requests with a token

Start the Study Requests backend on port `3000`. In `frontend/src/.env.localdev`, set:

```dotenv
VITE_STUDY_TEST_TOKEN=true
VITE_STUDY_MOCK=false
```

From `backend/study-request-service` (with dependencies installed and `JWT_SECRET` configured in `.env`), generate a token:

```powershell
node --input-type=module -e "import 'dotenv/config'; import jwt from 'jsonwebtoken'; console.log(jwt.sign({id:42,sub:'42',campus:'Rabat'},process.env.JWT_SECRET,{issuer:'user-service',audience:'ft-transcendence-services',expiresIn:'1h'}));"
```

From `frontend/src`, run:

```powershell
npm run dev:localdev
```

Open the URL printed by Vite, go to **Study Requests**, paste the generated token into **Access token**, and click **Use token**. Use **Remove token** to clear it. Tokens expire after one hour and do not create a real account.

To test Claim as another user, generate a second token with `id:43,sub:'43'`. You cannot claim your own request.

For offline mock data, set `VITE_STUDY_MOCK=true` and restart Vite. Token-test files are in `frontend/src/mocks/study-token/`.

**Known backend issue:** opening a session may return `500` because B3 calls `/users/batch`, which is missing in the current user service. This needs a backend fix.

Stop the frontend with `Ctrl+C`.
