interface Props {
  log: string[];
}

export default function LogView({ log }: Props) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0">
      <h3 className="font-bold mb-2 text-gray-800 flex items-center gap-2">
        <span>📝</span> 运行日志
      </h3>
      <div className="flex-1 overflow-y-auto overflow-x-hidden text-xs font-mono bg-gray-900 text-green-400 p-3 rounded shadow-inner leading-relaxed">
        {log.map((l, i) => (
          <div key={i} className="mb-1 border-b border-gray-800 pb-1 last:border-0 wrap-break-word whitespace-pre-wrap">{l}</div>
        ))}
        {log.length === 0 && <div className="text-gray-600 italic">暂无日志...</div>}
      </div>
    </div>
  );
}

