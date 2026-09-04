# OpenSys

> A Linux system monitoring and diagnostics tool built with Node.js, exposing system metrics through a CLI, REST API, WebSocket, and a React dashboard.

OpenSys is a developer-focused Linux monitoring tool that reads system information directly from Linux interfaces such as `/proc`, system commands, and Docker, then exposes that information through multiple interfaces.

The project was built to understand **how Linux system metrics are actually obtained** and how to turn that low-level information into a usable developer tool.

---

## Features

### System Information

Inspect basic information about the current Linux environment:

* Operating system
* Kernel version
* CPU architecture
* Hostname
* CPU cores
* Current user
* Home directory

```bash
opensys system
```

### CPU Monitoring

Calculates CPU utilization using two snapshots of Linux CPU counters from `/proc/stat`.

```bash
opensys cpu
```

### Memory Monitoring

Reads memory information from `/proc/meminfo` and reports:

* Total memory
* Used memory
* Available memory
* Memory utilization

```bash
opensys memory
```

### Disk Monitoring

Uses Linux filesystem statistics to calculate:

* Total disk space
* Used space
* Available space
* Disk utilization

```bash
opensys disk
```

### System Uptime

Reads uptime directly from `/proc/uptime`.

```bash
opensys uptime
```

### Process Explorer

Discovers running processes through `/proc` and reports:

* PID
* Process name
* Process state
* CPU usage
* Memory usage

Processes can be sorted and limited:

```bash
opensys processes
opensys processes --sort=cpu
opensys processes --sort=memory
opensys processes --limit=5
opensys processes --sort=memory --limit=5
```

### System Services

Displays running systemd services.

```bash
opensys services
```

### Network Interfaces

Displays Linux network interfaces, their state, and assigned addresses.

```bash
opensys network
```

### Docker Containers

Displays currently running Docker containers.

```bash
opensys docker
```

### System Logs

Displays recent system journal logs.

```bash
opensys logs
```

### Real-Time Monitoring

OpenSys includes a live terminal monitor that refreshes system metrics periodically.

```bash
opensys watch
```

---

# Architecture

OpenSys separates Linux data collection from the interfaces that consume it.

```text
                         Linux System
                              │
              ┌───────────────┼───────────────┐
              │               │               │
           /proc           systemd          Docker
              │               │               │
              └───────────────┼───────────────┘
                              ↓
                       OpenSys Backend
                              │
                  ┌───────────┼───────────┐
                  │           │           │
                 CLI         REST      WebSocket
                  │           │           │
                  │           │           ↓
                  │           │     React Dashboard
                  │           │
                  └───────────┴─────────────
```

The core metric collection is centralized in:

```text
src/utils/metrics.js
```

This allows the same system data to be consumed by different interfaces without duplicating the collection logic.

---

# Project Structure

```text
opensys/
│
├── src/
│   ├── commands/
│   │   ├── cpu.js
│   │   ├── disk.js
│   │   ├── docker.js
│   │   ├── help.js
│   │   ├── logs.js
│   │   ├── memory.js
│   │   ├── network.js
│   │   ├── processes.js
│   │   ├── services.js
│   │   ├── system.js
│   │   ├── uptime.js
│   │   └── watch.js
│   │
│   ├── utils/
│   │   ├── metrics.js
│   │   └── proc.js
│   │
│   ├── index.js
│   └── server.js
│
├── dashboard/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md
```

---

# Tech Stack

### Backend

* **Node.js**
* **JavaScript (ES Modules)**
* **Express.js**
* **WebSocket (`ws`)**
* Linux `/proc` filesystem
* Linux system utilities
* Docker CLI

### Frontend

* **React**
* **Vite**
* CSS

No database or external monitoring service is required.

---

# Getting Started

## Prerequisites

OpenSys is designed for Linux environments.

You need:

* Linux or WSL2
* Node.js 18+
* npm
* systemd for service monitoring
* Docker for Docker monitoring

> OpenSys was developed and tested inside Ubuntu running through WSL2.

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Sulochan36/OpenSys
cd opensys
```

Install backend dependencies:

```bash
npm install
```

Because OpenSys is configured as an executable package, link it locally:

```bash
npm link
```

You can now use:

```bash
opensys help
```

---

# 🖥️ CLI Usage

General usage:

```bash
opensys <command>
```

Available commands:

```text
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
watch        Show live system metrics
```

---

# REST API

Start the OpenSys server:

```bash
node src/server.js
```

The API runs on:

```text
http://localhost:3000
```

### Available endpoints

| Endpoint         | Description        |
| ---------------- | ------------------ |
| `/api/system`    | System information |
| `/api/cpu`       | CPU utilization    |
| `/api/memory`    | Memory statistics  |
| `/api/disk`      | Disk statistics    |
| `/api/processes` | Top processes      |

Example:

```bash
curl http://localhost:3000/api/system
```

Example response:

```json
{
  "os": "Linux",
  "kernel": "6.x.x",
  "architecture": "x64",
  "hostname": "ubuntu",
  "cpuCores": 8
}
```

---

# WebSocket

OpenSys also exposes live system metrics through WebSocket.

Connect to:

```text
ws://localhost:3000
```

Clients receive metric updates periodically.

Example message:

```json
{
  "type": "metrics",
  "timestamp": "2026-09-04T18:00:00.000Z",
  "cpu": 12.42,
  "memory": {
    "usage": 48.21,
    "total": 16000000,
    "used": 7700000,
    "available": 8300000
  },
  "disk": {
    "usage": 31.72,
    "total": 50000000000,
    "used": 15000000000,
    "available": 35000000000
  },
  "uptime": 20482,
  "processes": []
}
```

---

# React Dashboard

The project includes a React + Vite dashboard for real-time monitoring.

Start the backend:

```bash
node src/server.js
```

Then start the dashboard:

```bash
cd dashboard
npm install
npm run dev
```

Open the Vite development URL shown in the terminal.

The dashboard consumes:

* REST API for system information
* WebSocket for live metrics

---

# Linux Concepts Used

One of the main goals of OpenSys was to understand Linux rather than hide it behind a monitoring library.

### `/proc`

OpenSys reads several kernel-provided interfaces:

```text
/proc/stat
/proc/meminfo
/proc/uptime
/proc/<pid>/stat
/proc/<pid>/status
/proc/<pid>/comm
```

For example:

```text
/proc/stat
    ↓
CPU counters
    ↓
take snapshot A
    ↓
wait
    ↓
take snapshot B
    ↓
calculate CPU utilization
```

### Process monitoring

Linux represents processes as directories inside `/proc`:

```text
/proc/1
/proc/42
/proc/1234
...
```

OpenSys discovers numeric directories to identify running processes.

### systemd

Service information is obtained through:

```bash
systemctl
```

### Networking

Network interfaces are inspected through:

```bash
ip
```

### Docker

Running containers are obtained through:

```bash
docker ps
```

### Logs

Recent system logs are obtained through:

```bash
journalctl
```

---

# Why I Built This

OpenSys started as a project to learn Linux system internals and backend development by building something instead of only reading about it.

The project helped explore:

* Linux `/proc` filesystem
* CPU utilization calculations
* Memory statistics
* Process monitoring
* Filesystem statistics
* systemd
* Linux networking
* Docker
* system logs
* Node.js system APIs
* CLI development
* REST APIs
* WebSockets
* Real-time data streaming
* React frontend integration

The goal wasn't to replace tools such as `htop`, `btop`, or production monitoring platforms.

The goal was to understand **how a system-monitoring tool can be built from the underlying operating-system interfaces**.

---

# Possible Future Improvements

OpenSys v1 focuses on the core monitoring pipeline.

Potential future improvements include:

* historical metric graphs
* network bandwidth statistics
* process detail views
* process filtering/search
* Docker resource statistics
* configurable refresh intervals
* alerts
* configurable API port
* automated tests
* npm package publishing
* improved CLI argument parsing
* additional Linux distribution support

These are intentionally outside the current v1 scope.

---

# Current Limitations

* Designed primarily for Linux environments.
* Some commands depend on system utilities being installed.
* Docker monitoring requires Docker to be available.
* systemd monitoring requires a systemd-enabled environment.
* WSL environments can expose behavior different from a native Linux installation.
* CPU/process measurements are based on Linux kernel counters and periodic snapshots.

---

# Project Status

**OpenSys v1 — MVP complete**

The current version provides:

```text
✓ Linux system information
✓ CPU monitoring
✓ Memory monitoring
✓ Disk monitoring
✓ Process monitoring
✓ System uptime
✓ systemd services
✓ Network interfaces
✓ Docker containers
✓ System logs
✓ CLI
✓ REST API
✓ WebSocket
✓ Real-time React dashboard
```

---

