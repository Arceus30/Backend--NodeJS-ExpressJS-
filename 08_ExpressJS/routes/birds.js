const express = require("express");
const app = express();
const router = express.Router({ mergeParams: true });

router.get("/details", (req, res) => {
    console.log(req.params.birdId);
});

module.exports = router;
