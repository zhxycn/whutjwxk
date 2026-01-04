import { useState } from "react";

export function useLogger() {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLog((prev) => {
      const newLogs = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev];
      return newLogs.slice(0, 200);
    });
  };

  return { log, addLog };
}
