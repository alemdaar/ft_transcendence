import  {prisma}  from "../instanceDb.js"

export const deltePost = async (req, res) => {
    try {
        const delePost = await prisma.studentRequest.delete({
            where: {
                id: req.params.id,
                asker_id: req.user.sub,
                status: 'open'
            }
        })
        return res.status(200).json({succes: delePost})
    }  catch(err) {
        if (err.code === 'P2025')
            return res.status(404).json({error: "NOT_FOUND"})
        return res.status(500).json({error: 'UKNOWN_ERROR'})
    }
}