const http = require("http");
const port = 3000;

const startServer = (router, handler) => {
    const onRequest = (req, res) => {
        let reviewData = "";
        req.setEncoding("utf-8");
        req.on("data", (chunk) => {
            reviewData += chunk;
        });
        req.on("end", () => {
            router(handler, req, res, reviewData);
        });
    };

    const server = http.createServer(onRequest);
    server.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
};

module.exports = startServer;
