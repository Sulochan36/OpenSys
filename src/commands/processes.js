import {
    getProcessIds,
    getProcessCpuTime,
    getTotalCpuTime,
    getProcessName,
    getProcessStatus,
} from "../utils/proc.js";


export async function processesCommand() {
    const sortBy = process.argv
            .find((arg) => arg.startsWith("--sort="))
            ?.split("=")[1] || "cpu";
    
    if (sortBy !== "cpu" && sortBy !== "memory") {
        console.error(`Invalid sort option: ${sortBy}`);
        console.error("Use --sort=cpu or --sort=memory.");
        return;
    }

    const limitArg = process.argv
        .find((arg) => arg.startsWith("--limit="))
        ?.split("=")[1];

    const limit = limitArg ? Number(limitArg) : null;

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

    for (const pid of pids) {
        try {
            const processEnd = await getProcessCpuTime(pid);

            const processDelta =
                processEnd - processStart.get(pid);

            const systemDelta =systemEnd - systemStart;

            const cpuUsage =(processDelta / systemDelta) * 100;

            const name = await getProcessName(pid);

            const status = await getProcessStatus(pid);

            const memory = getMemoryUsage(status);

            const state = getProcessState(status);

            processes.push({
                pid,
                name: name.trim(),
                state,
                cpu: cpuUsage,
                memory,
            });

        } catch (error) {
            console.error(
                `Error reading process ${pid}:`,
                error.message
            );
        }
    }

    // Sort highest CPU usage first
    if (sortBy === "memory") {
        processes.sort((a, b) => b.memory - a.memory);
    } else {
        processes.sort((a, b) => b.cpu - a.cpu);
    }

    console.log(`Processes (sorted by ${sortBy})`);
    console.log("PID\tNAME\t\tSTATE\tCPU\tMEMORY");
    console.log("---------------------------------------------------------------");

    const displayedProcesses = limit ? processes.slice(0, limit) : processes;

    for (const process of displayedProcesses) {
        console.log(
            `${process.pid}\t${process.name}\t\t${process.state}\t${process.cpu.toFixed(2)}%\t${formatMemory(process.memory)}`
        );
    }
}



function getMemoryUsage(status) {
    const memoryLine = status
        .split("\n")
        .find((line) => line.startsWith("VmRSS:"));

    if (!memoryLine) {
        return 0;
    }

    return Number(memoryLine.split(/\s+/)[1]);
}

function formatMemory(kb) {
    if (kb >= 1024) {
        return `${(kb / 1024).toFixed(1)} MB`;
    }

    return `${kb} kB`;
}

function getProcessState(status) {
    const stateLine = status
        .split("\n")
        .find((line) => line.startsWith("State:"));

    return stateLine
        ? stateLine.split(/\s+/)[1]
        : "?";
}