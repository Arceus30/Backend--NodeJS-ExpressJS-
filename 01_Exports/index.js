// Default Import
const addFn = require("./add");
console.log(addFn(2, 3));

// Named Import
const { add, subtract } = require("./math");
console.log(add(2, 3));
console.log(subtract(3, 1));

const Batman = require("./super-hero");
console.log(Batman.getName()); // Batman
Batman.setName = "spiderman";
console.log(Batman.getName()); // spiderman

// The super-hero module exports an object with name=superman
// but Superman points to the same object as Batman and since batman changed the name value to spiderman
// superman will also get name=spiderman
const Superman = require("./super-hero");
console.log(Superman.getName()); // spiderman and not Batman
