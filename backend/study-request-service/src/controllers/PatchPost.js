import  {prisma}  from "../instanceDb.js"

export const editPost = async (req, res) => {

    const {topic, description} = req.body;
    try {
        const edited = await prisma.studentRequest.update({
            where: {
                id: req.params.id,
                asker_id: req.user.id,
                status: 'open'
            },
            data: {
                topic: topic,
                description: description
            }
        })
        return res.status(200).json({edited})
    } catch (error) {
        if (error.code === "P2025")
            return res.status(404).json({error: "NOT FOUND"})
        return res.status(500).json({error: "UKNOWN ERROR"})
    }
}
