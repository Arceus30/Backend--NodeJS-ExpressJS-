# Socket.IO Room Chat

A learning-focused real-time chat application built with **Node.js, Express, Socket.IO, and EJS**.

The project was created to understand Socket.IO concepts through a small but complete application instead of learning the APIs in isolation.

## What I Learned

### Socket.IO fundamentals
- Creating a Socket.IO server and attaching it to an HTTP server.
- Establishing client-server socket connections.
- Listening for and emitting custom events.
- Understanding the difference between `io`, `socket`, and a client connection.
- Using acknowledgement callbacks to send success/error responses back to the client.
- Handling connection and disconnection events.

### Rooms
- Creating/joining rooms with `socket.join()`.
- Leaving rooms with `socket.leave()`.
- Broadcasting to everyone in a room with `io.to(room).emit()`.
- Broadcasting to everyone in a room except the sender with `socket.to(room).emit()`.
- Broadcasting outside a room with `io.except(room).emit()`.
- Tracking room membership through the Socket.IO adapter.
- Building room switching on top of Socket.IO's ability to allow a socket to belong to multiple rooms.

### User presence
- Tracking usernames using `socket.data`.
- Showing users currently connected to a room.
- Handling `user-joined`, `user-left`, and `user-disconnected` events.
- Updating room member counts when users enter or leave.

### Messaging
- Room-based chat messages.
- Private messages between connected sockets.
- Message timestamps.
- Typing indicators.
- Server-side message validation.
- Basic per-socket rate limiting.

### Persistence
- Saving messages to `data/messages.json`.
- Loading room-specific message history when joining a room.
- Keeping only the latest 100 stored messages.

### Reliability
- Understanding Socket.IO reconnection behavior.
- Listening to Manager-level reconnection events.
- Using Connection State Recovery.
- Understanding `socket.recovered`.
- Handling temporary disconnections and recovered connections.

### Client architecture
- Splitting client-side logic into modules.
- Keeping socket creation/state separate from UI manipulation.
- Registering socket event handlers only once.
- Separating room, user, and message handling.

---

# Architecture

```text
15_Socket_IO_Room/
│
├── app.js
├── server.js
├── socket.js
├── package.json
├── package-lock.json
│
├── data/
│   └── messages.json
│
├── socket/
│   ├── connection.js
│   ├── messageStore.js
│   ├── rateLimiter.js
│   ├── roomUtils.js
│   ├── validation.js
│   │
│   └── handlers/
│       ├── messageHandler.js
│       ├── roomHandler.js
│       └── userHandler.js
│
├── public/
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       ├── index.js
│       ├── messageHandler.js
│       ├── roomHandler.js
│       ├── socket.js
│       ├── state.js
│       ├── ui.js
│       └── userHandler.js
│
└── views/
    └── index.ejs
```

## Server-side responsibilities

### `server.js`

Application entry point.

It:
1. Imports the HTTP server from `app.js`.
2. Initializes Socket.IO through `socket.js`.
3. Starts listening on port `3000`.

```text
server.js
   │
   ├── app.js
   └── socket.js
```

### `app.js`

Creates the Express application and HTTP server.

Responsibilities:
- Configure Express.
- Configure EJS.
- Serve static files.
- Parse JSON and URL-encoded request bodies.
- Render the main page.

### `socket.js`

Creates the Socket.IO server and configures Connection State Recovery.

```text
HTTP Server
     │
     ▼
Socket.IO Server
     │
     ▼
connection.js
```

### `socket/connection.js`

Handles the Socket.IO connection lifecycle.

It:
- Detects new connections.
- Detects recovered connections.
- Registers feature-specific handlers.
- Handles `disconnecting`.
- Handles `disconnect`.
- Updates room state when a socket disappears.

### `socket/handlers/`

Feature-specific server-side event handlers.

- `userHandler.js` — username/user-related events.
- `roomHandler.js` — joining, leaving, and room-related events.
- `messageHandler.js` — room messages, private messages, typing, etc.

### Supporting modules

#### `validation.js`

Contains reusable validation functions for:
- usernames
- room names
- messages

#### `roomUtils.js`

Contains reusable room-related operations such as:
- getting member counts
- getting application rooms
- getting users in a room
- broadcasting room/user information

#### `messageStore.js`

Handles file-based message persistence.

```text
messageHandler
      │
      ▼
messageStore
      │
      ▼
data/messages.json
```

#### `rateLimiter.js`

Provides a simple per-socket message rate limiter.

The current implementation allows up to **10 accepted attempts per 10-second window per socket**.

---

# Client Architecture

The browser-side JavaScript is divided by responsibility.

### `public/js/socket.js`

Creates/manages the Socket.IO client connection.

### `public/js/state.js`

Stores client-side application state such as the current room and selected user.

### `public/js/ui.js`

Contains references to DOM elements and reusable UI functions.

### `public/js/index.js`

Acts as the client-side entry point and registers the feature handlers.

### `public/js/roomHandler.js`

Handles:
- joining rooms
- leaving rooms
- room changes
- room member counts
- room lists
- room history

### `public/js/messageHandler.js`

Handles:
- sending room messages
- sending messages outside a room
- private messages
- receiving messages
- typing indicators

### `public/js/userHandler.js`

Handles:
- user joined
- user left
- user disconnected
- room user list
- connection status

---

# Important Socket.IO Concepts

## `io` vs `socket`

This was one of the important concepts explored in this project.

### `io`

Represents the Socket.IO server.

For example:

```js
io.emit("event", data);
```

Broadcasts to all connected clients.

### `socket`

Represents one particular client connection.

For example:

```js
socket.emit("event", data);
```

sends an event to that particular client.

---

# Rooms

A room is a server-side grouping of sockets.

Example:

```text
Room R1
├── Client A
├── Client C
└── Client F
```

A socket can technically belong to multiple rooms.

This project intentionally treats one room as the user's **active application room** and leaves the previous application room when switching rooms.

## Important room operations

### Join

```js
socket.join(roomName);
```

### Leave

```js
socket.leave(roomName);
```

### Send to everyone in a room

```js
io.to(roomName).emit("new-message", message);
```

### Send to everyone except the current socket

```js
socket.to(roomName).emit("user-joined", user);
```

### Send outside a room

```js
io.except(roomName).emit("new-message", message);
```

---

# Socket.IO Adapter

Socket.IO internally maintains socket-room relationships through its adapter.

This project uses:

```js
io.sockets.adapter.rooms
```

to inspect rooms and their members.

Conceptually:

```text
rooms Map

Room A → { socket1, socket2 }
Room B → { socket3, socket4 }
```

Every socket also has a private room whose name is its own socket ID.

That is why the project filters those private rooms when generating the list of application rooms.

---

# Acknowledgements

The project uses Socket.IO acknowledgements for operations where the sender needs a direct response.

Example:

```js
socket.emit("join-room", roomName, (response) => {
    if (response.success) {
        // joined
    }
});
```

The server responds:

```js
callback({
    success: true,
    message: "Successfully joined the room"
});
```

This gives a useful request/response pattern on top of Socket.IO events.

```text
Client
  │
  │ emit(event, data, callback)
  ▼
Server
  │
  │ callback(response)
  ▼
Client
```

---

# Connection Lifecycle

The important lifecycle events explored are:

```text
connection
    │
    ├── normal connection
    │
    └── recovered connection
             │
             ▼
        normal operation
             │
             ▼
        disconnecting
             │
             ▼
         disconnect
```

## `disconnecting`

The socket is still part of its rooms.

This makes it useful for determining:

```js
socket.rooms
```

before Socket.IO removes the socket from those rooms.

The project uses this stage to notify other room members that the user is disconnecting.

## `disconnect`

The socket has left its rooms.

The project uses this stage to update:
- member counts
- room users
- available rooms
- rate limiter state

---

# Connection State Recovery

The Socket.IO server is configured with:

```js
connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true
}
```

The goal is to allow a temporarily disconnected client to recover its previous Socket.IO state and missed packets within the configured recovery window.

The server checks:

```js
socket.recovered
```

to distinguish between:

```text
New connection
       vs
Recovered connection
```

This project also displays the connection status on the client.

---

# Message Persistence

Messages are stored in:

```text
data/messages.json
```

The flow is:

```text
Client sends message
        │
        ▼
messageHandler.js
        │
        ├── validate message
        ├── rate limit
        ├── verify room membership
        │
        ▼
messageStore.js
        │
        ▼
messages.json
        │
        ▼
broadcast message
```

Only the latest 100 stored messages are retained.

When a user joins a room, the server loads the messages belonging to that room and sends:

```text
room-history
```

to the joining client.

This is a simple learning implementation. A production application would normally use a database rather than synchronous JSON-file storage.

---

# Important Event Flow

## 1. User connects

```text
Browser
   │
   │ Socket.IO connection
   ▼
Socket.IO Server
   │
   ▼
connection.js
   │
   ├── check socket.recovered
   ├── register user handler
   ├── register room handler
   └── register message handler
```

---

## 2. User joins a room

```text
Browser
   │
   │ set-username
   ▼
Server
   │
   ├── validate username
   └── socket.data.username = username
   │
   ▼
Browser
   │
   │ join-room
   ▼
roomHandler.js
   │
   ├── validate room
   ├── check username
   ├── leave old active room
   ├── socket.join(room)
   ├── load room history
   ├── emit room-joined
   ├── notify existing users
   ├── update member count
   ├── update room users
   └── update available rooms
```

---

## 3. User sends a room message

```text
Browser
   │
   │ send-message
   ▼
messageHandler.js
   │
   ├── validate room
   ├── validate message
   ├── check username
   ├── rate limit
   ├── verify room membership
   ├── create message object
   ├── save message
   │
   ▼
io.to(room).emit()
   │
   ├──────────────┐
   ▼              ▼
Client A        Client B
```

The sender also receives the message because `io.to(room).emit()` includes all members of the room.

---

## 4. User joins

The server sends:

```text
user-joined
```

to the other members of the room.

Then the server updates:

```text
room-member-count
room-users
all-rooms
```

---

## 5. User leaves

```text
Browser
   │
   │ leave-room
   ▼
Server
   │
   ├── socket.leave(room)
   ├── acknowledge sender
   ├── notify remaining users
   ├── update member count
   ├── update room users
   └── update room list
```

---

## 6. User disconnects

```text
disconnecting
     │
     ├── remember rooms
     └── notify room members

disconnect
     │
     ├── update room counts
     ├── update room users
     ├── update room list
     └── clear rate limiter
```

---

## 7. Private message

```text
Client A
   │
   │ send-private-message
   │ targetSocketId
   ▼
Server
   │
   ├── validate sender
   ├── validate message
   ├── rate limit
   ├── find target socket
   │
   ▼
io.to(targetSocketId).emit()
   │
   ▼
Client B
```

Unlike a room message, the private message is delivered only to the target socket.

---

## 8. Typing indicator

```text
Client A
   │
   │ typing
   ▼
Server
   │
   │ socket.to(room).emit()
   ▼
Other room members
   │
   ▼
"A is typing..."
```

When typing stops:

```text
stop-typing
      │
      ▼
Other room members
      │
      ▼
clear indicator
```

---

# Running the Project

## 1. Install dependencies

From the project directory:

```bash
npm install
```

## 2. Start normally

```bash
npm start
```

The server runs at:

```text
http://localhost:3000
```

## 3. Start in development mode

```bash
npm run dev
```

This uses Node's watch mode and automatically restarts the server when files change.

---

# How to Test

For the best experience, open the application in multiple browser tabs/windows.

### Basic room test

1. Open the application in two browser tabs.
2. Enter different usernames.
3. Join the same room.
4. Send a message.
5. Verify both clients receive it.
6. Leave the room from one client.
7. Verify the member count and user list update.

### Multiple rooms

1. Client A joins `Room A`.
2. Client B joins `Room B`.
3. Send messages.
4. Verify room messages stay scoped to their rooms.

### Room switching

1. Join `Room A`.
2. Switch to `Room B`.
3. Verify the client leaves the previous active room.
4. Verify room counts and user lists update.

### Private messaging

1. Put two clients in the same room.
2. Select a user from the room user list.
3. Send a private message.
4. Verify only the selected user receives it.

### Typing indicator

1. Start typing from one client.
2. Verify other users see the typing indicator.
3. Stop typing.
4. Verify the indicator disappears.

### Persistence

1. Send messages.
2. Restart the server.
3. Rejoin the room.
4. Verify room history is loaded from `messages.json`.

### Reconnection

1. Connect a client.
2. Temporarily interrupt the connection/server.
3. Restore it.
4. Observe the reconnection messages.
5. Test whether Connection State Recovery succeeds within the configured recovery window.

### Rate limiting

Send more than 10 messages within the same 10-second window from one socket.

The server should reject messages after the configured limit.

---

# Important Lessons

This project helped connect several Socket.IO APIs into one mental model:

```text
socket.emit()
    ↓
one client

io.emit()
    ↓
all clients

socket.to(room).emit()
    ↓
everyone else in the room

io.to(room).emit()
    ↓
everyone in the room

io.except(room).emit()
    ↓
everyone outside the room
```

And:

```text
socket.join(room)
        ↓
socket becomes a room member

socket.leave(room)
        ↓
socket stops being a room member
```

The biggest architectural lesson is that **Socket.IO handles real-time transport and room membership, while the application code is responsible for validation, authorization rules, persistence, UI state, and business logic.**

---

# Limitations

This is a learning project, not a production chat application.

Known simplifications include:

- JSON file storage instead of a database.
- Synchronous file operations in the message store.
- In-memory rate limiting.
- Username setting is not real authentication.
- Socket IDs are used for private-message targeting.
- No persistent user accounts.
- No horizontal scaling or distributed Socket.IO adapter.
- No production-grade authorization system.

These limitations are intentional so the project can focus on understanding Socket.IO fundamentals.

---

# Technologies

- **Node.js**
- **Express**
- **Socket.IO**
- **EJS**
- **HTML/CSS/JavaScript**
- **JSON file storage**

---

# Project Goal

The goal of this project was not to build a production-ready chat application.

The goal was to understand how a real-time application is structured around Socket.IO:

```text
HTTP Server
     │
     ▼
Socket.IO
     │
     ▼
Connection
     │
     ├── Users
     ├── Rooms
     ├── Messages
     ├── Presence
     ├── Reconnection
     └── Persistence
```

After completing this project, the next Socket.IO projects can build on these fundamentals instead of treating the APIs as isolated methods.
