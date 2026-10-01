const fs = require("node:fs");

// Create a readable stream to read data from file.txt.
const readableStream = fs.createReadStream("./file.txt", {
    // encoding: "utf-8" returns the data as strings instead of Buffers.
    encoding: "utf-8",
    // highWaterMark: 2 means the stream reads up to 2 characters at a time.
    highWaterMark: 2,
});

// Create a writable stream to write data into file2.txt.
const writeableStream = fs.createWriteStream("./file2.txt");

// The "data" event runs whenever a chunk of data is available.
readableStream.on("data", (chunk) => {
    // Print the current chunk to the console.
    console.log(chunk);

    // Write the chunk into file2.txt.
    writeableStream.write(chunk);
});
