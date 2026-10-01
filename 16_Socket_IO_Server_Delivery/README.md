# Socket.IO Server Delivery Lab

A small learning project for understanding how a Socket.IO server can deliver current state and missed events to a client after a disconnect/reconnect.

The project intentionally keeps the architecture modular:

- Express serves the application and EJS page.
- Socket.IO handles real-time connections and events.
- A message store keeps server-side message history.
- A service layer hides storage details from Socket.IO handlers.
- Handlers contain the Socket.IO event logic.

## What this project teaches

### 1. Normal Socket.IO delivery

When a message is created, the server broadcasts it to currently connected clients:

```js
io.emit("new-message", message);
```

A client that is offline when this event is emitted does not receive that event through the normal broadcast.

### 2. Full-state delivery

When a client has no known state, it asks for the complete current state:

```text
Client -> request-full-state
Server -> full-state + all stored messages
```

This is simple and reliable, but sending the entire state can become expensive when the state is large.

### 3. Missing-event delivery

When a client already has some state, it sends its last received message ID:

```text
Client -> request-missing-events(lastReceivedId)
Server -> messages with id > lastReceivedId
```

For example:

```text
Server:  1 2 3 4 5 6
Client:  1 2 3

lastReceivedId = 3

Missing events: 4 5 6
```

### 4. `serverOffset`

The Socket.IO tutorial uses the term `serverOffset`. In this project, `lastReceivedId` represents the same core idea: the client's position in the server's ordered event history.

The offset is application-level state. Socket.IO does not automatically give this variable special meaning.

### 5. Duplicate delivery and deduplication

A message may be delivered more than once in some delivery designs. The project demonstrates how a message ID can be used to detect duplicates on the client with a `Set`.

```js
if (receivedMessageIds.has(message.id)) {
    return;
}
```

The project also uses:

```js
lastReceivedId = Math.max(lastReceivedId, message.id);
```

to avoid moving the tracked position backwards if messages are observed out of order.

## Project structure

```text
socket-server-delivery/
│
├── app.js
├── server.js
├── socket.js
│
├── connection/
│   └── connection.js
│
├── handlers/
│   └── messageHandler.js
│
├── services/
│   └── messageService.js
│
├── store/
│   └── messageStore.js
│
├── views/
│   └── index.ejs
│
├── public/
│   └── js/
│       └── index.js
│
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

## Responsibility of each file

### `app.js`

Configures Express, EJS, static files, and the `/` route.

### `server.js`

Creates the Node HTTP server around the Express application and starts listening on port `3000`.

### `socket.js`

Creates the Socket.IO server and passes each new connection to the connection layer.

### `connection/connection.js`

Handles the lifecycle of a connected socket and registers message handlers.

### `handlers/messageHandler.js`

Contains Socket.IO events for creating messages and requesting server state.

### `services/messageService.js`

Provides application-level functions such as creating messages and retrieving stored messages without exposing storage details to handlers.

### `store/messageStore.js`

Currently stores messages in memory and provides functions for reading all messages or messages after a particular ID.

### `views/index.ejs`

The HTML page served by Express through EJS. It contains the learning UI for connection state, last received ID, message count, and delivery logs.

### `public/js/index.js`

Contains the Socket.IO client logic, message rendering, offset tracking, full-state requests, missing-event requests, and duplicate detection.

## Installation

```bash
npm install
```

## Run

```bash
node server.js
```

Open:

```text
http://localhost:3000
```

## Experiments

### Experiment 1: Normal delivery

Open two browser tabs and create a message.

Both connected tabs should receive the `new-message` event.

### Experiment 2: Full-state delivery

Create several messages, then refresh/open a new tab.

The new connection has `lastReceivedId === 0`, so it requests the full state.

Expected result:

```text
FULL STATE DELIVERY -> all currently stored messages
```

### Experiment 3: Missing-event delivery

1. Open two tabs.
2. Let both receive messages `1`, `2`, and `3`.
3. Set one tab to **Offline** in Chrome DevTools → Network.
4. From the other tab, create messages `4`, `5`, and `6`.
5. Bring the offline tab back to **No throttling**.
6. On reconnect, the client sends `lastReceivedId = 3`.
7. The server returns only `4`, `5`, and `6`.

Expected result:

```text
MISSING EVENTS DELIVERY -> only the messages after ID 3
```

### Experiment 4: Duplicate delivery

Temporarily send the same message twice from the server. The client-side `Set` should prevent the second copy from being rendered.

After observing the behavior, remove the duplicate simulation.

## Full state vs missing events

| Strategy       | Client sends              | Server returns                  | Best suited for                         |
| -------------- | ------------------------- | ------------------------------- | --------------------------------------- |
| Full state     | Nothing / no known state  | Entire current state            | New clients, simple synchronization     |
| Missing events | Last received ID / offset | Only events after that position | Reconnecting clients with partial state |

## Important concepts

### State vs events

A full-state response synchronizes the client's current state.

A missing-event response replays the events needed to move the client from its previous state to the current state.

### Message ID / offset

The ID gives the server a way to determine what the client already has.

```text
client position = 3
server history  = 1 2 3 4 5 6
missing         = 4 5 6
```

### Connection State Recovery (CSR)

This project focuses on application-level server delivery. It should not be confused with Socket.IO Connection State Recovery.

CSR is a Socket.IO feature that can recover connection state and missed packets for eligible temporary disconnections. This project instead demonstrates explicitly asking the application for full state or missing events from the server's message history.

## Storage limitation

`messageStore.js` currently uses an in-memory array:

```js
let messages = [];
```

That means all messages disappear when the Node.js process restarts.

This is intentional for the learning project. The storage layer is separated so it can later be replaced with SQLite, MongoDB, or another persistent store without rewriting the Socket.IO delivery logic.

## Main takeaway

Server delivery is about giving a reconnecting client a way to become consistent with the server again.

There are two simple strategies demonstrated here:

```text
Full state:
"Give me everything you currently have."

Missing events:
"I have everything through ID 42. Give me what comes after 42."
```

The Socket.IO tutorial's `serverOffset` is the mechanism used to represent that second idea.
