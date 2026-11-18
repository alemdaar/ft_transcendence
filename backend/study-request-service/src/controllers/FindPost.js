import  {prisma}  from "../instanceDb.js"

export const IfindPost = async (id) => {
    
    const findedPost = await prisma.studentRequest.findUnique({
        where: {
            id: id
        }
    })
        
    return findedPost;
}