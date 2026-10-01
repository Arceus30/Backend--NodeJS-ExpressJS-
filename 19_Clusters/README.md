# Node.js Cluster Lab

A hands-on learning project for understanding the **Node.js Cluster module**, including worker processes, CPU utilization, IPC, worker lifecycle, failure recovery, graceful shutdown, and request distribution.

---

## What I Learned

This project explores how Node.js can use multiple processes to utilize multiple CPU cores.

### Core concepts covered

- Node.js single-process architecture
- Primary and Worker processes
- `cluster.isPrimary`
- `cluster.fork()`
- `cluster.setupPrimary()`
- Worker IDs vs Process IDs
- Multiple Workers listening on the same port
- Worker-local memory
- Primary ↔ Worker IPC
- Worker failure and replacement
- `online`, `disconnect`, and `exit` events
- Graceful shutdown
- `SIGINT` and `SIGTERM`
- CPU count vs Worker count
- Logical CPUs
- Cluster scheduling
- Round-robin request distribution
- Why Cluster does not provide shared application state
- Why the Primary itself cannot automatically recover
- Separation of Primary and Worker responsibilities

---

## Project Architecture

```text
node-cluster-lab/
│
├── package.json
├── primary.js
├── worker.js
├── README.md
└── .gitignore
```

### Architecture

```text
                    Primary
                  primary.js
                      │
                cluster.fork()
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
    Worker 1      Worker 2      Worker 3
    worker.js     worker.js     worker.js
        │             │             │
        └─────────────┼─────────────┘
                      │
                    :3000
```

The Primary manages the cluster while Workers handle application requests.

---

# Primary vs Worker

## Primary Process

The Primary is responsible for:

- Creating Workers
- Monitoring Workers
- Detecting Worker failures
- Replacing terminated Workers
- Coordinating the cluster
- Managing Worker lifecycle

The Primary does not handle the HTTP application logic in this project.

---

## Worker Process

Each Worker:

- Is a separate OS process
- Has its own V8 instance
- Has its own event loop
- Has its own heap
- Has its own memory
- Runs `worker.js`
- Handles HTTP requests
- Maintains its own local state

For example:

```text
Worker 1
requestCount = 10

Worker 2
requestCount = 5
```

These are two completely separate variables in two different processes.

---

# Why Cluster?

A normal Node.js application generally executes JavaScript on a single event loop.

```text
Node Process
     │
     ▼
Event Loop
     │
     ▼
CPU
```

Cluster allows us to create multiple Node.js processes:

```text
              Primary
             /   |   \
            ▼    ▼    ▼
           W1   W2    W3
```

This allows the application to make better use of multiple CPU cores.

---

# Creating Workers

The Primary uses:

```js
cluster.fork();
```

to create Workers.

Example:

```js
for (let i = 0; i < workerCount; i++) {
    cluster.fork();
}
```

Each call creates a new Node.js process.

It does **not** create a thread inside the Primary process.

---

# `cluster.setupPrimary()`

Because Primary and Worker logic are separated into different files, we configure the Worker entry point:

```js
cluster.setupPrimary({
    exec: "./worker.js"
});
```

Then:

```js
cluster.fork();
```

starts `worker.js` as a Worker process.

---

# Process ID vs Worker ID

Every Worker has two useful identifiers.

### Process ID

```js
process.pid
```

This is the operating system process ID.

Example:

```text
Worker PID: 18420
```

### Worker ID

```js
cluster.worker.id
```

This is the ID assigned by Node's Cluster module.

Example:

```text
Worker ID: 2
```

They are different concepts.

```text
Worker ID → Cluster identifier
PID       → Operating system identifier
```

---

# Multiple Workers on Port 3000

Every Worker runs:

```js
server.listen(3000);
```

Normally, multiple independent Node processes cannot all bind to the same port.

Cluster provides the infrastructure that allows the Workers to participate in the same listening server.

Conceptually:

```text
                 :3000
                   │
                Cluster
             /      |      \
            ▼       ▼       ▼
          W1       W2       W3
```

---

# Worker-Local State

Each Worker has its own memory.

Example:

```js
let requestCount = 0;
```

If three Workers process requests:

```text
Worker 1 → 10 requests
Worker 2 → 4 requests
Worker 3 → 7 requests
```

there is no automatically shared:

```text
global requestCount = 21
```

Instead:

```text
Worker 1 memory → requestCount = 10
Worker 2 memory → requestCount = 4
Worker 3 memory → requestCount = 7
```

This is one of the most important Cluster concepts.

---

# IPC — Inter-Process Communication

Because Workers have separate memory, they cannot directly access each other's variables.

Cluster provides IPC.

### Worker → Primary

```js
process.send(message);
```

### Primary → Worker

```js
worker.send(message);
```

Conceptually:

```text
Worker
   │
   │ process.send()
   ▼
Primary
   │
   │ worker.send()
   ▼
Worker
```

IPC allows processes to exchange messages, but it does **not** turn their memory into shared memory.

---

# Worker Failure

The Primary can monitor Workers:

```js
cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.id} exited`);

    cluster.fork();
});
```

If:

```text
Worker 2
PID 12010
```

crashes:

```text
Worker 2 💥
     │
     ▼
Primary detects exit
     │
     ▼
cluster.fork()
     │
     ▼
Replacement Worker
```

The replacement Worker gets a new PID.

The old process is not resurrected.

A new process is created.

---

# Worker Lifecycle

Important lifecycle events explored in the project:

```text
fork()
  ↓
online
  ↓
running
  ↓
disconnect
  ↓
exit
```

### `online`

Indicates that the Worker has started and established communication with the Primary.

### `disconnect`

Indicates that the Worker has disconnected its IPC channel.

### `exit`

Indicates that the Worker process has terminated.

Important:

```text
disconnect ≠ exit
```

Disconnecting IPC does not necessarily mean the OS process has already terminated.

---

# Graceful Shutdown

A Worker can handle `SIGTERM`:

```js
process.on("SIGTERM", () => {
    server.close(() => {
        process.exit(0);
    });
});
```

`server.close()` stops accepting new connections while allowing existing connections to finish.

Conceptually:

```text
SIGTERM
   ↓
Worker
   ↓
Stop accepting new work
   ↓
Finish existing work
   ↓
Close server
   ↓
Exit
```

The Primary can also handle `SIGINT`, which is normally generated by pressing:

```text
Ctrl + C
```

---

# What Happens If the Primary Dies?

This was an important experiment.

If a Worker dies:

```text
Primary
   │
   ├── Worker 1
   ├── Worker 2 💥
   └── Worker 3
```

the Primary can create a replacement.

But if the Primary dies:

```text
Primary 💥
   │
   ├── Worker 1
   ├── Worker 2
   └── Worker 3
```

Cluster does not automatically elect a Worker as the new Primary.

Node Cluster itself does not provide complete application-level high availability.

An external process supervisor can restart the application.

Conceptually:

```text
Process Supervisor
        │
        ▼
     Primary
     / | \
    W1 W2 W3
```

If Primary dies:

```text
Process Supervisor
        │
        ▼
   New Primary
      / | \
     W1 W2 W3
```

---

# Worker Count

The project uses:

```js
const workerCount = Math.min(
    os.cpus().length,
    4
);
```

`os.cpus().length` tells us how many logical CPUs Node can see.

It does not automatically mean:

> "This is the exact number of Workers I should create."

Every Worker is a separate process with its own memory and runtime overhead.

More Workers do not automatically mean better performance.

---

# CPU-Bound vs I/O-Bound Work

Cluster can be particularly useful for workloads where multiple processes can utilize available CPU resources.

For CPU-heavy work:

```text
CPU 1 ← Worker 1
CPU 2 ← Worker 2
CPU 3 ← Worker 3
CPU 4 ← Worker 4
```

For I/O-heavy workloads, Node's asynchronous I/O model already provides high concurrency, so simply adding Workers does not guarantee proportional performance improvements.

Worker count should therefore be treated as a configuration and performance decision.

---

# Request Distribution

Cluster can distribute incoming connections among Workers.

Conceptually, with round-robin scheduling:

```text
Request 1 → Worker 1
Request 2 → Worker 2
Request 3 → Worker 3
Request 4 → Worker 1
```

However, real HTTP behavior is more complicated because connections can be reused through keep-alive.

Cluster should therefore not be thought of as:

```text
Every HTTP request
        ↓
Next Worker
```

It is more accurate to understand the mechanism in terms of incoming connections and Cluster's scheduling behavior.

---

# Shared State Problem

Cluster solves:

```text
How do I run multiple Node processes?
```

It does not solve:

```text
How do all those processes share application state?
```

For example:

```js
const sessions = new Map();
```

stored inside Worker 1 is not automatically available inside Worker 2.

For shared state, applications commonly use an external system:

```text
Worker 1 ──┐
Worker 2 ──┤
Worker 3 ──┼──→ Redis / Database
Worker 4 ──┘
```

This is why distributed applications often need external state stores.

---

# Running the Project

Install dependencies:

```bash
npm install
```

There are currently no external dependencies, but this keeps the project workflow conventional.

Start the application:

```bash
npm start
```

You should see output similar to:

```text
Primary PID: 12000
CPU cores available: 4
Workers to create: 4

Worker 1 is online | PID: 12010
Worker 2 is online | PID: 12011
Worker 3 is online | PID: 12012
Worker 4 is online | PID: 12013
```

Open:

```text
http://localhost:3000
```

Refresh the page multiple times and observe the Worker ID and PID.

---

# Learning Experiments Completed

During the lab, we experimented with:

### 1. Single Process

```text
One Node process
One event loop
```

### 2. Basic Cluster

```text
Primary
 ├── Worker 1
 ├── Worker 2
 └── Worker 3
```

### 3. Worker Failure

```text
Worker dies
    ↓
Primary detects exit
    ↓
Replacement Worker
```

### 4. IPC

```text
Worker → Primary
Primary → Worker
```

### 5. Local State

Each Worker maintains independent memory.

### 6. Global Statistics

Workers reported local state to Primary, which aggregated the results.

### 7. Worker Lifecycle

Explored:

```text
online
disconnect
exit
```

### 8. Primary Failure

Learned that Cluster cannot automatically replace its own Primary.

### 9. Worker Count

Explored CPU count and configurable Worker count.

### 10. Scheduling

Observed how Cluster distributes connections among Workers.

### 11. Clean Architecture

Separated:

```text
primary.js
worker.js
```

---

# Final Mental Model

The most important thing to remember is:

```text
                    Node Cluster
                         │
                  ┌──────┴──────┐
                  │   Primary   │
                  │             │
                  │ Coordination│
                  └──────┬──────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       Worker 1       Worker 2       Worker 3
          │              │              │
       Memory         Memory         Memory
       Event Loop     Event Loop     Event Loop
       V8 Instance    V8 Instance    V8 Instance
          │              │              │
          └──────────────┼──────────────┘
                         │
                       :3000
```

**Cluster = multiple independent Node.js processes coordinated by a Primary.**

The Workers do not share JavaScript memory.

That single idea explains most of the behavior we observed throughout this project.