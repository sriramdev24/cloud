const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const clients = [];

app.get("/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Important
    res.flushHeaders();

    clients.push(res);

    console.log("Client connected. Total:", clients.length);

    req.on("close", () => {
        const index = clients.indexOf(res);

        if (index !== -1) {
            clients.splice(index, 1);
        }

        console.log("Client disconnected");
    });
});


app.post("/publish", (req, res) => {

    const { type, message } = req.body;

    console.log("Publishing:", type, message);

    for (const client of clients) {

        client.write(`event: ${type}\n`);
        client.write(`data: ${JSON.stringify({
            message: message
        })}\n\n`);

    }

    res.json({
        success: true
    });
});


app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});