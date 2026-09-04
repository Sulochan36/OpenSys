import { getCpuUsage } from "../commands/cpu.js";
import { getMemoryUsage } from "../commands/memory.js";
import { getDiskStats } from "../commands/disk.js";
import { getUptime } from "../commands/uptime.js";
import { getProcesses } from "./proc.js";

export async function collectMetrics(processLimit = 5) {
    const [
        cpu,
        memory,
        disk,
        uptime,
        processes,
    ] = await Promise.all([
        getCpuUsage(),
        getMemoryUsage(),
        getDiskStats(),
        getUptime(),
        getProcesses("cpu", processLimit),
    ]);

    return {
        timestamp: new Date().toISOString(),

        cpu: Number(cpu.toFixed(2)),

        memory: {
            usage: Number(memory.usage.toFixed(2)),
            total: memory.total,
            used: memory.used,
            available: memory.available,
        },

        disk: {
            usage: Number(disk.usage.toFixed(2)),
            total: disk.total,
            used: disk.used,
            available: disk.available,
        },

        uptime,

        processes,
    };
}