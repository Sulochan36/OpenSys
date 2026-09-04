import { readFile } from "node:fs/promises";

async function getCpuStats() {
    const data = await readFile("/proc/stat", "utf-8");

    const cpuLine = data
        .split("\n")
        .find((line) => line.startsWith("cpu "));

    const values = cpuLine.trim().split(/\s+/);

    const [
        ,
        user,
        nice,
        system,
        idle,
        iowait,
        irq,
        softirq,
        steal,
        guest,
        guestNice,
    ] = values;

    return {
        user: Number(user),
        nice: Number(nice),
        system: Number(system),
        idle: Number(idle),
        iowait: Number(iowait),
        irq: Number(irq),
        softirq: Number(softirq),
        steal: Number(steal),
        guest: Number(guest),
        guestNice: Number(guestNice),
    };
}

async function getCpuUsage() {
    const first = await getCpuStats();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const second = await getCpuStats();

    const idleDelta =
        second.idle +
        second.iowait -
        (first.idle + first.iowait);

    const totalFirst = Object.values(first).reduce(
        (sum, value) => sum + value,
        0
    );

    const totalSecond = Object.values(second).reduce(
        (sum, value) => sum + value,
        0
    );

    const totalDelta = totalSecond - totalFirst;

    return ((totalDelta - idleDelta) / totalDelta) * 100;
}

export async function cpuCommand() {
    const usage = await getCpuUsage();

    console.log(`CPU Usage: ${usage.toFixed(2)}%`);
}