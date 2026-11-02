import  {prisma}  from "../instanceDb.js"
import { SessionMeetup } from "../validators/request.validator.js";
// import { CustomError } from "../errors/AppError.js";

export const studyReq = async (req, res) => {

  try {
	
	const {topic, description, mode} = req.body;
	const newRequest = await prisma.studentRequest.create({
		data: {
		  asker_id: req.user.id,
		  topic: topic,
		  description: description,
		  mode: mode,
		  campus: req.user.campus,
		  created_at: new Date(),
		  updated_at: new Date()
		}
	  });

	res.status(201).json({newRequest});
	} catch(err) {
	  res.status(500).json({Error: 'UNKOWN_ERROR' })
	}
  }

export const claimRequest = async (req, res) => {
  
	try {
		const targetReq = await prisma.studentRequest.findUnique({
			where: { id: req.params.id}
		})
		if (!targetReq)
			return res.status(404).json({Error: 'NOT_FOUND'})
		if (targetReq.status !== 'open')
			return res.status(409).json({Error: 'ALREADY_CLAIMED'})
		if (targetReq.asker_id === req.user.id)
			return res.status(403).json({Error: 'CANNOT_CLAIM_OWN'})

	const updatedResult = await prisma.$transaction(async (tx) => {

	const claimedReq = await tx.targetReq.update({
		where: { id: req.params.id},
		data: {status: targetReq.mode === 'online' ? 'claimed' : 'pending'}
	})
	// FOR INSITE
	if (claimedReq.mode === 'insite'){
		const result = SessionMeetup.safeParse(req.body)
		if (!result.success)
			throw new Error('INVALID_INPUT')
		const { specificSpot, meetTime } = result.data;
		const meetup = await tx.sessionMeetup.create({
			data: {
			request_id: req.params.id,
			specificSpot: specificSpot,
			meetTime: new Date(`1970-01-01T${meetTime}:00Z`),
			created_at: new Date()
			}
		})
		return {claimedReq, meetup};
	}
	// For online
	return claimedReq
})
	return res.status(200).json({updatedResult})
} catch (err) {
	
	if (err.code === "P2025")
        return res.status(404).json({error: "NOT_FOUND"})
	if (err.message === 'INVALID_INPUT')
		return res.status(400).json({err: 'specific spot and meetTime required for insite claims'})
   	return res.status(500).json({error: 'UKNOWN_ERROR'})
}

}

export const CancelUnclaim = async (req, res) => {

	try {
		const findPost = await prisma.studentRequest.findUnique({
			where: {
				id: req.params.id
			}
		})
		if (!findPost)
			return res.status(404).json({Error: 'NOT_FOUND'})
		if (!['pending', 'claimed'].includes(findPost.status))
			return res.status(409).json({Error: 'NOT_CLAIMED'})
		if (findPost.asker_id !== req.user.id && findPost.helper_id !== req.user.id)
			return res.status(403).json({Error: 'CANNOT_ACCES'})
		if (findPost.status === 'pending' && findPost.helper_id === req.user.id)
			return res.status(403).json({Error: 'CANNOT_CANCEL'})
		const updateRes = await prisma.$transaction(async (tx) => {
			const uptPost = await tx.studentRequest.update({
				where: {
					id: req.params.id,
				},
				data: {
					status: 'open',
					helper_id: null,
				}
			});
			await tx.sessionMeetup.deleteMany({
				where: {
					request_id: req.params.id
				}
			})
			return uptPost
		})
		return res.status(200).json({updateRes})
	} catch (error) {
		if (error.code === "P2025")
        	return res.status(404).json({error: "NOT_FOUND"})
		return res.status(500).json({error: 'UKNOWN_ERROR'})
	}
}