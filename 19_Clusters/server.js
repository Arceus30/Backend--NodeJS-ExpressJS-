// const http = require("http");
// const os = require("os");

// const server = http.createServer((req, res) => {
//     if (req.url === "/") {
//         res.writeHead(200, {
//             "Content-Type": "text/plain",
//         });

//         res.end(`
//             Process ID: ${process.pid} // process.pid: gives us the operating-system process ID of our Node.js process.
//             CPU cores: ${os.cpus().length} // number of cores / processes we can run but by default Node.JS runs only 1 process
//             `);
//         return;
//     }
//     res.writeHead(404);
//     res.end(`Not found`);
// });

// server.listen(3000, () => {
//     console.log(`Server running on http://localhost:3000`);
//     console.log(`Process ID: ${process.pid}`);
// });

// Cluster
// Cluster gives a Node.js application multiple worker processes and worker-level fault handling, but it does not by itself provide complete application-level high availability.
// The Primary acts as the process supervisor.
// Primary
//    │
//    ├── manages workers
//    ├── does NOT create HTTP server
//    └── does NOT listen on port 3000

// Workers
//    │
//    ├── create HTTP server
//    └── listen on port 3000

// what happens if the Primary itself crashes?
// There is no Cluster mechanism that automatically elects Worker 1 as the new Primary.
// Workers are children managed by the Primary. The Primary is the parent process.
// If the parent disappears, the Cluster relationship breaks.
// This is one reason Cluster itself is not a complete high-availability system.
// Cluster does not automatically restart the Primary.
// Something outside the Cluster module needs to supervise the application.
// For example:
//                 Process Manager
//                      │
//                      ▼
//                   Primary
//                 /    |    \
//                /     |     \
//              W1      W2     W3
