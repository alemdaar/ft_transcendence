import  {prisma}  from "../instanceDb.js"

export const testServer = (req, res) => {
    console.log('Hi from study req')
    res.status(200).json('Hi from study req')
}

export const getAllRequests = async (req, res) => {
// can throw errors if the database is unavailable or the query fails.
  try {
    const allPost = await prisma.studentRequest.findMany({
      where : {status: 'open', asker_id: {not: req.user.id}},
      select: {id: true, topic: true, description: true, mode: true, campus: true, status: true}
    });
    console.log(allPost)
    res.status(200).json({allPost});

  } catch (err) {
    console.log('error fetching requests posts: ', err);
    res.status(500).json({ error: 'Failed to retrieve requests posts'})
  }
}

export const RequestId = async (req, res) => {
  // can throw errors if the database is unavailable or the query fails.
  try {
    // if (!(/^[1-9]\d*$/.test(req.params.id)) || Number(req.params.id) > 2147483647)
		//   return  res.status(404).json({error: 'Invalid Id'})
    const oneRequest = await prisma.studentRequest.findUnique({
      where: {id: Number(req.params.id), asker_id: {not: req.user.id}, status: 'open'}
    })
    if (!oneRequest)
      return res.status(404).json({error: 'post not found or not allowed'})
    res.status(200).json({oneRequest})
    console.log('getting the detailed post', oneRequest)
  } catch(err) {
    console.log('error fetching the post: ', err.message);
    res.status(500).json({ error: 'Failed to retrieve the post'})
  }
}
