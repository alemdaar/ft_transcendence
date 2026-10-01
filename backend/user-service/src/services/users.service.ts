const users = [
    {
        id: 1,
        username: "oussama"
    },
    {
        id: 2,
        username: "ahmed"
    }
];

export function findUserById(id: number) {
    return users.find((user) => user.id === id);
}