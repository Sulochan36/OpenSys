import { useEffect, useState } from "react";

function App() {
  const [metrics, setMetrics] = useState(null);
  const [system, setSystem] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/api/system")
      .then((response) => response.json())
      .then((data) => setSystem(data))
      .catch((error) => console.error("System info error:", error));
  }, []);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      setConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "metrics") {
        setMetrics(data);
      }
    };

    socket.onclose = () => {
      setConnected(false);
    };

    socket.onerror = () => {
      setConnected(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="logo">
            O
          </div>

          <div>
            <h1>OpenSys</h1>
            <p>Linux System Monitor</p>
          </div>
        </div>

        <div className={`connection ${connected ? "online" : "offline"}`}>
          <span className="connection-dot"></span>
          {connected ? "Live" : "Disconnected"}
        </div>
      </header>

      {!metrics ? (
        <div className="loading">
          <div className="loader"></div>
          <p>Connecting to OpenSys...</p>
        </div>
      ) : (
        <>
          <section className="metrics-grid">
            <MetricCard
              title="CPU"
              value={metrics.cpu}
              unit="%"
              progress={metrics.cpu}
            />

            <MetricCard
              title="Memory"
              value={metrics.memory.usage}
              unit="%"
              progress={metrics.memory.usage}
            />

            <MetricCard
              title="Disk"
              value={metrics.disk.usage}
              unit="%"
              progress={metrics.disk.usage}
            />
          </section>

          <section className="content-grid">
            <div className="panel system-panel">
              <PanelHeader
                title="System"
                subtitle="Host information"
              />

              {system ? (
                <div className="system-info">
                  <InfoRow
                    label="OS"
                    value={system.os}
                  />
                  <InfoRow
                    label="Kernel"
                    value={system.kernel}
                  />
                  <InfoRow
                    label="Architecture"
                    value={system.architecture}
                  />
                  <InfoRow
                    label="CPU Cores"
                    value={system.cpuCores}
                  />
                  <InfoRow
                    label="Hostname"
                    value={system.hostname}
                  />
                  <InfoRow
                    label="User"
                    value={system.user}
                  />
                </div>
              ) : (
                <p className="muted">Loading system info...</p>
              )}
            </div>

            <div className="panel">
              <PanelHeader
                title="Runtime"
                subtitle="Current system state"
              />

              <div className="runtime">
                <div className="runtime-item">
                  <span>Uptime</span>
                    <strong>
                      {formatUptime(metrics.uptime)}
                    </strong>
                </div>

                <div className="runtime-item">
                  <span>Updated</span>
                  <strong>
                    {new Date(
                      metrics.timestamp
                    ).toLocaleTimeString()}
                  </strong>
                </div>

                <div className="runtime-item">
                  <span>Processes tracked</span>
                  <strong>
                    {metrics.processes.length}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <section className="panel process-panel">
            <PanelHeader
              title="Top Processes"
              subtitle="Highest CPU usage"
            />

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>PID</th>
                    <th>PROCESS</th>
                    <th>STATE</th>
                    <th>CPU</th>
                    <th>MEMORY</th>
                  </tr>
                </thead>

                <tbody>
                  {metrics.processes.map((process) => (
                    <tr key={process.pid}>
                      <td className="pid">
                        {process.pid}
                      </td>

                      <td className="process-name">
                        {process.name}
                      </td>

                      <td>
                        <span className="state">
                          {process.state}
                        </span>
                      </td>

                      <td>
                        {process.cpu.toFixed(2)}%
                      </td>

                      <td>
                        {formatMemory(
                          process.memory
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <footer>
            OpenSys • Linux System Monitor
          </footer>
        </>
      )}
    </div>
  );
}

function MetricCard({ title, value, unit, progress }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{title}</span>
        <span className="metric-icon">◈</span>
      </div>

      <div className="metric-value">
        <strong>{value.toFixed(1)}</strong>
        <span>{unit}</span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

function PanelHeader({ title, subtitle }) {
  return (
    <div className="panel-header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatMemory(kb) {
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(1)} MB`;
  }

  return `${kb} kB`;
}

function formatUptime(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  totalSeconds %= 86400;

  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export default App;