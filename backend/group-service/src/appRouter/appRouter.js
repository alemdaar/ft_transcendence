import Router from 'express';
import {db} from '../db.js'
import { healthcheck } from '../controller/healthcheck.js'
import { createGroup, getGroups, getOneGroup, deleteGroup} from '../controller/controll_groups.js'
import { joinGeneralGroup, joinTeamGroup, approveTeamJoin } from '../controller/joinGroup.js'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/JWTauth.js'
import { GroupSchema } from '../ZODSchema/GroupSchema.js'

export const appRouter = Router()
appRouter.use(healthcheck)

appRouter.use(authenticate)
appRouter.post('/groups', validate(GroupSchema), createGroup)
appRouter.get('/groups', getGroups)
appRouter.get('/groups/:id', getOneGroup)
appRouter.delete('/groups/:id', deleteGroup)
appRouter.post('/groups/:id/join', joinGeneralGroup)
appRouter.post('/groups/:id/join-request', joinTeamGroup)
appRouter.patch('/groups/:id/join-request/:requestId', approveTeamJoin)

// appRouter.delete('/groups', async () => {
//   try {
//     // Send a raw SQL command directly to PostgreSQL
//     await db.$executeRawUnsafe('TRUNCATE TABLE "Group" RESTART IDENTITY CASCADE;');
    
//     console.log("All groups, members, messages, and requests have been wiped. IDs reset to 1.");
//   } catch (error) {
//     console.error("Error resetting tables:", error);
//   }
// })
