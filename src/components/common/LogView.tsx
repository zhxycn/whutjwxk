import { useState } from "react";
import { Copy, Check, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { LogItem } from "../../hooks/useLogger";

interface Props {
  log: LogItem[];
  onClear: () => void;
}

const getLevelStyle = (level: string) => {
  switch (level) {
    case "success":
      return "text-emerald-400 font-medium";
    case "error":
      return "text-red-400 font-medium";
    case "warn":
      return "text-amber-400";
    case "info":
    default:
      return "text-gray-300";
  }
};

export default function LogView({ log, onClear }: Props) {
  const [isCopied, setIsCopied] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopy = () => {
    if (log.length === 0) return;
    const text = log
      .map((item) => {
        let line = `[${item.timestamp}] [${item.level.toUpperCase()}] ${item.message}`;
        if (item.details) {
          const detailsStr =
            typeof item.details === "string"
              ? item.details
              : JSON.stringify(item.details, null, 2);
          line += `\n${detailsStr}`;
        }
        return line;
      })
      .join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <span>📝</span> 运行日志
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            disabled={log.length === 0}
            title={isCopied ? "已复制" : "复制日志"}
            className="p-1.5 rounded border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button
            onClick={onClear}
            disabled={log.length === 0}
            title="清空日志"
            className="p-1.5 rounded border border-gray-200 hover:bg-red-50 text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden text-xs font-mono bg-[#1e1e1e] p-3 rounded shadow-inner custom-scrollbar">
        {log.length > 0 ? (
          <div className="flex flex-col gap-1">
            {log.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-1 hover:bg-white/5 px-1 py-0.5 rounded transition-colors"
              >
                <div className="flex gap-2 items-start">
                  <span className="text-gray-500 shrink-0 select-none font-light mt-[2px]">
                    {item.timestamp}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span
                        className={`${getLevelStyle(
                          item.level,
                        )} break-all whitespace-pre-wrap leading-relaxed`}
                      >
                        {item.message}
                      </span>
                      {item.details && (
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="text-gray-500 hover:text-gray-300 transition-colors p-0.5"
                          title={
                            expandedLogs.has(item.id) ? "收起详情" : "展开详情"
                          }
                        >
                          {expandedLogs.has(item.id) ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {item.details && expandedLogs.has(item.id) && (
                  <div className="pl-16 pr-2 pb-2">
                    <pre className="text-[10px] text-gray-400 bg-black/20 p-2 rounded overflow-x-auto custom-scrollbar">
                      {typeof item.details === "string"
                        ? item.details
                        : JSON.stringify(item.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2">
            <span className="text-2xl opacity-20">📋</span>
            <span className="opacity-50">暂无日志...</span>
          </div>
        )}
      </div>
    </div>
  );
}
