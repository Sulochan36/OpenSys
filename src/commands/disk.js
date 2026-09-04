import { statfs } from "node:fs/promises";

export async function getDiskStats(path = "/") {
    const stats = await statfs(path);

    const total = stats.blocks * stats.bsize;
    const available = stats.bavail * stats.bsize;
    const used = total - available;

    return {
        total,
        used,
        available,
        usage: (used / total) * 100,
    };
}

export async function diskCommand() {
    const disk = await getDiskStats();

    console.log(`Disk Usage: ${disk.usage.toFixed(2)}%`);
}