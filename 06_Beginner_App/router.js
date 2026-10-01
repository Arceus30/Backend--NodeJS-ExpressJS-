const router = (handle, req, res, reviewData) => {
    if (typeof handle[req.url] === "function") {
        handle[req.url](req, res, reviewData);
    } else {
        res.writeHead(404);
        res.write(JSON.stringify({ message: "Page not found" }));
        res.end();
    }
};

module.exports = router;
