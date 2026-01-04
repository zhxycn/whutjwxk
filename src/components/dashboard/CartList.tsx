type Props = {
  cart: any[];
  removeFromCart: (courseId: string) => void;
  isGrabbing: boolean;
  toggleGrab: () => void;
};

export default function CartList({
  cart,
  removeFromCart,
  isGrabbing,
  toggleGrab,
}: Props) {
  return (
    <div className="flex flex-col h-full">
      {cart.length > 0 ? (
        <>
          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {cart.map((course) => {
              const courseId =
                course.JXBID || course.jxb_id || course.do_jxb_id || course.id;
              let statusClass = "border-gray-200 hover:border-blue-200";
              let statusIcon = "⏳";
              let statusText = "等待中";

              if (course.grabStatus === "success") {
                statusClass = "border-green-200 bg-green-50";
                statusIcon = "✅";
                statusText = "抢课成功";
              } else if (course.grabStatus === "error") {
                statusClass = "border-red-200 bg-red-50";
                statusIcon = "❌";
                statusText = "失败: " + (course.grabMsg || "未知错误");
              } else if (course.grabStatus === "pending") {
                statusClass = "border-yellow-200 bg-yellow-50";
                statusIcon = "🔄";
                statusText = "正在抢...";
              }

              return (
                <div
                  key={courseId || Math.random()}
                  className={`bg-white border p-3 rounded flex justify-between items-center transition ${statusClass}`}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-800">
                        {course.KCM}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({course.SKJS})
                      </span>
                    </div>
                    <div className="text-xs flex items-center gap-1">
                      <span>{statusIcon}</span>
                      <span
                        className={`${
                          course.grabStatus === "error"
                            ? "text-red-600"
                            : "text-gray-600"
                        } truncate max-w-xs`}
                        title={statusText}
                      >
                        {statusText}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(courseId)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition"
                    title="移出列表"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
          <div className="border-t pt-4 bg-gray-50 sticky bottom-0">
            <button
              onClick={toggleGrab}
              className={`w-full p-3 rounded-lg text-lg font-bold transition shadow-md flex justify-center items-center gap-2 ${
                isGrabbing
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              }`}
            >
              {isGrabbing ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>停止抢课</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>开始批量抢课 ({cart.length})</span>
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <div className="text-4xl mb-2">🛒</div>
          <p>待抢列表为空，请前往“可选课程”添加</p>
        </div>
      )}
    </div>
  );
}
