# Socket.IO Horizontal Scaling Lab

A small learning project demonstrating how Socket.IO works when multiple server workers are running at the same time.

The project explores how Socket.IO workers communicate using adapters and how broadcasts and rooms behave across different workers.

## Concepts Covered

- Node.js Cluster
- Primary process vs worker processes
- Multiple Socket.IO server instances
- Socket.IO Cluster Adapter
- Socket.IO MongoDB Adapter
- MongoDB Change Streams
- MongoDB single-node replica set
- Socket.IO rooms across workers
- Basic horizontal scaling concepts
- Client-to-worker affinity / sticky sessions (conceptual)
- Node.js worker IPC with `process.send()` / `worker.send()` (educational experiment)

## Project Structure

```text
socket-horizontal-scaling/
│
├── package.json
├── app.js
├── server.js
├── socket.js
│
├── db/
│   └── config.js
│
├── cluster/
│   └── index.js
│
├── socket/
│   └── connection.js
│
├── handlers/
│   └── messageHandler.js
│
├── views/
│   └── index.ejs
│
└── public/
    └── js/
        └── index.js
```

## Installation

Install dependencies:

```bash
npm install
```

## Running the Project

The project uses Node.js Cluster to create two Socket.IO workers.

Start it with:

```bash
node cluster/index.js
```

The workers run on:

```text
Worker 1 → http://localhost:3000
Worker 2 → http://localhost:3001
```

Open the two URLs in separate browser tabs.

---

# Part 1 — Cluster Adapter

The first part demonstrates Socket.IO horizontal scaling using Node.js Cluster.

Architecture:

```text
                 Primary
                /       \
               /         \
          Worker 1     Worker 2
          :3000        :3001
             │             │
          Socket.IO     Socket.IO
               \         /
                Cluster
                Adapter
```

Each worker has its own Socket.IO instance.

Without an adapter:

```text
Worker 1 ──X── Worker 2
```

A broadcast from Worker 1 only reaches sockets connected to Worker 1.

With the Cluster Adapter:

```text
Worker 1 ── Cluster Adapter ── Worker 2
```

Events can be propagated between workers.

## Rooms

The project also tests rooms across workers.

For example:

```text
Tab A → Worker 1 → room-a
Tab B → Worker 2 → room-a
```

A message sent to `room-a` reaches both clients even though they are connected to different workers.

---

# Part 2 — MongoDB Adapter

The project also demonstrates the MongoDB adapter.

Architecture:

```text
Worker 1 ───────┐
                │
             MongoDB
                │
Worker 2 ───────┘
```

MongoDB acts as the communication layer between independent Socket.IO server instances.

The MongoDB adapter uses a collection for its events and MongoDB Change Streams to detect changes.

## Why a Replica Set?

MongoDB Change Streams require MongoDB to run as a replica set or sharded cluster.

For this project, a single MongoDB instance was configured as a:

```text
Single-node replica set
```

This is sufficient for local development and learning.

It does **not** provide the redundancy of a real multi-node production replica set.

## Creating a Single-Node MongoDB Replica Set

For the MongoDB adapter to use MongoDB Change Streams, MongoDB must run as a replica set or sharded cluster.

For this learning project, a **single-node replica set** was created locally.

### 1. Stop the existing MongoDB server

The existing standalone MongoDB instance running on port `27017` was stopped.

### 2. Start MongoDB with a replica-set name

MongoDB was started with the `--replSet` option:

```bash
mongod --dbpath "C:\data\db" --replSet rs0 --port 27017 --bind_ip localhost
```

Here:

- `--dbpath` → location where MongoDB stores its data
- `--replSet rs0` → tells MongoDB to run as part of replica set `rs0`
- `--port 27017` → MongoDB listens on the default port
- `--bind_ip localhost` → accepts connections from the local machine

The MongoDB process was kept running in this terminal.

### 3. Open MongoDB Shell

A second terminal was opened and MongoDB Shell was started:

```bash
mongosh
```

### 4. Initialize the replica set

Inside `mongosh`:

```javascript
rs.initiate();
```

MongoDB then initialized the current MongoDB instance as the first member of replica set `rs0`.

### 5. Verify the replica set

The replica-set status was checked with:

```javascript
rs.status();
```

The output should show:

```text
set: "rs0"
```

and the single member should eventually become:

```text
PRIMARY
```

The resulting architecture is:

```text
Single-Node Replica Set

        MongoDB
          │
        rs0
          │
       PRIMARY
```

This is still **only one MongoDB server/process**. It is called a single-node replica set because that one server is configured as a member of a replica set.

### 6. Update the MongoDB connection string

The Node.js application was then configured to connect to the replica set:

```js
const mongoClient = new MongoClient(
    "mongodb://localhost:27017/?replicaSet=rs0",
);
```

The `replicaSet=rs0` parameter tells the MongoDB driver which replica set it should connect to.

### 7. Create the adapter collection

The Socket.IO MongoDB adapter uses a MongoDB collection for its events:

```js
const collection = db.collection("socket_events");
```

For this project, the collection was configured as a capped collection:

```js
await db.createCollection("socket_events", {
    capped: true,
    size: 1e6,
});
```

The capped collection has a fixed maximum size, so old event documents are eventually removed as new ones are added.

### Final architecture

```text
                    Primary
                   /       \
                  /         \
             Worker 1     Worker 2
                 │             │
              Socket.IO     Socket.IO
                 │             │
                 └─────┬───────┘
                       │
                MongoDB Adapter
                       │
                       ▼
              MongoDB Replica Set
                       │
                      rs0
                       │
                    PRIMARY
                       │
                socket_events
                       │
                Change Stream
```

### Important clarification

A single-node replica set was used **only to enable the MongoDB features required by the adapter**, particularly Change Streams.

It does **not** provide the redundancy or fault tolerance of a real multi-node MongoDB replica set.

A production replica set would normally contain multiple MongoDB members, for example:

```text
              MongoDB Replica Set
             ┌────────┼────────┐
             ▼        ▼        ▼
          Primary  Secondary Secondary
```

For this learning project, one MongoDB instance was enough.

## Capped Collection

The adapter event collection can be configured as a capped collection.

A capped collection has a fixed maximum size and automatically removes older entries as new entries are added.

This makes it suitable for temporary adapter/event data rather than permanent application data.

---

# Important Mental Model

The most important concept demonstrated by this project is:

```text
Multiple Socket.IO servers
          │
          ▼
       Adapter
          │
          ▼
Communication between servers
```

Different adapters use different mechanisms.

```text
Cluster Adapter
      ↓
Node.js Cluster IPC

MongoDB Adapter
      ↓
MongoDB + Change Streams

Redis Adapter
      ↓
Redis Pub/Sub
```

The adapter is what allows Socket.IO instances that would otherwise be isolated from each other to coordinate events.

---

# Educational IPC Experiment

A small custom in-process bridge was also tested using Node.js cluster messaging:

```text
Worker 1
   │
   │ process.send()
   ▼
Primary
   │
   │ worker.send()
   ▼
Worker 2
   │
   ▼
Socket.IO client
```

This was only an educational experiment to understand how workers can communicate.

It was removed from the final project and should not be considered a replacement for Socket.IO's official adapters.

---

# What This Project Does NOT Cover

This is intentionally a small learning project.

It does not attempt to provide a complete production deployment covering:

- Nginx/load balancers
- Production sticky-session configuration
- Redis deployment
- Multiple physical servers
- Container orchestration
- Production MongoDB replica sets
- Database persistence for chat messages
- Advanced Socket.IO namespaces
- Worker failure/recovery strategies

Those can be explored as separate projects if needed.

---

# Key Takeaways

1. Node.js Cluster creates multiple worker **processes**.
2. Each worker has its own Socket.IO instance.
3. Without an adapter, workers don't automatically share Socket.IO events.
4. The Cluster Adapter uses Node's cluster communication mechanism.
5. The MongoDB Adapter uses MongoDB as a communication layer.
6. MongoDB Change Streams allow workers to detect adapter events.
7. Change Streams require a replica set or sharded MongoDB deployment.
8. A single-node replica set is enough for local learning.
9. Socket.IO rooms can work across different workers when the adapter is configured correctly.
10. Horizontal scaling can be achieved without requiring every worker to run on a separate physical machine.
