// // const add1 = (a, b) => {
// //     return a + b;
// // };

// // const result1 = add1(10, 5);
// // console.log("10 + 5 =", result1);



// function add2(a, b) {
//     return a + b;
// }


// const r = add2(6, 1);
// console.log(r);

// // const result2 = add2(10, 5);
// // console.log("10 + 5 =", result2);



// // const user = {
// //     name: "Oussama",

// //     sayName: () => {
// //         console.log(this.name);
// //     }
// // };

// // user.sayName(); // usually undefined


// const users = [
//   { id: 12, name: "Alice" },
//   { id: 73, name: "Bob" },
//   { id: 99, name: "Charlie" }
// ];

// const user = users.find((user) => user.id === 73);
// console.log(user);


// const ages = [3, 10, 18, 22, 15, 12, 5, 6];

// const age = ages.find((test)=> test < 13);


const users = [
	{ id: 1, name: "A", username: "a1", status: "active" },
	{ id: 2, name: "B", username: "b2", status: "inactive" },
	{ id: 3, name: "C", username: "c3", status: "pending" },
	{ id: 4, name: "D", username: "d4", status: "active" }
];

// console.log(users.filter((user) => user.status === "active").map((u) => u.name));


// console.log(users);


const { username: hh , name} = users[0];
// console.log(hh); // Output: "alice123"
// console.log(name); // Output: "Alice"


const usersCopy = [...users];
const usersWithNewUser = [...users, { id: 5, name: "E", username: "e5", status: "inactive" }];
const updatedUser = { ...users[0], status: "inactive" };

// console.log(usersCopy);
// console.log(usersWithNewUser);
console.log(updatedUser);