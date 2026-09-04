#!/usr/bin/env node

import { systemCommand } from "./commands/system.js";
import { cpuCommand } from "./commands/cpu.js";
import { memoryCommand } from "./commands/memory.js";
import { diskCommand } from "./commands/disk.js";
import { processesCommand } from "./commands/processes.js";
import { uptimeCommand } from "./commands/uptime.js";
import { helpCommand } from "./commands/help.js";
import { servicesCommand } from "./commands/services.js";
import { networkCommand } from "./commands/network.js";
import { dockerCommand } from "./commands/docker.js";
import { logsCommand } from "./commands/logs.js";
import { watchCommand } from "./commands/watch.js";

const command = process.argv[2];

try {
    if (command === "system") {
        systemCommand();
    } else if (command === "cpu") {
        await cpuCommand();
    } else if (command === "memory") {
        await memoryCommand();
    } else if (command === "disk") {
        await diskCommand();
    } else if (command === "processes") {
        await processesCommand();
    } else if (command === "uptime") {
        await uptimeCommand();
    } else if (command === "help" || !command) {
        helpCommand();
    } else if (command === "services") {
        await servicesCommand();
    } else if (command === "network") {
        await networkCommand();
    } else if (command === "docker") {
        await dockerCommand();
    } else if (command === "logs") {
        await logsCommand();
    } else if (command === "watch") {
        await watchCommand();
    } else {
        console.error(`Unknown command: ${command}`);
        console.error("Run 'opensys help' to see available commands.");
        process.exitCode = 1;
    }
} catch (error) {
    console.error("OpenSys error:", error.message);
    process.exitCode = 1;
}