// WORKER  <--> PRIMARY Communication
// IPC does NOT mean shared memory

const cluster = require("cluster");
const http = require("http");
const os = require("os");

if (cluster.isPrimary) {
    console.log(`Primary PID: ${process.pid}`);

    const cpuCount = os.cpus().length;

    for (let i = 0; i < cpuCount; i++) {
        const worker = cluster.fork();

        // primary listens (Worker --> Primary)
        worker.on("message", (message) => {
            console.log(`Primary received from Worker ${worker.id}:`, message);
        });

        // primary emits / send (primary --> Worker)
        worker.send({
            type: "WELCOME",
            message: `Hello Worker ${worker.id}`,
        });
    }
} else {
    console.log(`Worker ${cluster.worker.id} started`);
    console.log(`Worker PID: ${process.pid}`);

    // worker listens (Primary --> Worker)
    process.on("message", (message) => {
        console.log(`Worker ${cluster.worker.id} received:`, message);

        // gaurded because process.send exists when the process has an IPC channel, such as a Cluster worker.
        // A normal standalone Node process doesn't necessarily have one. For our Cluster worker, it is available.
        if (process.send) {
            // worker emits / send (Worker --> Primary)
            process.send({
                type: "RESPONSE",
                workerId: cluster.worker.id,
                pid: process.pid,
                message: "Hello Primary!",
            });
        }
    });
}
