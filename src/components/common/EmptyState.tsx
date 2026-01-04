interface EmptyStateProps {
  view: "list" | "selected" | "cart";
}

export default function EmptyState({ view }: EmptyStateProps) {
  if (view === "list") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <div className="text-4xl mb-2">📚</div>
        <p>暂无课程数据，请先点击左侧“获取课程”</p>
      </div>
    );
  }

  if (view === "selected") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <div className="text-4xl mb-2">📋</div>
        <p>暂无已选课程</p>
      </div>
    );
  }

  return null;
}
