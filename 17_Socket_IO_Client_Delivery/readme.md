# Socket.IO Client Delivery Lab

A small learning project exploring **Socket.IO client-to-server message delivery**, acknowledgements, retries, duplicate messages, and persistent message processing.

The project is based on the concepts covered in the Socket.IO Client Delivery tutorial.

## What This Project Demonstrates

### 1. At-most-once delivery

A normal:

```js
socket.emit("message", data);
```

does not guarantee that the server received or processed the message.

This is essentially **fire-and-forget / at-most-once delivery**.

---

### 2. Server acknowledgements

The client can provide a callback:

```js
socket.emit("message", data, () => {
    console.log("Server acknowledged");
});
```

The server calls the callback:

```js
socket.on("message", (message, acknowledgement) => {
    // Process message

    acknowledgement();
});
```

This allows the client to know that the server acknowledged the event.

---

### 3. Automatic retries

The client uses:

```js
const socket = io({
    ackTimeout: 5000,
    retries: 3,
});
```

If the server does not acknowledge the message within 5 seconds, Socket.IO retries the message.

This provides **at-least-once delivery**.

---

### 4. Duplicate messages

Retries can cause the same message to reach the server more than once.

Therefore, the server uses a unique message ID:

```js
const messageId = crypto.randomUUID();
```

Example:

```js
{
    id: "abc-123",
    text: "Hello"
}
```

The ID allows the server to determine whether a message has already been processed.

---

### 5. Persistent duplicate detection

Processed message IDs are stored in:

```text
data/messages.json
```

The server checks this file before processing a message.

If the ID already exists:

```text
Duplicate message detected
```

the message is not processed again, but the server still sends an ACK.

Because the IDs are stored in a file, duplicate detection can survive a server restart.

---

### 6. Simulating a lost ACK

The UI contains a:

```text
Simulate lost ACK
```

checkbox.

When enabled:

```text
Client
   |
   | message
   v
Server
   |
   | process + save ID
   |
   X ACK intentionally lost
   |
   v
Client retries
   |
   v
Server
   |
   | ID already exists
   |
   | duplicate detected
   |
   v
ACK
```

This demonstrates why persistent message IDs are useful when using retries.

---

### 7. Manual duplicate testing

The project also contains a:

```text
Send Same ID Again
```

button.

It resends the last message with the exact same ID.

The server recognizes it as a duplicate and does not process it again.

---

## Project Structure

```text
client-delivery-lab/
│
├── data/
│   └── messages.json
│
├── server.js
├── app.js
├── socket.js
│
├── connection/
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

## Architecture

```text
Browser
   |
   | Socket.IO
   v
server.js
   |
   v
HTTP Server
   |
   +------ Express ------> app.js
   |
   +------ Socket.IO ----> socket.js
                              |
                              v
                       connection.js
                              |
                              v
                       messageHandler.js
                              |
                              v
                     data/messages.json
```

## Technologies

- Node.js
- Express
- Socket.IO
- EJS
- JavaScript
- File-system based persistence

## Installation

Clone the project and install dependencies:

```bash
npm install
```

If starting from an empty project:

```bash
npm init -y
npm install express ejs socket.io
```

## Running the Project

Start the server:

```bash
node server.js
```

Then open:

```text
http://localhost:3000
```

## Experiments

### Experiment 1 — Normal ACK

1. Leave **Simulate lost ACK** unchecked.
2. Enter a message.
3. Click **Send Message**.
4. Check the browser and server console.

Expected:

```text
Client → Server → Process → ACK → Client
```

---

### Experiment 2 — Lost ACK + Retry

1. Enable **Simulate lost ACK**.
2. Send a message.
3. The server processes and saves the ID.
4. The server intentionally does not send the ACK.
5. Socket.IO waits for `ackTimeout`.
6. The client retries.
7. The server detects the duplicate.
8. The server sends an ACK.

Expected:

```text
Client → Server → Process → Save ID
                  ↓
                ACK lost
                  ↓
Client ← Retry ← Server
                  ↓
             Duplicate
                  ↓
                ACK
```

---

### Experiment 3 — Manual Duplicate

1. Send a normal message.
2. Wait for the ACK.
3. Click **Send Same ID Again**.
4. Check the server console.

Expected:

```text
Duplicate message detected
```

The server should not process the message again.

---

### Experiment 4 — Persistent Duplicate Detection

1. Send a message.
2. Confirm its ID exists in `data/messages.json`.
3. Restart the server.
4. Resend the same message ID using the **Send Same ID Again** button.

The server can still recognize the message as a duplicate because the ID was persisted to disk.

## Delivery Model

The concepts demonstrated by this project can be summarized as:

```text
socket.emit()
      ↓
At-most-once
      ↓
ACK callback
      ↓
Confirmation
      ↓
ACK timeout + retries
      ↓
At-least-once
      ↓
Retries can cause duplicates
      ↓
Unique message ID
      ↓
Persistent deduplication
      ↓
Exactly-once application effect
```

## Important Note

This project uses a JSON file only to make the concept easy to understand.

In a production application, persistent duplicate detection should normally use a database with appropriate constraints/transactions.

Also, **exactly-once application processing is different from exactly-once network delivery**. The network may deliver an event multiple times; the application prevents those duplicate deliveries from producing the same effect multiple times.

## Learning Goal

The goal of this project is not to build a complete chat application.

It is a focused lab for understanding:

- Socket.IO acknowledgements
- Client retries
- Delivery guarantees
- Message IDs
- Duplicate detection
- Persistent state
- Lost acknowledgements
- At-least-once delivery
- Exactly-once application effects
