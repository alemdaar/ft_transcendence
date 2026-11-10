import  {prisma}  from "../instanceDb.js"

export const testServer = (req, res) => {
    console.log('Hi from study server')
    res.status(200).json('Hi from study server')
}

export const getAllRequests = async (req, res) => {
// can throw errors if the database is unavailable or the query fails.
  try {
    const allPost = await prisma.studentRequest.findMany({
      where : {status: 'open', asker_id: {not: req.user.id}},
      select: {id: true, topic: true, description: true, mode: true, campus: true, status: true}
    });

    if (!allPost.length)
      return res.status(200).json({message: "No Posts Created Yet"});
    return res.status(200).json({allPost});
  } catch (err) {
    res.status(500).json({ Error: 'UNKOWN_ERROR'})
  }
}

export const viewPost = async (req, res) => {
  // can throw errors if the database is unavailable or the query fails.
  try {
    const oneRequest = await prisma.studentRequest.findUnique({
      where: {id: req.params.id}
    })
    if (!oneRequest)
      return res.status(404).json({Error: 'NOT_FOUND'})
    res.status(200).json({oneRequest})
  } catch(err) {
    res.status(500).json({ Error: 'UNKOWN_ERROR'})
  }
}
// posts that i created
export const mine = async (req, res) => {
  try {
    const minePosts = await prisma.studentRequest.findMany({
      where: {
        asker_id: req.user.id
      }
    })
    if (!minePosts.length)
        return res.status(200).json({Error: 'No requests Posted From You!'})
    return res.status(200).json({minePosts})
  } catch (error) {
    return res.status(500).json({Error: "UNKOWN_ERROR"})
  }
}

export const Iclaimed = async (req, res) => {
  try {
    const claimed = await prisma.studentRequest.findMany({
      where: {
        helper_id: req.user.id,
        status: 'claimed'
      }
    })
    if (!claimed.length)
        return res.status(200).json({Error: 'No Post are Claimed From You!'})
    return res.status(200).json({claimed})
  } catch (error) {
    return res.status(500).json({Error: "UNKOWN_ERROR"})
  }
}

export const GetSessionId = async (req, res) => {
  try {
    const studyInfo = await prisma.studentRequest.findUnique({
      where: {
        id: req.params.id,
        // asker_id: req.user.id, // both should acces to the data !!?
        status: {
          in: ['pending', 'claimed']
        }
      },
      include: {
        meetup: true
      }
    })
    if (!studyInfo || (!studyInfo.meetup && studyInfo.mode === 'insite'))
      return res.status(404).json({Error: "NOT_FOUND"})
    if (studyInfo.asker_id !== req.user.id || studyInfo.helper_id !== req.user.id)
			return res.status(403).json({Error: 'CANNOT_ACCES'})
    return res.status(200).json({studyInfo})
  } catch (err) {
    return res.status(500).json({Error: "UNKOWN_ERROR"})
  }
}

export const getAllMsg = async (req, res) => {
  try {
    const msgPost = await prisma.studentRequest.findUnique({
      where: {
        id: req.params.id
      }
    })
    if (!msgPost)
      return res.status(404).json({Error: "NOT_FOUND"})
    if (msgPost.asker_id !== req.user.id && msgPost.helper_id !== req.user.id)
        return res.status(403).json({Error: 'CANNOT_ACCES'})
    if (msgPost.status !== 'claimed' || msgPost.mode !== 'online')
			return res.status(409).json({Error: 'ACTION_FAILED'})

    const getMsgs = await prisma.sessionMessage.findMany({
      where: {
        request_id: req.params.id
      }
  })
  return res.status(200).json({getMsgs})
  } catch (error) {
    console.log(error)
    return res.status(500).json({Error: "UNKOWN_ERROR"})
  }
}