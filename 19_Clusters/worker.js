const cluster = require("cluster");
const http = require("http");

let requestCount = 0;
console.log(`Worker ${cluster.worker.id} started`);
console.log(`Worker PID: ${process.pid}`);
console.log(`Worker is primary: ${cluster.isPrimary}`);

// Listen for messages from Primary.
process.on("message", (message) => {
    if (message.type === "GET_LOCAL_STATS") {
        process.send({
            type: "LOCAL_STATS",
            count: requestCount,
        });
    }
});
const server = http.createServer((req, res) => {
    requestCount++;
    console.log(`Request handled by worker ${process.pid}`);
    console.log(`Worker ${cluster.worker.id} handled request`);
    console.log(`Its request count: ${requestCount}`);

    if (req.url === "/primary-crash") {
        process.send({
            type: "CRASH_PRIMARY",
        });
        res.end("Primary crash requested");
        return;
    }

    if (req.url === "/stats") {
        process.send({
            type: "GET_ALL_STATS",
        });
        res.writeHead(200, {
            "Content-Type": "text/plain",
        });
        res.end(
            "Statistics request sent to Primary.\n" + "Check the terminal.",
        );
        return;
    }

    if (req.url === "/crash") {
        console.log(`Worker ${process.pid} is crashing...`);
        process.exit(1);
    }
    if (req.url === "/") {
        res.writeHead(200, {
            "Content-Type": "text/plain",
        });

        res.end(`
            Worker information
            PID: ${process.pid} // comes from the operating system.
            Worker ID: ${cluster.worker.id} // comes from Node's Cluster system.
            Cluster identifies this worker as worker ${cluster.worker.id}, while the operating system identifies its process as PID ${process.pid}.
            If a Worker dies and is replaced: The new process gets a new PID and a new cluster worker ID.
            Requests handled by THIS worker:
            ${requestCount}
        `);
        return;
    }

    res.writeHead(404);
    res.end("Not Found");
});

// all our workers listen to port 3000 but still there is no EADDRINUSE, because
// Cluster coordinates the listening socket.
// The workers are not behaving like four completely unrelated processes fighting over port 3000
// The worker process is part of a Node.js cluster, the networking behavior is coordinated by the Cluster implementation.
server.listen(3000, () => {
    console.log(`Worker ${cluster.worker.id} listening on port 3000`);
});

// shut down gracefully:
// Primary
// │
// │ "Please shut down"
// ▼
// Worker
// │
// ├── stop accepting new work
// ├── finish existing work
// └── exit
process.on("SIGTERM", () => {
    console.log(`Worker ${process.pid} received SIGTERM`);
    // server.close() doesn't immediately destroy existing connections.
    // It stops accepting new connections and allows existing connections to finish.
    server.close(() => {
        console.log(`Worker ${process.pid} finished existing connections`);
        process.exit(0);
    });
});
