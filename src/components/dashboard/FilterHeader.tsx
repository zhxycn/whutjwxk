import { X } from "lucide-react";

interface FilterHeaderProps {
  view: "list" | "selected" | "cart";
  setView: (view: "list" | "selected" | "cart") => void;
  filteredCount: number;
  cartCount: number;
  selectedCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterDay: string;
  setFilterDay: (day: string) => void;
  filterPeriod: string;
  setFilterPeriod: (period: string) => void;
  onlyAvailable: boolean;
  setOnlyAvailable: (val: boolean) => void;
  loading: boolean;
  selectedBatch: string;
  selectedType: string;
  onRefresh: () => void;
  onFetchSelected: () => void;
}

export default function FilterHeader({
  view,
  setView,
  filteredCount,
  cartCount,
  selectedCount,
  searchTerm,
  setSearchTerm,
  filterDay,
  setFilterDay,
  filterPeriod,
  setFilterPeriod,
  onlyAvailable,
  setOnlyAvailable,
  loading,
  selectedBatch,
  selectedType,
  onRefresh,
  onFetchSelected,
}: FilterHeaderProps) {
  const hasSearch = searchTerm.trim().length > 0;
  return (
    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div className="flex gap-6">
          <button
            className={`pb-1 text-sm font-medium transition-colors ${
              view === "list"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setView("list")}
          >
            可选课程
          </button>
          <button
            className={`pb-1 text-sm font-medium transition-colors ${
              view === "cart"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setView("cart")}
          >
            待抢列表 ({cartCount})
          </button>
          <button
            className={`pb-1 text-sm font-medium transition-colors ${
              view === "selected"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => {
              setView("selected");
              onFetchSelected();
            }}
          >
            已选课程
          </button>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
          {view === "list"
            ? `${filteredCount} 组课程`
            : view === "cart"
              ? cartCount
              : selectedCount}
        </span>
      </div>
      {view === "list" && (
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative w-full md:flex-1 min-w-0">
            <input
              type="text"
              placeholder="搜索课程/教师/编号... (支持正则表达式)"
              className={`w-full pl-8 ${hasSearch ? "pr-8" : "pr-3"} py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-2.5 top-1.5 text-gray-400 text-xs">
              🔍
            </span>
            {hasSearch && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                title="清空"
                aria-label="清空"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <select
              className="p-1.5 pr-8 text-xs border border-gray-300 rounded outline-none bg-white text-gray-600 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-size-[1.25rem_1.25rem] bg-position-[right_0.25rem_center] bg-no-repeat"
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
            >
              <option value="">所有星期</option>
              <option value="1">星期一</option>
              <option value="2">星期二</option>
              <option value="3">星期三</option>
              <option value="4">星期四</option>
              <option value="5">星期五</option>
              <option value="6">星期六</option>
              <option value="7">星期日</option>
            </select>
            <select
              className="p-1.5 pr-8 text-xs border border-gray-300 rounded outline-none bg-white text-gray-600 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-size-[1.25rem_1.25rem] bg-position-[right_0.25rem_center] bg-no-repeat"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <option value="">所有节次</option>
              {[...Array(13)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  第 {i + 1} 节
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none bg-white px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
              />
              只看可选
            </label>
            <button
              onClick={onRefresh}
              disabled={loading || !selectedBatch || !selectedType}
              className={`flex itemsCenter gap-1.5 text-xs px-2 py-1.5 rounded border transition ${
                loading
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
              title="刷新课程列表"
            >
              <span>🔄</span>
              刷新
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
