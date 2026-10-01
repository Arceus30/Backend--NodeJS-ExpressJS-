// Default Import
import addFn from "./add-esm";
console.log(addFn(2, 3));

// Named Import
import { add, subtract } from "./math-esm";
console.log(add(2, 3));
console.log(subtract(3, 1));
