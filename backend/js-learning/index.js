// const add1 = (a, b) => {
//     return a + b;
// };

// const result1 = add1(10, 5);
// console.log("10 + 5 =", result1);



// function add2(a, b) {
//     return a + b;
// }

// const result2 = add2(10, 5);
// console.log("10 + 5 =", result2);



const user = {
    name: "Oussama",

    sayName: () => {
        console.log(this.name);
    }
};

user.sayName(); // usually undefined