const path = require("node:path"); // provide utilities for working with file and directory path

console.log(__filename); // full path to file
console.log(__dirname); // full path to directory / folder containing the file

console.log(path.basename(__filename)); // only the filename
console.log(path.basename(__dirname)); // only the folder name

console.log(path.extname(__filename)); // returns the file extension
console.log(path.extname(__dirname)); // returns "" (Empty string) for folder

console.log(path.parse(__filename)); // it parses the path and return an object
console.log(path.format(path.parse(__filename))); // it accepts an object and return the full path string

console.log(path.join("folder1", "folder2", "index.html")); // returns folder1/folder2/index.html

// it takes all the arguments and return the absolute path from root to last file / folder
// if it envounters a slash then it updates the root to be that directory and return the path from that root directory
console.log(path.resolve("folder1", "folder2", "index.html"));
