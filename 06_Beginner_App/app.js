const server = require("./server");
const router = require("./router");
const handler = require("./handler");

const handle = {};
handle["/"] = handler.home;
handle["/review"] = handler.review;

server(router, handle);
