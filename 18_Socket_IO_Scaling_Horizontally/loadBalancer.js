const http = require("node:http");

const workers = ["http://localhost:3000", "http://localhost:3001"];
const clientWorkers = new Map();
let nextWorker = 0;

const server = http.createServer(async (req, res) => {
    // Pick a worker randomly
    const clientId = req.headers["x-client-id"];
    let worker = clientWorkers.get(clientId);
    if (!worker) {
        worker = workers[nextWorker];
        nextWorker = (nextWorker + 1) % workers.length;
        clientWorkers.set(clientId, worker);
        console.log(`New client ${clientId} → ${worker}`);
    } else {
        console.log(`Existing client ${clientId} → ${worker}`);
    }
    try {
        const response = await fetch(`${worker}${req.url}`);
        res.writeHead(response.status, Object.fromEntries(response.headers));
        res.end(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
        console.error(error);
        res.writeHead(502);
        res.end("Worker unavailable");
    }
});

server.listen(4000, () => {
    console.log("Load balancer running on http://localhost:4000");
});
