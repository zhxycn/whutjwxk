import { buildTimeText, buildPlaceText } from "../utils/schedule";

type Props = {
  selectedCourses: any[];
  onDrop: (course: any) => void;
};

export default function SelectedList({ selectedCourses, onDrop }: Props) {
  return (
    <div className="grid gap-2">
      {selectedCourses.map((course) => {
        const timeText = buildTimeText(course);
        const placeText = buildPlaceText(course);
        const courseId =
          course.JXBID || course.jxb_id || course.do_jxb_id || course.id;
        return (
          <div
            key={courseId || Math.random()}
            className="bg-white border border-blue-100 p-3 rounded flex justify-between items-center transition shadow-sm"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">
                  {course.KCM || course.kcm}
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                  {course.XF || course.xf} 学分
                </span>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1">
                  👤 {course.SKJS || course.skjs}
                </span>
                {timeText && <span className="text-gray-300">|</span>}
                {timeText && (
                  <span
                    className="flex items-center gap-1 truncate"
                    title={timeText}
                  >
                    🕒 {timeText}
                  </span>
                )}
              </div>
              <div
                className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate"
                title={placeText}
              >
                <span>📍</span>
                <span>{placeText || "地点未定"}</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1 font-mono">
                ID: {courseId}
              </div>
            </div>
            <button
              onClick={() => onDrop(course)}
              className="bg-red-50 text-red-600 px-3 py-1 rounded text-xs font-medium border border-red-100 hover:bg-red-100 transition"
            >
              退课
            </button>
          </div>
        );
      })}
    </div>
  );
}
