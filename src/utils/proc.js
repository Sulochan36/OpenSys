import { readdir, readFile } from "node:fs/promises";

export async function getProcessIds() {
    const entries = await readdir("/proc");

    return entries
        .filter((entry) => /^\d+$/.test(entry))
        .map(Number)
        .sort((a, b) => a - b);
}

export async function getProcessCpuTime(pid) {
    const data = await readFile(`/proc/${pid}/stat`, "utf-8");

    const closingParen = data.lastIndexOf(")");

    const fields = data
        .slice(closingParen + 2)
        .trim()
        .split(/\s+/);

    const utime = Number(fields[11]);
    const stime = Number(fields[12]);

    return utime + stime;
}

export async function getTotalCpuTime() {
    const data = await readFile("/proc/stat", "utf-8");

    const cpuLine = data
        .split("\n")
        .find((line) => line.startsWith("cpu "));

    const values = cpuLine
        .trim()
        .split(/\s+/)
        .slice(1);

    return values.reduce(
        (total, value) => total + Number(value),
        0
    );
}

export async function getProcessName(pid) {
    const name = await readFile(`/proc/${pid}/comm`, "utf-8");

    return name.trim();
}

export async function getProcessStatus(pid) {
    return await readFile(`/proc/${pid}/status`, "utf-8");
}

export async function getProcesses(sortBy = "cpu", limit = null) {
    const processes = [];
    const pids = await getProcessIds();

    const systemStart = await getTotalCpuTime();

    const processStart = new Map();

    for (const pid of pids) {
        try {
            processStart.set(pid, await getProcessCpuTime(pid));
        } catch {
            // Process may have exited
        }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const systemEnd = await getTotalCpuTime();
    const systemDelta = systemEnd - systemStart;

    for (const pid of pids) {
        try {
            const processEnd = await getProcessCpuTime(pid);
            const startTime = processStart.get(pid);

            if (startTime === undefined) continue;

            const processDelta = processEnd - startTime;
            const cpu = (processDelta / systemDelta) * 100;

            const name = await getProcessName(pid);
            const status = await getProcessStatus(pid);

            const memoryLine = status
                .split("\n")
                .find((line) => line.startsWith("VmRSS:"));

            const memory = memoryLine
                ? Number(memoryLine.split(/\s+/)[1])
                : 0;

            const stateLine = status
                .split("\n")
                .find((line) => line.startsWith("State:"));

            const state = stateLine
                ? stateLine.split(/\s+/)[1]
                : "?";

            processes.push({
                pid,
                name: name.trim(),
                state,
                cpu,
                memory,
            });
        } catch {
            // Process may have exited
        }
    }

    if (sortBy === "memory") {
        processes.sort((a, b) => b.memory - a.memory);
    } else {
        processes.sort((a, b) => b.cpu - a.cpu);
    }

    return limit ? processes.slice(0, limit) : processes;
}