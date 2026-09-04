import { cpuCommand } from "./cpu.js";
import { memoryCommand } from "./memory.js";
import { diskCommand } from "./disk.js";
import { uptimeCommand } from "./uptime.js";
import { getProcesses } from "../utils/proc.js";

export async function watchCommand() {
    await render();

    setInterval(render, 2000);
}

async function render() {
    console.clear();

    console.log("OpenSys Monitor");
    console.log("---------------");

    await cpuCommand();
    await memoryCommand();
    await diskCommand();
    await uptimeCommand();

    const processes = await getProcesses("cpu", 5);

    console.log("\nTop Processes");
    console.log("PID\tNAME\t\tCPU\tMEMORY");
    console.log("---------------------------------------------");

    for (const process of processes) {
        console.log(
            `${process.pid}\t${process.name}\t\t${process.cpu.toFixed(2)}%\t${formatMemory(process.memory)}`
        );
    }
}

function formatMemory(kb) {
    if (kb >= 1024) {
        return `${(kb / 1024).toFixed(1)} MB`;
    }

    return `${kb} kB`;
}