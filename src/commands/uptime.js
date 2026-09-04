import { readFile } from "node:fs/promises";

async function getUptime() {
    const data = await readFile("/proc/uptime", "utf-8");

    const seconds = Number(data.split(/\s+/)[0]);

    return seconds;
}

export async function uptimeCommand() {
    const seconds = await getUptime();

    console.log(`Uptime: ${formatUptime(seconds)}`);
}

function formatUptime(totalSeconds) {
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;

    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}