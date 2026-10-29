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
      res.status(200).json({message: "No Posts Created Yet"});
    res.status(200).json({allPost});
  } catch (err) {
    res.status(500).json({ error: 'UNKOWN_ERROR'})
  }
}

export const viewPost = async (req, res) => {
  // can throw errors if the database is unavailable or the query fails.
  try {
    const oneRequest = await prisma.studentRequest.findUnique({
      where: {id: req.params.id, status: 'open'}
    })
    if (!oneRequest)
      return res.status(404).json({error: 'NOT_FOUND'})
    res.status(200).json({oneRequest})
  } catch(err) {
    res.status(500).json({ error: 'UNKOWN_ERROR'})
  }
}
// posts that i created
export const mine = async (req, res) => {
  try {
    const minePosts = await prisma.studentRequest.findMany({
      where: {
        asker_id: req.user.id,
        status: {
          not: 'cancelled'
        }
      }
    })
    if (!minePosts.length)
        return res.status(200).json({message: 'No requests Posted From You!'})
    return res.status(200).json({minePosts})
  } catch (error) {
    return res.status(500).json({error: "UNKOWN_ERROR"})
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
        return res.status(200).json({message: 'No Post are Claimed From You!'})
    return res.status(200).json({claimed})
  } catch (error) {
    return res.status(500).json({message: "UNKOWN_ERROR"})
  }
}