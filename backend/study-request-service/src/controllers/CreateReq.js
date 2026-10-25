import  {prisma}  from "../instanceDb.js"
import { SessionMeetup } from "../validators/request.validator.js";
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

	  console.log('Request Created:', newRequest);
	  res.status(201).json({message: 'post created', post: newRequest});
	} catch(err) {
	  // console.log('database crashed')
	  res.status(500).json({ message: 'Unknown error' })
	}
  }

export const claimRequest = async (req, res) => {
  
try {
	// if (!(/^[1-9]\d*$/.test(req.params.id)) || Number(req.params.id) > 2147483647)
	// 	throw new Error('Invalid Id')
	const updatedResult = await prisma.$transaction(async (tx) => {

		const targetReq = await tx.studentRequest.findUnique({
			where: { id: Number(req.params.id)}
		})
		if (!targetReq || targetReq.status !== 'open')
			throw new Error('POST NOT_FOUND OR ALREADY CLAIMED')
		if (targetReq.asker_id === req.user.id)
			throw new Error('CANNOT_CLAIM_OWN')

		const claimedReq = await tx.studentRequest.update({
			where: { id: Number(req.params.id)},
			data: {status: targetReq.mode === 'online' ? 'claimed' : 'pending', 
			helper_id: req.user.id}
		})
		// FOR INSITE
		if (claimedReq.mode === 'insite'){
			const result = SessionMeetup.safeParse(req.body)
			if (!result.success)
				throw new Error('specific spot and meetTime required for insite claims')
			const { specificSpot, meetTime } = result.data;

			const meetup = await tx.sessionMeetup.create({
				data: {
				request_id: Number(req.params.id),
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
	console.log('CLAIMED', updatedResult)
	return res.status(200).json({message: 'request claimed', updatedResult})
} catch (err) {
	console.log('Error', err.message)
   	res.status(400).json({error: err.message})
}

}










	// const meetup = await prisma.sessionMeetup.create({
	//   data: {
	//     request_id: newRequest.id,
	//     plan_spot: 'Library 2nd Floor',
	//     asker_on_way: false,
	//     asker_arrived: false,
	//     helper_on_way: false,
	//     helper_arrived: false,
	//     created_at: new Date(),
	//   },
	// });
	// console.log('message Created:', meetup);
	// const message = await prisma.sessionMessage.create({
	//   data: {
	//     request_id: newRequest.id,
	//     sender_id: 101,
	//     text: 'I am sitting near the window!',
	//     created_at: new Date(),
	//   },
	// });
	// console.log('message Created:', message);