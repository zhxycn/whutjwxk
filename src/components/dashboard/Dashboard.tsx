import { useEffect, useState } from "react";
import { GitCommitHorizontal } from "lucide-react";
import SidebarControls from "./SidebarControls";
import LogView from "../common/LogView";
import FilterHeader from "./FilterHeader";
import DashboardContent from "./DashboardContent";
import ConfirmModal from "../common/ConfirmModal";
import { useLogger } from "../../hooks/useLogger";
import { useBatches } from "../../hooks/useBatches";
import { useCourseData } from "../../hooks/useCourseData";
import { useCourseFilter } from "../../hooks/useCourseFilter";
import { useGrabber } from "../../hooks/useGrabber";

const CLASS_TYPES = {
  TJKC: "本学期应修课程",
  FANKC: "其他方案内课程",
  TYKC: "英语、体育课程",
  XGKC: "通识选修、个性课程",
};

interface Props {
  studentInfo: any | null;
}

export default function Dashboard({ studentInfo }: Props) {
  const [view, setView] = useState<"list" | "selected" | "cart">("list");
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);
  const [courseToDrop, setCourseToDrop] = useState<any>(null);

  const { log, addLog, clearLog } = useLogger();
  const {
    batches,
    selectedBatch,
    setSelectedBatch,
    selectedType,
    setSelectedType,
  } = useBatches(studentInfo);

  const {
    courses,
    selectedCourses,
    loading,
    fetchCourses,
    fetchSelectedCourses,
    handleDropCourse,
  } = useCourseData(selectedBatch, selectedType, addLog);

  const {
    searchTerm,
    setSearchTerm,
    filterDay,
    setFilterDay,
    filterPeriod,
    setFilterPeriod,
    onlyAvailable,
    setOnlyAvailable,
    filteredCourses,
  } = useCourseFilter(courses);

  const {
    cart,
    addToCart,
    removeFromCart,
    isGrabbing,
    toggleGrab,
    intervalMs,
    setIntervalMs,
  } = useGrabber(selectedBatch, selectedType, addLog);

  const toggleGroup = (id: string) => {
    setExpandedGroupId((prev) => (prev === id ? null : id));
  };

  const onDropClick = (course: any) => {
    setCourseToDrop(course);
    setIsDropModalOpen(true);
  };

  const handleConfirmDrop = () => {
    if (courseToDrop) {
      handleDropCourse(courseToDrop);
    }
    setIsDropModalOpen(false);
    setCourseToDrop(null);
  };

  useEffect(() => {
    setExpandedGroupId(null);
  }, [
    view,
    selectedBatch,
    selectedType,
    courses,
    searchTerm,
    filterDay,
    filterPeriod,
    onlyAvailable,
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full relative">
      <div className="md:col-span-4 space-y-4 flex flex-col h-full overflow-hidden">
        <SidebarControls
          batches={batches}
          selectedBatch={selectedBatch}
          onSelectedBatchChange={setSelectedBatch}
          classTypes={CLASS_TYPES}
          selectedType={selectedType}
          onSelectedTypeChange={setSelectedType}
          intervalMs={intervalMs}
          onIntervalChange={setIntervalMs}
        />
        <LogView log={log} onClear={clearLog} />
        <div className="mt-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50">
            <img src="/tauri.svg" alt="Tauri" className="w-5 h-5" />
            <span className="text-xs text-gray-600">Build with Tauri</span>
            <span className="text-gray-300">•</span>
            <a
              href="https://github.com/zhxycn/whutjwxk"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              GitHub
            </a>
            <span className="text-gray-300 hidden lg:inline">•</span>
            <a
              href={`https://github.com/zhxycn/whutjwxk/commit/${__COMMIT_HASH__}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gray-400 hover:text-gray-600 font-mono hidden lg:flex items-center gap-1"
            >
              <GitCommitHorizontal className="w-3 h-3" />
              {__COMMIT_HASH__}
            </a>
          </div>
        </div>
      </div>
      <div className="md:col-span-8 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
        <FilterHeader
          view={view}
          setView={setView}
          filteredCount={filteredCourses.length}
          cartCount={cart.length}
          selectedCount={selectedCourses.length}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterDay={filterDay}
          setFilterDay={setFilterDay}
          filterPeriod={filterPeriod}
          setFilterPeriod={setFilterPeriod}
          onlyAvailable={onlyAvailable}
          setOnlyAvailable={setOnlyAvailable}
          loading={loading}
          selectedBatch={selectedBatch}
          onRefresh={fetchCourses}
          onFetchSelected={fetchSelectedCourses}
        />
        <DashboardContent
          view={view}
          filteredCourses={filteredCourses}
          cart={cart}
          addToCart={addToCart}
          expandedGroupId={expandedGroupId}
          toggleGroup={toggleGroup}
          removeFromCart={removeFromCart}
          isGrabbing={isGrabbing}
          toggleGrab={toggleGrab}
          selectedCourses={selectedCourses}
          onDrop={onDropClick}
        />
      </div>

      <ConfirmModal
        isOpen={isDropModalOpen}
        title="确认退课"
        content={`确定要退掉课程 "${
          courseToDrop?.KCM || courseToDrop?.kcm || ""
        }" 吗？此操作不可撤销！`}
        onConfirm={handleConfirmDrop}
        onCancel={() => setIsDropModalOpen(false)}
        confirmText="确定退课"
        cancelText="我再想想"
      />
    </div>
  );
}
