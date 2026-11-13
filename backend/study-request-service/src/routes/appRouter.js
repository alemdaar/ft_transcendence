import express from 'express'
import {studyReq, claimRequest, CancelUnclaim, PostCompleted, sendMessage, acceptInsite, onTheWay, arrived} from '../controllers/CreateReq.js'
import {testServer, getAllRequests, viewPost, mine, Iclaimed, GetSessionId, getAllMsg} from '../controllers/GetRequest.js'
import { validateStudySchema, paramIdObj, editedPostSchema, SessionMsgObj} from '../validators/request.validator.js'
import { validate, validateParamId } from '../middleware/validateRequest.js'
import { authUser } from '../middleware/auth.js'
import { editPost } from '../controllers/PatchPost.js'
import { deltePost } from '../controllers/DeleteReq.js'
import { FetchTest } from '../controllers/FetchB1.js'

export const routeMe = express.Router()
// CHECK USER AUTH
routeMe.use(authUser)
//
// TEST SERVER
routeMe.get('/', testServer)
//

routeMe.post('/peer-request', validate(validateStudySchema), studyReq) // create a new post

routeMe.post('/peer-request/:id/claim', validateParamId(paramIdObj), claimRequest) // claim a post

routeMe.get('/peer-request', getAllRequests) // get all posts feed

routeMe.get('/peer-request/:id', validateParamId(paramIdObj), viewPost) // view post Card

routeMe.get('/peer-request/myactivity/mine', mine) // posts that i created

routeMe.get('/peer-request/myactivity/iclaimed', Iclaimed) // posts that i claimed

routeMe.patch('/peer-request/myactivity/:id', validateParamId(paramIdObj), validate(editedPostSchema), editPost) // edit a specific post

routeMe.delete('/peer-request/myactivity/:id', validateParamId(paramIdObj), deltePost) // delete a post

routeMe.get('/sessions/:id', validateParamId(paramIdObj), GetSessionId) // get info: studentPost + meetup  or studentPost (either pending or claimed)

routeMe.post('/sessions/:id/leaveit', validateParamId(paramIdObj), CancelUnclaim) // cancel claimed or pending post (insite or online)

routeMe.post('/session/:id/completed', validateParamId(paramIdObj), PostCompleted) // completed

routeMe.post('/sessions/:id/messages', validateParamId(paramIdObj), validate(SessionMsgObj), sendMessage) // send msg and create sessionMsg

routeMe.get('/sessions/:id/messages', validateParamId(paramIdObj), getAllMsg) // get old messages from a onlineSession

routeMe.post('/sessions/:id/accept', validateParamId(paramIdObj), acceptInsite)

routeMe.patch('/sessions/:id/on-the-way', validateParamId(paramIdObj), onTheWay)

routeMe.patch('/sessions/:id/arrived', validateParamId(paramIdObj), arrived)


routeMe.get('/api/users/me', FetchTest)