
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
            throw new Error('COULDNT_FETCH')
        const fetchedDt = await response.json();
        const askerOne = fetchedDt.find((param) => {return Number(param.id) === askerId})
	    const helperOne = fetchedDt.find((param) => {return Number(param.id) === helperId})

        return {Profiles: {askerOne, helperOne}};

}

