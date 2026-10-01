const fs = require("node:fs");

// it is a synchronous method and it will block the main thread
// const fileContent = fs.readFileSync("./file.txt"); // by default it returns a buffer object
const fileContent = fs.readFileSync("./file.txt", "utf-8");
console.log(fileContent);

// asynchronous readfile method: it will not block the main thread
fs.readFile("./file.txt", "utf-8", (error, data) => {
    if (!error) console.log(data);
});

// it is a synchronous method and it will block the main thread
fs.writeFileSync("./greet.txt", "Hello");

// asynchronous readfile method: it will not block the main thread
fs.writeFile("./greet-async.txt", "Hello", (error) => {
    if (error) console.log(error);
});

