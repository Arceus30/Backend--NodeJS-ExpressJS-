const fsp = require("node:fs/promises");

fsp.readFile("./file.txt", "utf-8") // it returns a promise
    .then((d) => {
        console.log(d);
    })
    .catch((err) => {
        console.log(err);
    });

fsp.writeFile("./greet.txt", "Hello") // it returns a promise
    .catch((err) => {
        console.log(err);
    });
