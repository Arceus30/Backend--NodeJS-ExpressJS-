// MongoDB/cluster-adapter
const { availableParallelism } = require("node:os");
const cluster = require("node:cluster");

if (cluster.isPrimary) {
    console.log(
        `Primary ${process.pid} is NOT handling HTTP/Socket.IO requests`,
    );
    console.log(`Primary process started: ${process.pid}`);
    const numCPUs = availableParallelism();
    console.log(`Available CPU cores: ${numCPUs}`);
    // Create workers
    for (let i = 0; i < 2; i++) {
        cluster.fork({
            PORT: 3000 + i,
        });
    }
} else {
    // Worker process
    require("../server");
}

// socket.io/cluster-adapter
// const { availableParallelism } = require("node:os");
// const cluster = require("node:cluster");
// const { setupPrimary } = require("@socket.io/cluster-adapter");

// if (cluster.isPrimary) {
//     console.log(
//         `Primary ${process.pid} is NOT handling HTTP/Socket.IO requests`,
//     );
//     console.log(`Primary process started: ${process.pid}`);
//     const numCPUs = availableParallelism();
//     console.log(`Available CPU cores: ${numCPUs}`);
//     // Create workers
//     for (let i = 0; i < 2; i++) {
//         cluster.fork({
//             PORT: 3000 + i,
//         });
//     }

//     // Setup communication between primary and workers
//     setupPrimary();
// } else {
//     // Worker process
//     require("../server");
// }

// // Not using cluster-adapter
// // Node:Cluster custom cluster-adapter is used to send messages from worker to primary to worker
// const cluster = require("node:cluster");
// const { availableParallelism } = require("node:os");

// // ------------------------------------
// // PRIMARY PROCESS
// // ------------------------------------
// if (cluster.isPrimary) {
//     console.log(`Primary process started: ${process.pid}`);
//     const workers = [];
//     // --------------------------------
//     // Create workers
//     // --------------------------------
//     for (let i = 0; i < 2; i++) {
//         const worker = cluster.fork({
//             PORT: 3000 + i,
//         });
//         workers.push(worker);
//         // --------------------------------
//         // Receive messages from workers
//         // --------------------------------
//         worker.on("message", (message) => {
//             console.log(
//                 `Primary received message from Worker ${worker.process.pid}:`,
//                 message,
//             );
//             // Forward message to every OTHER worker
//             for (const otherWorker of workers) {
//                 if (otherWorker.id !== worker.id) {
//                     otherWorker.send(message);
//                 }
//             }
//         });
//     }
// }
// // ------------------------------------
// // WORKER PROCESS
// // ------------------------------------
// else {
//     require("../server");
// }
