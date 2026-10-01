const http = require("http");
const fs = require("fs");
const port = 3000;

// Creates an HTTP server.
const server = http.createServer((req, res) => {
    // req = incoming request, Contains information about the incoming request.
    // res = the response you write, Used to send a response back to the client.

    if (
        req.url === "/" && // Checks whether the client requested the root URL.
        req.method === "GET" // Checks that the request uses the GET method.
    ) {
        res.writeHead(200, { "Content-Type": "application/json" }); // Sends the HTTP response status code and headers to the client.

        // res.write(JSON.stringify({message: "Hello"})) // writes the message in res.body, it does not end the response process, we can further write res.write() as many times we want before res.end()
        // res.end() // end the response process

        res.end(JSON.stringify({ message: "Hello" })); // shorthand version of res.wite(message) + res.end()
    } else if (req.url === "/index" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/html" });

        // sending an HTML file.

        // const html = fs.readFileSync("./index.html", "utf-8");
        // res.end(html);

        //or
        fs.createReadStream("./index.html", { encoding: "utf-8" }).pipe(res);
    } else if (req.url === "/name" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/html" });

        // injects dynamic values in the HTML file.
        let html = fs.readFileSync("./name.html", "utf-8");
        const name = "Keshav";
        html = html.replace("{{name}}", name);
        res.end(html);
    } else {
        res.writeHead(404);
        res.end("Not found");
    }
});

// Starts the server on port 3000.
server.listen(3000, () => console.log("on http://localhost:3000"));
