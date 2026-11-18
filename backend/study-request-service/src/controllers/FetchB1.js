
// export const FetchTest = async (req, res) => {
//     try {
//         const {ids} = req.body

//         const arr = [{"id": ids[0], "name": "x"}, {"id": ids[1], "name": "y"}]
//         return res.status(200).json(arr)
        
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json(error)

//     }
// }

export const fetchedData = async (req, askerId, helperId) => {

    const token = req.headers.authorization;
    let fetchDb = []
    try {
        
        const response = await fetch('http://localhost:3001/users/batch', {
        method: "POST",
        headers: {
            "Authorization": `${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "ids": [askerId, helperId]
            })
        })
        if (!response.ok)
            throw new Error('bad response from b1')
        fetchDb = await response.json();
    } catch (error){
        console.error("B1 user fetch failed, falling back to Unknown user:", error.message);
    }

    const UserFallBack = {
        "id": null,
        "username": "Unknown user",
        "avatarUrl": null
    }

    const askerOne = fetchDb.find((data) => {return Number(data.id) === askerId })
	const helperOne = fetchDb.find((data) => {return Number(data.id) === helperId})

return {profiles:
{
    asker: askerOne || UserFallBack,
    helper: helperOne || UserFallBack
}};
}

