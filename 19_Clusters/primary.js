const cluster = require("cluster");
const os = require("os");

// CPU count ≠ recommended worker count.
// Every Worker is a real OS process.
// So: 4 workers  -->  4 separate Node processes
// Creating 100 workers on a 4-core machine doesn't magically give you 100 CPU cores.
// The OS has to schedule all those processes onto the available CPUs. That's oversubscription.
const workerCount = Math.min(os.cpus().length, 4);

console.log(`Primary PID: ${process.pid}`);
console.log(`CPU cores available: ${os.cpus().length}`);
console.log(`Workers to create: ${workerCount}`);
console.log(`Primary is primary: ${cluster.isPrimary}`); // cluster.isPrimary === true: Primary Process; cluster.isPrimary === false: Worker Process;

cluster.setupPrimary({
    exec: "./worker.js",
});

for (let i = 0; i < workerCount; i++) {
    cluster.fork(); // creates child / worker process
}

// Cluster emits an exit event when a worker process terminates and primary detect this "exit" event.
cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} exited`);
    console.log(`Exit code: ${code}`);
    console.log(`Signal: ${signal}`);
    console.log("Starting a replacement worker...");
    cluster.fork(); // creates replacement

    // That means every worker exit causes a replacement.
    // That's okay for our learning project. But in production, blindly restarting workers can be dangerous.
    // Imagine a worker repeatedly crashes because of a bug:
    // You could end up with a crash loop, where every worker crashes
    // Production systems generally add supervision policies, logging, backoff, health checks, and sometimes an external process manager/orchestrator. We'll keep it simple for now.
});

// worker sends: process.send({type: "CRASH_PRIMARY"})
// Node.js's IPC mechanism automatically delivers that data to the parent/primary process as a "message" event.
cluster.on("message", (worker, message) => {
    if (message.type === "CRASH_PRIMARY") {
        console.log(`Worker ${worker.id} requested Primary crash`);
        process.exit(1);
    }
});

// online means the Worker has successfully started and established its communication channel with the Primary.
// It doesn't mean the Worker has necessarily received an HTTP request.
cluster.on("online", (worker) => {
    console.log(`Worker ${worker.id} is online`);
    console.log(`PID: ${worker.process.pid}`);
});

// Cluster workers communicate with the Primary through IPC.  You can disconnect that IPC channel
// disconnect ≠ exit
cluster.on("disconnect", (worker) => {
    console.log(`Worker ${worker.id} disconnected`);
    console.log(`PID: ${worker.process.pid}`);
});

// Primary receives messages from Workers.
cluster.on("message", (worker, message) => {
    if (message.type === "GET_ALL_STATS") {
        console.log(`Worker ${worker.id} requested global statistics`);
        // Ask every Worker for its local count.
        for (const worker of Object.values(cluster.workers)) {
            worker.send({
                type: "GET_LOCAL_STATS",
            });
        }
    }
    // A Worker has sent its local statistics.
    if (message.type === "LOCAL_STATS") {
        console.log(`Worker ${worker.id} reports ${message.count} requests`);
    }
});

// A Worker object has kill. This terminates the worker process. For example, let's create a simple experiment.
setTimeout(() => {
    const worker = Object.values(cluster.workers)[0];
    console.log(`Killing Worker ${worker.id}`);
    worker.kill();
}, 10000);

// primary graceful shut down
process.on("SIGINT", () => {
    console.log("\nPrimary shutting down...");
    for (const worker of Object.values(cluster.workers)) {
        worker.kill();
    }
    process.exit(0);
});
