const myLogger = function (req, res, next) {
    console.log("LOGGED");
    next();
};

const requestTime = function (req, res, next) {
    req.requestTime = Date.now();
    next();
};

module.exports = { myLogger, requestTime };
