const express = require("express");
const { saveSMSStatus } = require("../stores/smsStore.js");
const router = express.Router();

router.post(
    "/status",
    express.urlencoded({ extendede: false }),
    async (req, res) => {
        const { MessageSid, MessageStatus } = req.body;
        console.log("---- SMS STATUS WEBHOOK ----");
        console.log("Message ID:", MessageSid);
        console.log("Status:", MessageStatus);

        await saveSMSStatus(MessageSid, MessageStatus);
        res.sendStatus(200);
    },
);
export default router;
