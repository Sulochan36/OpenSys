import express from "express";
import os from "node:os";
import { WebSocketServer } from "ws";

import { getCpuUsage } from "./commands/cpu.js";
import { getMemoryUsage } from "./commands/memory.js";
import { getDiskStats } from "./commands/disk.js";
import { getProcesses } from "./utils/proc.js";
import { collectMetrics } from "./utils/metrics.js";

const app = express();

const PORT = 3000;

// Allow the Vite dashboard to access the API.
app.use((req, res, next) => {
    res.setHeader(
        "Access-Control-Allow-Origin",
        "http://localhost:5174"
    );

    next();
});

app.get("/api/system", (req, res) => {
    res.json({
        os: os.type(),
        kernel: os.release(),
        architecture: os.arch(),
        hostname: os.hostname(),
        cpuCores: os.cpus().length,
        home: os.homedir(),
        user: os.userInfo().username,
    });
});

app.get("/api/cpu", async (req, res) => {
    try {
        const usage = await getCpuUsage();

        res.json({
            usage: Number(usage.toFixed(2)),
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to read CPU usage",
        });
    }
});

app.get("/api/memory", async (req, res) => {
    try {
        const memory = await getMemoryUsage();

        res.json(memory);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to read memory usage",
        });
    }
});

app.get("/api/disk", async (req, res) => {
    try {
        const disk = await getDiskStats();

        res.json(disk);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to read disk usage",
        });
    }
});

app.get("/api/processes", async (req, res) => {
    try {
        const processes = await getProcesses("cpu", 10);

        res.json(processes);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to read processes",
        });
    }
});

const server = app.listen(PORT, () => {
    console.log(
        `OpenSys API running on http://localhost:${PORT}`
    );
});

const wss = new WebSocketServer({
    server,
});

wss.on("connection", (socket) => {
    console.log("WebSocket client connected");

    socket.send(
        JSON.stringify({
            type: "connected",
            message: "Connected to OpenSys",
        })
    );

    socket.on("close", () => {
        console.log("WebSocket client disconnected");
    });
});

let collecting = false;
let collectionTimer = null;

async function broadcastMetrics() {
    if (wss.clients.size === 0) {
        scheduleNextCollection();
        return;
    }

    if (collecting) {
        return;
    }

    collecting = true;

    try {
        const metrics = await collectMetrics(5);

        const message = JSON.stringify({
            type: "metrics",
            ...metrics,
        });

        for (const client of wss.clients) {
            if (client.readyState === 1) {
                client.send(message);
            }
        }
    } catch (error) {
        console.error(
            "Failed to collect metrics:",
            error.message
        );
    } finally {
        collecting = false;
        scheduleNextCollection();
    }
}

function scheduleNextCollection() {
    collectionTimer = setTimeout(
        broadcastMetrics,
        2000
    );
}

scheduleNextCollection();

let shuttingDown = false;

function shutdown() {
    if (shuttingDown) {
        return;
    }

    shuttingDown = true;

    console.log("\nShutting down OpenSys...");

    // Stop scheduling new metric collections.
    if (collectionTimer) {
        clearTimeout(collectionTimer);
    }

    // Close all active WebSocket clients first.
    for (const client of wss.clients) {
        client.close();
    }

    // Now the WebSocket server can close.
    wss.close(() => {
        server.close(() => {
            console.log("OpenSys stopped.");
            process.exit(0);
        });
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);