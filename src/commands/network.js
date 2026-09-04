import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function networkCommand() {
    const { stdout } = await execFileAsync("ip", ["-brief", "addr"]);

    console.log("INTERFACE\tSTATE\tADDRESS");
    console.log("--------------------------------------------");

    for (const line of stdout.trim().split("\n")) {
        const parts = line.trim().split(/\s+/);

        const interfaceName = parts[0];
        const state = parts[1];
        const addresses = parts.slice(2).join(", ");

        console.log(`${interfaceName}\t${state}\t${addresses}`);
    }
}