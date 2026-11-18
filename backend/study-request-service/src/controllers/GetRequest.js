import  {prisma}  from "../instanceDb.js"
import { fetchedData } from "./FetchB1.js";
import { IfindPost } from "./FindPost.js";

export const testServer = async (req, res) => {
    console.log('Hi from study server')
    // const fetchedDt = await fetchedData(req, res)
    res.status(200).json({succes: 'Hi from study server'})
}

export const getAllRequests = async (req, res) => {
// can throw errors if the database is unavailable or the query fails.
const {sub} = req.user
  try {
    const allPost = await prisma.studentRequest.findMany({
      where : {status: 'open', asker_id: {not: sub}},
      select: {id: true, topic: true, description: true, mode: true, campus: true, status: true}
    });

    if (!allPost.length)
      return res.status(200).json({message: "No Posts Created Yet"});
    return res.status(200).json({succes: allPost});
  } catch (err) {
    res.status(500).json({ error: 'UNKOWN_ERROR'})
  }
}

export const viewPost = async (req, res) => {
  // can throw errors if the database is unavailable or the query fails.
  const {id} = req.params
  try {
    const oneRequest = await IfindPost(id)
    if (!oneRequest)
      return res.status(404).json({error: 'NOT_FOUND'})
    res.status(200).json({succes: oneRequest})
  } catch(err) {
    res.status(500).json({ Error: 'UNKOWN_ERROR'})
  }
}
// posts that i created
export const mine = async (req, res) => {
  const {sub} = req.user
  try {
    const minePosts = await prisma.studentRequest.findMany({
      where: {
        asker_id: sub
      }
    })
    if (!minePosts.length)
        return res.status(200).json({error: 'No requests Posted From You!'})
    return res.status(200).json({succes: minePosts})
  } catch (error) {
    return res.status(500).json({error: "UNKOWN_ERROR"})
  }
}

export const Iclaimed = async (req, res) => {
  const {sub} = req.user
  try {
    const claimed = await prisma.studentRequest.findMany({
      where: {
        helper_id: sub,
        status: 'claimed'
      }
    })
    if (!claimed.length)
        return res.status(200).json({error: 'No Post are Claimed From You!'})
    return res.status(200).json({succes: claimed})
  } catch (error) {
    return res.status(500).json({error: "UNKOWN_ERROR"})
  }
}

export const GetSessionId = async (req, res) => {
  const {id} = req.params, {sub} = req.user
  try {
    const studyInfo = await prisma.studentRequest.findUnique({
      where: {
        id: id,
        // asker_id: sub, // both should acces to the data !!?
        status: {
          in: ['pending', 'claimed']
        }
      },
      include: {
        meetup: true
      }
    })
    if (!studyInfo || (!studyInfo.meetup && studyInfo.mode === 'insite'))
      return res.status(404).json({error: "NOT_FOUND"})
    if (studyInfo.asker_id !== sub && studyInfo.helper_id !== sub)
			return res.status(403).json({error: 'CANNOT_ACCES'})
    // maybe fetching here too
    const {asker_id, helper_id} = studyInfo
	  const fetchedDt = await fetchedData(req, asker_id, helper_id)

    return res.status(200).json({succes: studyInfo, ...fetchedDt})
  } catch (err) {
    console.log(err)
    return res.status(500).json({error: "UNKOWN_ERROR"})
  }
}

export const getAllMsg = async (req, res) => {

  const {id} = req.params, {sub} = req.user
  try {
    const msgPost = await IfindPost(id)
    if (!msgPost)
      return res.status(404).json({error: "NOT_FOUND"})
    if (msgPost.asker_id !== sub && msgPost.helper_id !== sub)
        return res.status(403).json({error: 'CANNOT_ACCES'})
    if (msgPost.status !== 'claimed' || msgPost.mode !== 'online')
			return res.status(409).json({error: 'ACTION_FAILED'})

    const getMsgs = await prisma.sessionMessage.findMany({
      where: {
        request_id: id
      }
  })

  return res.status(200).json({succes: getMsgs})
  } catch (error) {
    console.log(error)
    return res.status(500).json({error: "UNKOWN_ERROR"})
  }
}