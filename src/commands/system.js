import os from "node:os";

export function systemCommand() {
    console.log("OpenSys");
    console.log("--------");

    console.log("OS:", os.type());
    console.log("Kernel:", os.release());
    console.log("Architecture:", os.arch());
    console.log("Hostname:", os.hostname());
    console.log("CPU Cores:", os.cpus().length);
    console.log("Home:", os.homedir());
    console.log("User:", os.userInfo().username);
}