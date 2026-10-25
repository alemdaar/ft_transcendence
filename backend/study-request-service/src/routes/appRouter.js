import express from 'express'
import {studyReq, claimRequest} from '../controllers/CreateReq.js'
import {testServer, getAllRequests, RequestId } from '../controllers/GetRequest.js'
import { validateStudySchema, paramIdObj} from '../validators/request.validator.js'
import { validate, validateParamId } from '../middleware/validateRequest.js'
import { authUser } from '../middleware/auth.js'

export const routeMe = express.Router()
// CHECK USER AUTH
routeMe.use(authUser)
//
// TEST SERVER
//

routeMe.post('/request-peer', validate(validateStudySchema), studyReq)

routeMe.post('/request-peer/:id/claim', validateParamId(paramIdObj), claimRequest)


routeMe.get('/', testServer)

routeMe.get('/request-peer', getAllRequests)

routeMe.get('/request-peer/:id', validateParamId(paramIdObj), RequestId)
