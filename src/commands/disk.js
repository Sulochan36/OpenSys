import { statfs } from "node:fs/promises";

async function getDiskStats(path = "/") {
    const stats = await statfs(path);

    const total = stats.blocks * stats.bsize;
    const available = stats.bavail * stats.bsize;
    const used = total - available;

    return {
        total,
        used,
        available,
    };
}

export async function diskCommand() {
    const disk = await getDiskStats();

    const usage = (disk.used / disk.total) * 100;

    console.log(`Disk Usage: ${usage.toFixed(2)}%`);
}