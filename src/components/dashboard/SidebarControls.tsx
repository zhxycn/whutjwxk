interface Batch {
  code: string;
  name: string;
}

interface Props {
  batches: Batch[];
  selectedBatch: string;
  onSelectedBatchChange: (code: string) => void;
  classTypes: Record<string, string>;
  selectedType: string;
  onSelectedTypeChange: (type: string) => void;
  intervalMs: number;
  onIntervalChange: (ms: number) => void;
}

export default function SidebarControls({
  batches,
  selectedBatch,
  onSelectedBatchChange,
  classTypes,
  selectedType,
  onSelectedTypeChange,
  intervalMs,
  onIntervalChange,
}: Props) {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 shrink-0">
      <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
        <span>🛠️</span> 选课控制台
      </h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-500">
            选课批次
          </label>
          <select
            className="w-full p-2 pr-8 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none appearance-none bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
            value={selectedBatch}
            onChange={(e) => onSelectedBatchChange(e.target.value)}
          >
            {batches.map((b) => (
              <option key={b.code} value={b.code}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-500">
            课程类型
          </label>
          <select
            className="w-full p-2 pr-8 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none appearance-none bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
            value={selectedType}
            onChange={(e) => onSelectedTypeChange(e.target.value)}
          >
            {Object.entries(classTypes).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium mb-1 text-gray-500 flex justify-between">
            <span>请求间隔</span>
            <span className="text-blue-600">{intervalMs / 1000} s</span>
          </label>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            value={intervalMs}
            onChange={(e) => onIntervalChange(parseInt(e.target.value))}
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>0.1s</span>
            <span>2.0s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
