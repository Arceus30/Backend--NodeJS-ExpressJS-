const fs = require("node:fs");
const queryString = require("querystring");

const home = (req, res) => {
    console.log("Home");
    const html = fs.readFileSync("./form.html", "utf-8");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(html);
    res.end();
};

const review = (req, res, reviewData) => {
    console.log("Review", review);
    res.writeHead(200);
    res.write(queryString.parse(reviewData).text);
    res.end();
};

module.exports = {
    home,
    review,
};
