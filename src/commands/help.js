export function helpCommand() {
    console.log(`
OpenSys — Linux System Monitor

Usage:
  opensys <command>

Commands:
  system       Show system information
  cpu          Show CPU usage
  memory       Show memory usage
  disk         Show disk usage
  uptime       Show system uptime
  processes    Show running processes
  services     Show running system services
  network      Show network interfaces and IP addresses
  docker       Show running Docker containers
  logs         Show recent system logs
`);
}