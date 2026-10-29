import express from 'express'
import {studyReq, claimRequest} from '../controllers/CreateReq.js'
import {testServer, getAllRequests, viewPost, mine, Iclaimed} from '../controllers/GetRequest.js'
import { validateStudySchema, paramIdObj, editedPostSchema} from '../validators/request.validator.js'
import { validate, validateParamId } from '../middleware/validateRequest.js'
import { authUser } from '../middleware/auth.js'
import { editPost } from '../controllers/PatchPost.js'

export const routeMe = express.Router()
// CHECK USER AUTH
routeMe.use(authUser)
//
// TEST SERVER
//

routeMe.post('/request-peer', validate(validateStudySchema), studyReq) // create a new post

routeMe.post('/request-peer/:id/claim', validateParamId(paramIdObj), claimRequest) // claim a post

routeMe.get('/', testServer)

routeMe.get('/request-peer', getAllRequests) // get all posts feed

routeMe.get('/request-peer/:id', validateParamId(paramIdObj), viewPost) // view post Card

routeMe.get('/request-peer/myactivity/mine', mine) // posts that i created

routeMe.get('/request-peer/myactivity/iclaimed', Iclaimed) // posts that i claimed

routeMe.patch('/request-peer/myactivity/:id', validateParamId(paramIdObj), validate(editedPostSchema), editPost) // edit a specific post

routeMe.delete('/request-peer/myactivity/:id')