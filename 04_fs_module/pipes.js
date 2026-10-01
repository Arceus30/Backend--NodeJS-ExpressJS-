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

// Pipe the data from the readable stream directly into the writable stream.
readableStream.pipe(writeableStream);

// We can do pipe chaining between streams
// Chaining can only happen between readable stream, duplex stream and transform stream.
// Chaining cannot happen with writeable stream as it cannot produce readable data
// Example: readableStream.pipe(transformStream).pipe(writeableStream)
