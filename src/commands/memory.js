import { readFile } from "node:fs/promises";

export async function getMemoryStats() {
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

export async function getMemoryUsage() {
    const memory = await getMemoryStats();

    const total = memory.MemTotal;
    const available = memory.MemAvailable;

    const used = total - available;
    const usage = (used / total) * 100;

    return {
        total,
        used,
        available,
        usage,
    };
}

export async function memoryCommand() {
    const memory = await getMemoryUsage();

    console.log(`Memory Usage: ${memory.usage.toFixed(2)}%`);
}