import Router from 'express';
import {db} from '../db.js'
import { healthcheck } from '../controller/healthcheck.js'
import { createGroup } from '../controller/createGroup.js'
import { getGroups } from '../controller/getGroups.js'
import {getOneGroup} from '../controller/getOneGroup.js'
import {deleteGroup} from '../controller/deleteGroup.js'
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

// appRouter.delete('/groups', async () => {
//   try {
//     // Send a raw SQL command directly to PostgreSQL
//     await db.$executeRawUnsafe('TRUNCATE TABLE "Group" RESTART IDENTITY CASCADE;');
    
//     console.log("All groups, members, messages, and requests have been wiped. IDs reset to 1.");
//   } catch (error) {
//     console.error("Error resetting tables:", error);
//   }
// })
