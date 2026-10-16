import  {prisma}  from "../instanceDb.js"

export const studyReq = async (req, res) => {

  try {

    const {topic, description, mode, status, campus} = req.body;
    const newRequest = await prisma.studentRequest.create({
        data: {
          asker_id: req.user.id,
          topic: topic,
          description: description,
          mode: mode,
          status: status,
          campus: campus,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      console.log('Request Created:', newRequest);
      res.status(201).json({message: 'created'});
    } catch(err) {
      // console.log('database crashed')
      res.status(500).json({ message: 'Unknown error' })
    }
  }

// export const claimRequest = async (req, res) => {
//   try {

//   }   
// }









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