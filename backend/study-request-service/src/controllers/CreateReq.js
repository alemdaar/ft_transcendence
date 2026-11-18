import  {prisma}  from "../instanceDb.js"
import { SessionMeetup } from "../validators/request.validator.js";
// import { fetchedData } from "./FetchB1.js";
import { IfindPost } from "./FindPost.js";
// import { IfindPost } from "./FindPost.js";
// import { CustomError } from "../errors/AppError.js";

export const studyReq = async (req, res) => {
	const {sub} = req.user
  try {
	
	const {topic, description, mode} = req.body;
	const newRequest = await prisma.studentRequest.create({
		data: {
		  asker_id: sub,
		  topic: topic,
		  description: description,
		  mode: mode,
		  campus: req.user.campus,
		  created_at: new Date(),
		  updated_at: new Date()
		}
	  });

	return res.status(201).json({succes: newRequest});
	} catch(err) {
		console.log(err)
		return res.status(500).json({error: 'UNKOWN_ERROR' })
	}
  }

export const claimRequest = async (req, res) => {
  const {id} = req.params, {sub} = req.user
	try {
		const targetReq = await IfindPost(id)
		if (!targetReq)
			return res.status(404).json({error: 'NOT_FOUND'})
		if (targetReq.status !== 'open')
			return res.status(409).json({error: 'ALREADY_CLAIMED'})
		if (targetReq.asker_id === sub)
			return res.status(403).json({error: 'CANNOT_CLAIM_OWN'})

	const updatedResult = await prisma.$transaction(async (tx) => {

	const claimedReq = await tx.studentRequest.update({
		where: { id: id},
		data: {
			status: targetReq.mode === 'online' ? 'claimed' : 'pending',
			helper_id: sub
		}
	})
	// FOR INSITE
	if (claimedReq.mode === 'insite'){
		const result = SessionMeetup.safeParse(req.body)
		if (!result.success)
			throw new Error('INVALID_INPUT')
		const { specificSpot, meetTime } = result.data;
		const meetup = await tx.sessionMeetup.create({
			data: {
			request_id: id,
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
	// FETCH B1 for name and avatar
	// const {asker_id, helper_id} = updatedResult.claimedReq
	// const fetchedDt = await fetchedData(asker_id, helper_id)
	
	// return res.status(200).json({succes: updatedResult, fetchedDt})
	return res.status(200).json({succes: "post are claimed succesfuly"})

} catch (err) {
	console.log(err)
	if (err.code === "P2025")
        return res.status(404).json({error: "NOT_FOUND"})
	if (err.message === 'INVALID_INPUT')
		return res.status(400).json({error: 'specific spot and meetTime required for insite claims'})
   	return res.status(500).json({error: 'UKNOWN_ERROR'})
}

}

export const CancelUnclaim = async (req, res) => {
	const {id} = req.params, {sub} = req.user
	try {
		const findPost = await IfindPost(id)
		if (!findPost)	
			return res.status(404).json({error: 'NOT_FOUND'})
		if (!['pending', 'claimed'].includes(findPost.status))
			return res.status(409).json({error: 'NOT_CLAIMED'})
		if (findPost.asker_id !== sub && findPost.helper_id !== sub)
			return res.status(403).json({error: 'CANNOT_ACCES'})
		if (findPost.status === 'pending' && findPost.helper_id === sub)
			return res.status(403).json({error: 'CANNOT_CANCEL'})
		const updateRes = await prisma.$transaction(async (tx) => {
			const uptPost = await tx.studentRequest.update({
				where: {
					id: id,
					OR: [
						{status: 'pending'},
						{helper_id: sub},
						{asker_id: sub}
					]
				},
				data: {
					status: 'open',
					helper_id: null,
				}
			});
			await tx.sessionMeetup.deleteMany({
				where: {
					request_id: id
				}
			})
			return uptPost
		})
		return res.status(200).json({succes: updateRes})
	} catch (error) {
		console.log(error)
		if (error.code === "P2025")
        	return res.status(404).json({error: "NOT_FOUND"})
		return res.status(500).json({error: 'UKNOWN_ERROR'})
	}
}

export const PostCompleted = async (req, res) => {
	const {id} = req.params, {sub} = req.user
	try {
		const claimedPost = await IfindPost(id)
		if (!claimedPost)
			return res.status(404).json({error: 'NOT_FOUND'})
		if (claimedPost.status !== 'claimed')
			return res.status(409).json({error: 'NOT_CLAIMED'})
		if (claimedPost.asker_id !== sub)
			return res.status(403).json({error: 'CANNOT_ACCES'})
		
		await prisma.studentRequest.update({
			where: {
				id: id
			},
			data:{
				status: 'completed'
			}
		})
		return res.status(200).json({succes: claimedPost})
	} catch (error) {
		if (error.code === "P2025")
        	return res.status(404).json({error: "NOT_FOUND"})
		return res.status(500).json({error: 'UKNOWN_ERROR'})
	}
}

export const sendMessage = async (req, res) => {
	const {id} = req.params, {sub} = req.user
	try {
		const targetPost = await IfindPost(id)
		if (!targetPost)
			return res.status(404).json({error: 'NOT_FOUND'})
		if (targetPost.status !== 'claimed' || targetPost.mode !== 'online')
			return res.status(409).json({error: 'ACTION_FAILED'})
		if (targetPost.asker_id !== sub && targetPost.helper_id !== sub)
			return res.status(403).json({error: 'CANNOT_ACCES'})
		
		const {msg} = req.body;

		const createMsgTable = await prisma.sessionMessage.create({
			data:{
				request_id: id,
				sender_id: sub,
				text: msg,
				created_at: new Date()
			}
		})
		return res.status(200).json({succes: createMsgTable})
		} catch (error) {
			if (error.code === "P2025")
        		return res.status(404).json({error: "NOT_FOUND"})
			console.log(error)
			return res.status(500).json({error: 'UKNOWN_ERROR'})
	}
}

export const acceptInsite = async (req, res) => {
	const {id} = req.params, {sub} = req.user
	try {
		const findPost = await prisma.studentRequest.findUnique({
			where: {
				id: id
			},
			include: {
				meetup: true
			}
		})
		if (!findPost || !findPost.meetup)
			return res.status(404).json({error: 'NOT_FOUND'})
		if (findPost.status !== 'pending' || findPost.mode !== 'insite')
			return res.status(409).json({error: 'ACTION_FAILED'})
		if (findPost.asker_id !== sub)
			return res.status(403).json({error: 'CANNOT_ACCES'})

		const uptPost = await prisma.studentRequest.update({
			where: {
				id: id,
			},
			data: {
				status: 'claimed'
			}
		})
		return res.status(200).json({succes: uptPost})
	} catch (error) {
		if (error.code === "P2025")
        	return res.status(404).json({error: "NOT_FOUND"})
		return res.status(500).json({error: 'UKNOWN_ERROR'})
	}
}

export const onTheWay = async (req, res) => {
	const {id} = req.params, {sub} = req.user
	/*maybe create an object that contain the status: true or false, and status value*/
	try {
		const findPost = await IfindPost(id)
		if (!findPost)
            res.status(404).json({error: "NOT_FOUND"})
		if (findPost.asker_id !== sub && findPost.helper_id !== sub)
			return res.status(403).json({error: 'CANNOT_ACCES'})
		if (findPost.status !== 'claimed' || findPost.mode !== 'insite')
			return res.status(409).json({error: 'ACTION_FAILED'})
		const whichUser = findPost.helper_id === sub ? {helper_on_way: true} : {asker_on_way: true}
		const uptMeetup = await prisma.sessionMeetup.update({
			where: {
				request_id: id
			},
			data: whichUser
		})
		return res.status(200).json({succes: uptMeetup})
	} catch (error) {
		console.log(error)
		if (error.code === "P2025")
        	return res.status(404).json({error: "NOT_FOUND"})
		return res.status(500).json({error: 'UKNOWN_ERROR'})
	}
}

export const arrived = async (req, res) => {
	const {id} = req.params, {sub} = req.user
	/*maybe create an object that contain the status: true or false, and status value*/
	try {
		const findPost = await prisma.studentRequest.findUnique({
			where: {
				id: id
			},
			include: {
				meetup: true
			}
		})
		if (!findPost)
            res.status(404).json({error: "NOT_FOUND"})
		if (findPost.asker_id !== sub && findPost.helper_id !== sub 
			|| (sub === findPost.asker_id && !findPost.meetup.asker_on_way) 
			|| (sub === findPost.helper_id && !findPost.meetup.helper_on_way))
			return res.status(403).json({error: 'CANNOT_ACCES'})
		if (findPost.status !== 'claimed' || findPost.mode !== 'insite')
			return res.status(409).json({error: 'ACTION_FAILED'})
		const whichUser = findPost.helper_id === sub ? {helper_arrived: true} : {asker_arrived: true}
		const uptMeetup = await prisma.sessionMeetup.update({
			where: {
				request_id: id
			},
			data: whichUser
		})
		return res.status(200).json({succes: uptMeetup})
	} catch (error) {
		console.log(error)
		if (error.code === "P2025")
        	return res.status(404).json({error: "NOT_FOUND"})
		return res.status(500).json({error: 'UKNOWN_ERROR'})
	}
}
