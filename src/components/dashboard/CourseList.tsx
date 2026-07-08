import { buildTimeText, buildPlaceText } from "../../utils/schedule";
import { getCourseId, getCapacity, getEnrolled } from "../../utils/course";

type Props = {
  filteredCourses: any[];
  cart: any[];
  addToCart: (course: any) => void;
  expandedGroupId: string | null;
  toggleGroup: (id: string) => void;
};

function CourseCard({
  course,
  isInCart,
  addToCart,
}: {
  course: any;
  isInCart: boolean;
  addToCart: (course: any) => void;
}) {
  const courseId = getCourseId(course);
  const capacity = getCapacity(course);
  const enrolled = getEnrolled(course);
  const isFull = enrolled >= capacity;
  const timeText = buildTimeText(course);
  const placeText = buildPlaceText(course);

  return (
    <div className="bg-white border border-gray-200 p-3 rounded hover:shadow-md hover:border-blue-200 flex justify-between items-center transition group">
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-gray-800 truncate" title={course.KCM}>
            {course.KCM}
          </span>
          <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 whitespace-nowrap">
            {course.XF} 学分
          </span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded border whitespace-nowrap ${
              isFull
                ? "bg-red-50 text-red-600 border-red-100"
                : "bg-green-50 text-green-600 border-green-100"
            }`}
          >
            {enrolled}/{capacity}
          </span>
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-3">
          <span className="flex items-center gap-1">👤 {course.SKJS}</span>
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
        onClick={() => addToCart(course)}
        disabled={isInCart}
        className={`px-3 py-1.5 rounded text-xs font-medium transition shadow-sm whitespace-nowrap flex items-center gap-1 ${
          isInCart
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
            : "bg-blue-600 text-white hover:bg-blue-700 active:transform active:scale-95"
        }`}
      >
        {isInCart ? "已添加" : "+ 加入列表"}
      </button>
    </div>
  );
}

export default function CourseList({
  filteredCourses,
  cart,
  addToCart,
  expandedGroupId,
  toggleGroup,
}: Props) {
  const cartIds = new Set(cart.map(getCourseId));

  return (
    <div className="space-y-2">
      {filteredCourses.map((group, idx) => {
        const isGroup =
          group.tcList &&
          Array.isArray(group.tcList) &&
          group.tcList.length > 0;
        const groupId = group.kcdm || group.id || `group-${idx}`;

        if (!isGroup) {
          const courseId = getCourseId(group);
          return (
            <CourseCard
              key={courseId || `course-${idx}`}
              course={group}
              isInCart={cartIds.has(courseId)}
              addToCart={addToCart}
            />
          );
        }

        const isExpanded = expandedGroupId === groupId;
        return (
          <div
            key={groupId}
            className="border border-gray-200 rounded bg-white overflow-hidden shadow-sm"
          >
            <div
              className="p-3 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100 select-none transition"
              onClick={() => toggleGroup(groupId)}
            >
              <div className="font-bold text-gray-700 flex items-center gap-2">
                <span>{group.KCM}</span>
                <span className="text-xs font-normal text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                  {group.XF}学分 / {group.tcList.length}个班级
                </span>
              </div>
              <div
                className="text-gray-400 transform transition-transform duration-200"
                style={{
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                ▼
              </div>
            </div>

            {isExpanded && (
              <div className="p-2 space-y-2 border-t border-gray-100 bg-gray-50/30">
                {group.tcList.map((course: any, courseIdx: number) => {
                  const courseId = getCourseId(course);
                  return (
                    <CourseCard
                      key={courseId || `course-${courseIdx}`}
                      course={course}
                      isInCart={cartIds.has(courseId)}
                      addToCart={addToCart}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
