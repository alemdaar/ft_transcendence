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


// const users = [
// 	{
// 		id: 1,
// 		name: "oussama",
// 		status: "active",
// 	},
// 	{
// 		id: 2,
// 		name: "anas",
// 		status: "offline",
// 	}
// ]
// const justoneuser = {
// 	id: 1,
// 	name: "oussama",
// 	status: "active",
// }

// const user = users.find((user) => user.id === 73);

// console.log(user);


// const ages = [3, 10, 18, 22, 15, 12, 5, 6];

// const age = ages.find((test)=> test < 13);



// console.log(users.filter((user) => user.status === "active").map((u) => u.name));


// console.log(users);


// const { username: hh , name} = users[0];
// console.log(hh); // Output: "alice123"
// console.log(name); // Output: "Alice"


// const usersCopy = [...users];
// const usersWithNewUser = [...users, { id: 5, name: "E", username: "e5", status: "inactive" }];
// const updatedUser = { ...users[0], status: "inactive" };
// const test = {
// 	...users[0],
// 	status: "inactive"
// };
// console.log(usersCopy);
// console.log(usersWithNewUser);
// console.log(updatedUser);
// console.log(test);





// function f()
// {
// 	for (let i = 0; i < 1000000; i++) {
// 		for (n = 0; n < 7710; n++) {

// 		}
// 	}
// 	console.log("done");
// 	return n;
// }

// const result = f();
// console.log("jj");
// console.log(result);

function getUserFromServer() {

	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({ id: 1, name: "Oussama" });
		}, 2000);
	});
}

async function showUser() {
	console.log("Loading user...");

	const user = await getUserFromServer();

	console.log("User received:", user);
}

showUser();
console.log("This prints while we wait...");