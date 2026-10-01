const EventEmitter = require("node:events");

// Create a new EventEmitter object
const emitter = new EventEmitter();

// Register an event listener for the "Order-Pizza" event.
// It receives the pizza size and topping as arguments
emitter.on("Order-Pizza", (size, topping) => {
    console.log("Order Recieved", size, topping);
});

// Register another listener for the same event.
// If the pizza size is "large", drinks will be served
emitter.on("Order-Pizza", (size) => {
    if (size === "large") console.log("Serving Drinks");
});

// Emit the "Order-Pizza" event with "large" size and "mushroom" topping
// Both listeners above will be executed
emitter.emit("Order-Pizza", "large", "mushroom");
console.log();

// Emit the event again with an empty size and "mushroom" topping
// The first listener runs, but "Serving Drinks" is not printed
// because the size is not "large"
emitter.emit("Order-Pizza", "", "mushroom");

const PizzaShop = require("./pizza");
const pizzaShop = new PizzaShop();

pizzaShop.on("order", (size, topping) => {
    console.log("Recieved Order", size, topping);
});
