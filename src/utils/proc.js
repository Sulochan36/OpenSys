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