import Router from 'express';
import {db} from '../db.js'
import { healthcheck } from '../controller/healthcheck.js'
import { createGroup, getGroups, getOneGroup, deleteGroup} from '../controller/controll_groups.js'
import { joinGeneralGroup, joinTeamGroup, approveTeamJoin } from '../controller/joinGroup.js'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/JWTauth.js'
import { GroupSchema, idParamSchema, pageQuerySchema, reqIdSchema } from '../ZODSchema/GroupSchema.js'

export const appRouter = Router()

appRouter.use(healthcheck)

appRouter.use(authenticate)

appRouter.post('/groups', validate(GroupSchema), createGroup)

appRouter.get('/groups', validate(pageQuerySchema, 'query'), getGroups)

appRouter.get('/groups/:id', validate(idParamSchema, 'params'), getOneGroup)

appRouter.delete('/groups/:id', validate(idParamSchema, 'params'), deleteGroup)

appRouter.post('/groups/:id/join', validate(idParamSchema, 'params'), joinGeneralGroup)

appRouter.post('/groups/:id/join-request', validate(idParamSchema, 'params'), joinTeamGroup)

appRouter.patch('/groups/:id/join-request/:requestId', validate(idParamSchema, 'params'), validate(reqIdSchema, 'params'), approveTeamJoin)

// appRouter.delete('/groups', async () => {
//   try {
//     // Send a raw SQL command directly to PostgreSQL
//     await db.$executeRawUnsafe('TRUNCATE TABLE "Group" RESTART IDENTITY CASCADE;');
    
//     console.log("All groups, members, messages, and requests have been wiped. IDs reset to 1.");
//   } catch (error) {
//     console.error("Error resetting tables:", error);
//   }
// })
