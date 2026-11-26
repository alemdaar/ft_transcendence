import  {prisma}  from "../instanceDb.js"

export const editPost = async (req, res) => {

    const {topic, description} = req.body;
    const {id} = req.params, {sub} = req.user
    try {
        const edited = await prisma.studentRequest.update({
            where: {
                id: id,
                asker_id: sub,
                status: 'open'
            },
            data: {
                topic: topic,
                description: description
            }
        })
        return res.status(200).json({succes: edited})
    } catch (error) {
        if (error.code === "P2025")
            return res.status(404).json({error: "NOT FOUND"})
        return res.status(500).json({error: "UKNOWN ERROR"})
    }
}
