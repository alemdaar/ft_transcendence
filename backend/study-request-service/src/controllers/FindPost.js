// import  {prisma}  from "../instanceDb.js"

// export const IfindPost = async (req, res) => {
    
//         const post = await prisma.studentRequest.findUnique({
//         where: {
//             id: req.params.id
//         }
//     })
//         if (!post)
//             res.status(404).json({Error: "NOT_FOUND"})
//         // if (checkUsers && post.asker_id !== req.user.id && post.helper_id !== req.user.id)
//         //     return res.status(403).json({Error: 'CANNOT_ACCES'})
//         return post;
// }