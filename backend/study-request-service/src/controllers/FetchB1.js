
export const FetchTest = async (req, res) => {
    console.log('IN MY ENDPOINT')
    const arr = [{"id": 12, "name": "x"}, {"id": 14, "name": "y"}]
    return res.status(200).json({arr})
}

export const fetchedData = async (req, res) => {

    const response = await fetch('/api/users/me')
        if (!response.ok)
            throw new Error('COULDNT_FETCH')
        // extract response as json
        // i will get object with this data [{id: '12', name: 'jack', avatar: 'adw.jpg'}{id: '10', name: 'prety', avatar: 'sads.png'}]
        // then i have to find in this array of object which belong to which
        // so i have to compare the objects ids with helper_id or asker_id 

    const data = await response.json();
    data = data.find((param) => {
        console.log(param)
        
    })


}

