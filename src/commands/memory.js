import { readFile } from "node:fs/promises";

async function getMemoryStats() {
    const data = await readFile("/proc/meminfo", "utf-8");

    const lines = data.split("\n");

    const memory = {};

    for (const line of lines) {
        const [key, value] = line.split(/\s+/);

        if (key && value) {
            memory[key.replace(":", "")] = Number(value);
        }
    }

    return memory;
}

export async function memoryCommand() {
    const memory = await getMemoryStats();

    const total = memory.MemTotal;
    const available = memory.MemAvailable;

    const used = total - available;
    const usage = (used / total) * 100;

    console.log(`Memory Usage: ${usage.toFixed(2)}%`);
}