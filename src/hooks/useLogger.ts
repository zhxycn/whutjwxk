import { useState } from "react";

export type LogLevel = "info" | "success" | "warn" | "error";

export interface LogItem {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  details?: any;
}

export function useLogger() {
  const [log, setLog] = useState<LogItem[]>([]);

  const addLog = (msg: string, level: LogLevel = "info", details?: any) => {
    setLog((prev) => {
      const newItem: LogItem = {
        id: Math.random().toString(36).substr(2, 9),
        level,
        message: msg,
        timestamp: new Date().toLocaleTimeString(),
        details,
      };
      const newLogs = [newItem, ...prev];
      return newLogs.slice(0, 200);
    });
  };

  const clearLog = () => {
    setLog([]);
  };

  return { log, addLog, clearLog };
}
