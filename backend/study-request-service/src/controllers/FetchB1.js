
export const FetchTest = async (req, res) => {
    try {
        const {ids} = req.body

        const arr = [{"id": ids[0], "name": "x"}, {"id": ids[1], "name": "y"}]
        return res.status(200).json(arr)
        
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)

    }
}

export const fetchedData = async (askerId, helperId) => {

    const response = await fetch('http://localhost:3001/users/batch', {
        method: "POST",
        headers: {
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgwIiwiY2FtcHVzIjoiUmFiYXQiLCJpYXQiOjE1MTYyMzkwMjJ9.uNZqfOhsn-UIXoyCubh3sOw6lEnV6MLW4fF6QEAcOEM`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "ids": [1, helperId]
            })
        })
        if (!response.ok)
            throw new Error('COULDNT_FETCH')
        console.log('askerId ', askerId, 'helperId ', helperId)
        const fetchedDt = await response.json();
        console.log(fetchedData)
        const askerOne = fetchedDt.find((param) => {return Number(param.id) === 1})
	    const helperOne = fetchedDt.find((param) => {return Number(param.id) === helperId})

        return {Profiles: {askerOne, helperOne}};

}

