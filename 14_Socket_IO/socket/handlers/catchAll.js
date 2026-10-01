function registerCatchAllHandlers(socket) {
    // `onAny()` is a catch-all listener.
    // Instead of listening for one specific event, it listens for EVERY incoming event received by this socket.
    // `eventName` contains the name of the event.
    // `...args` contains all arguments sent with that event.
    // socket.onAny((eventName, ...args) =>
    //     console.log(`Incoming Event: ${eventName}: ${args}`),
    // );
    // `onAnyOutgoing()` is similar, but watches events that are being sent OUT from the server through this socket.
    // This is particularly useful while learning/debugging because you can see Socket.IO traffic without manually adding a console.log to every event handler.
    // socket.onAnyOutgoing((eventName, ...args) =>
    //     console.log(`Outgoing Event: ${eventName}: ${args}`),
    // );
}

module.exports = registerCatchAllHandlers;
