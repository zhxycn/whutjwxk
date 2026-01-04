import { useEffect, useRef, useState } from "react";
import {
  getCourseList,
  getSelectedCourses as apiGetSelectedCourses,
  grabCourse as apiGrabCourse,
  dropCourse as apiDropCourse,
} from "../services/jwxk";
import SidebarControls from "./SidebarControls";
import LogView from "./LogView";
import CourseList from "./CourseList";
import CartList from "./CartList";
import SelectedList from "./SelectedList";

interface Batch {
  code: string;
  name: string;
  beginTime?: string;
  endTime?: string;
}

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
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLog((prev) => {
      const newLogs = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev];
      return newLogs.slice(0, 200);
    });
  };

  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("TJKC");
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [view, setView] = useState<"list" | "selected" | "cart">("list");
  const [intervalMs, setIntervalMs] = useState(500);
  const intervalRef = useRef(intervalMs);
  useEffect(() => {
    intervalRef.current = intervalMs;
  }, [intervalMs]);

  const [isGrabbing, setIsGrabbing] = useState(false);
  const isGrabbingRef = useRef(false);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  useEffect(() => {
    if (
      studentInfo?.electiveBatchList &&
      studentInfo.electiveBatchList.length > 0
    ) {
      setBatches(studentInfo.electiveBatchList);
      setSelectedBatch(studentInfo.electiveBatchList[0].code);
    }
  }, [studentInfo]);

  const filteredCourses = courses
    .map((group) => {
      const filterSection = (section: any) => {
        const searchLower = searchTerm.toLowerCase();
        if (searchLower) {
          const match =
            (section.KCM && section.KCM.toLowerCase().includes(searchLower)) ||
            (section.SKJS &&
              section.SKJS.toLowerCase().includes(searchLower)) ||
            (section.JXBID && section.JXBID.includes(searchLower)) ||
            (section.id && section.id.includes(searchLower));
          if (!match) return false;
        }

        if (filterDay) {
          const sksj = section.SKSJ || [];
          const matchDay = sksj.some((s: any) => s.SKXQ === filterDay);
          if (!matchDay) return false;
        }

        if (filterPeriod) {
          const p = parseInt(filterPeriod);
          const sksj = section.SKSJ || [];
          const matchPeriod = sksj.some((s: any) => {
            const start = parseInt(s.KSJC);
            const end = parseInt(s.JSJC);
            return p >= start && p <= end;
          });
          if (!matchPeriod) return false;
        }

        if (onlyAvailable) {
          const capacity =
            section.KCRL ||
            section.JXBRL ||
            section.jxbrl ||
            section.zrs ||
            section.KRL ||
            section.classCapacity ||
            0;
          const enrolled =
            section.YXRS || section.yxrs || section.numberOfSelected || 0;
          if (enrolled >= capacity) return false;

          if (
            section.SFCT === "1" ||
            (section.conflictDesc && section.conflictDesc.length > 0)
          )
            return false;
        }

        return true;
      };

      if (group.tcList && Array.isArray(group.tcList)) {
        const filteredTcList = group.tcList.filter(filterSection);
        if (filteredTcList.length === 0) return null;
        return { ...group, tcList: filteredTcList };
      } else {
        return filterSection(group) ? group : null;
      }
    })
    .filter(Boolean);

  const toggleGroup = (id: string) => {
    setExpandedGroupId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    setExpandedGroupId(null);
  }, [view, selectedBatch, selectedType, courses]);

  const addToCart = (course: any) => {
    const courseId =
      course.JXBID || course.jxb_id || course.do_jxb_id || course.id;
    if (
      cart.some(
        (c) => (c.JXBID || c.jxb_id || c.do_jxb_id || c.id) === courseId
      )
    ) {
      addLog(`${course.KCM} 已经在待抢列表中`);
      return;
    }
    setCart((prev) => [...prev, { ...course, grabStatus: "idle" }]);
    addLog(`已添加 ${course.KCM} 到待抢列表`);
  };

  const removeFromCart = (courseId: string) => {
    setCart((prev) =>
      prev.filter(
        (c) => (c.JXBID || c.jxb_id || c.do_jxb_id || c.id) !== courseId
      )
    );
  };

  const cartRef = useRef(cart);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const runGrabLoop = async () => {
    let consecutiveAuthFailures = 0;
    while (isGrabbingRef.current) {
      const currentCart = cartRef.current;
      let pendingCount = 0;
      let authFailed = false;

      for (let i = 0; i < currentCart.length; i++) {
        if (!isGrabbingRef.current) break;
        const item = currentCart[i];
        if (item.grabStatus === "success") continue;
        pendingCount++;
        const clazzId = item.JXBID || item.jxb_id || item.do_jxb_id || item.id;
        setCart((prev) =>
          prev.map((c) => {
            const cId = c.JXBID || c.jxb_id || c.do_jxb_id || c.id;
            return cId === clazzId ? { ...c, grabStatus: "pending" } : c;
          })
        );

        try {
          addLog(`正在抢 ${item.KCM} (${i + 1}/${currentCart.length})...`);
          const res: any = await apiGrabCourse(
            clazzId,
            item.secretVal || "",
            selectedBatch,
            selectedType
          );
          if (res.code === 200) {
            consecutiveAuthFailures = 0;
            addLog(`成功! 已抢到 ${item.KCM}: ${res.msg || "无消息"}`);
            setCart((prev) =>
              prev.map((c) => {
                const cId = c.JXBID || c.jxb_id || c.do_jxb_id || c.id;
                return cId === clazzId
                  ? { ...c, grabStatus: "success", grabMsg: res.msg }
                  : c;
              })
            );
          } else {
            if (
              res.msg &&
              (res.msg.includes("登录") ||
                res.msg.includes("login") ||
                res.code === 401)
            ) {
              consecutiveAuthFailures++;
              if (consecutiveAuthFailures >= 5) {
                authFailed = true;
                break;
              }
            } else {
              consecutiveAuthFailures = 0;
              addLog(`抢课失败 ${item.KCM}: ${res.msg}`);
              setCart((prev) =>
                prev.map((c) => {
                  const cId = c.JXBID || c.jxb_id || c.do_jxb_id || c.id;
                  return cId === clazzId
                    ? { ...c, grabStatus: "error", grabMsg: res.msg }
                    : c;
                })
              );
            }
          }
        } catch (e: any) {
          const errorMsg = String(e);
          addLog(`抢课错误 ${item.KCM}: ${errorMsg}`);
          setCart((prev) =>
            prev.map((c) => {
              const cId = c.JXBID || c.jxb_id || c.do_jxb_id || c.id;
              return cId === clazzId
                ? { ...c, grabStatus: "error", grabMsg: errorMsg }
                : c;
            })
          );
          if (errorMsg.includes("logged in")) {
            consecutiveAuthFailures++;
            if (consecutiveAuthFailures >= 5) {
              authFailed = true;
              break;
            }
          } else {
            consecutiveAuthFailures = 0;
          }
        }

        if (isGrabbingRef.current) {
          await new Promise((r) => setTimeout(r, intervalRef.current));
        }
      }

      if (authFailed) {
        isGrabbingRef.current = false;
        setIsGrabbing(false);
        addLog("连续5次检测到登录失效，停止抢课");
        break;
      }
      if (pendingCount === 0) {
        isGrabbingRef.current = false;
        setIsGrabbing(false);
        addLog("所有课程已抢到，停止抢课");
        break;
      }
      if (pendingCount > 0 && isGrabbingRef.current) {
        addLog(`本轮结束，等待 ${intervalRef.current / 1000}s 后开始下一轮...`);
        await new Promise((r) => setTimeout(r, intervalRef.current));
      }
    }
    setLoading(false);
    setIsGrabbing(false);
  };

  const toggleGrab = () => {
    if (isGrabbing) {
      isGrabbingRef.current = false;
      setIsGrabbing(false);
      addLog("正在停止...");
    } else {
      if (cart.length === 0) {
        addLog("待抢列表为空");
        return;
      }
      setIsGrabbing(true);
      isGrabbingRef.current = true;
      setLoading(true);
      runGrabLoop();
    }
  };

  const fetchCourses = async () => {
    if (!selectedBatch) {
      addLog("请先选择选课批次");
      return;
    }
    setLoading(true);
    try {
      addLog(`正在获取课程列表: ${selectedType}...`);
      const PAGE_SIZE = 1000;
      const allRows: any[] = [];
      let page = 1;
      while (true) {
        const res: any = await getCourseList(selectedBatch, selectedType, page);
        if (res.code !== 200) {
          addLog(`第${page}页获取失败: ${res.msg}`);
          break;
        }
        const rows = res.data?.rows || [];
        allRows.push(...rows);
        addLog(`第${page}页获取到 ${rows.length} 条`);
        if (rows.length < PAGE_SIZE) {
          break;
        }
        page += 1;
        if (page > 50) {
          addLog("分页超过上限，已停止");
          break;
        }
      }
      setCourses(allRows);
      let totalClasses = 0;
      allRows.forEach((r: any) => {
        if (r.tcList && Array.isArray(r.tcList)) {
          totalClasses += r.tcList.length;
        } else {
          totalClasses += 1;
        }
      });
      addLog(
        `共获取到 ${totalClasses} 门课程 (来自 ${allRows.length} 个条目, ${page} 页)`
      );
    } catch (e) {
      setCourses([]);
      addLog(`获取课程错误: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedCourses = async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      const res: any = await apiGetSelectedCourses(selectedBatch);
      if (res.code === 200) {
        setSelectedCourses(res.data || []);
        addLog(`获取到 ${res.data ? res.data.length : 0} 门已选课程`);
      } else {
        addLog(`获取已选课程失败: ${res.msg}`);
      }
    } catch (e) {
      addLog(`获取已选课程错误: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDropCourse = async (course: any) => {
    const confirmDrop = await confirm(
      `确定要退掉课程 "${course.KCM || course.kcm}" 吗？此操作不可撤销！`
    );
    if (!confirmDrop) return;
    if (!selectedBatch) {
      addLog("未选择选课批次，无法退课");
      return;
    }
    const clazzId = course.JXBID || course.jxb_id;
    const secretVal = course.secretVal || "";
    setLoading(true);
    try {
      addLog(`正在退课: ${course.KCM || course.kcm}...`);
      const res: any = await apiDropCourse(clazzId, secretVal, selectedBatch);
      if (res.code === 200 || res.success) {
        addLog(`退课成功: ${course.KCM || course.kcm}`);
        fetchSelectedCourses();
      } else {
        addLog(`退课失败: ${res.msg || "未知错误"}`);
      }
    } catch (e) {
      addLog(`退课请求错误: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBatch) {
      fetchCourses();
    }
  }, [selectedBatch, selectedType]);

  useEffect(() => {
    if (selectedBatch) {
      fetchSelectedCourses();
    }
  }, [selectedBatch]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
      <div className="md:col-span-4 space-y-4 flex flex-col h-full overflow-hidden">
        <SidebarControls
          batches={batches}
          selectedBatch={selectedBatch}
          onSelectedBatchChange={(code) => setSelectedBatch(code)}
          classTypes={CLASS_TYPES}
          selectedType={selectedType}
          onSelectedTypeChange={(t) => setSelectedType(t)}
          intervalMs={intervalMs}
          onIntervalChange={(ms) => setIntervalMs(ms)}
        />
        <LogView log={log} />
        <div className="mt-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50">
            <img src="/tauri.svg" alt="Tauri" className="w-5 h-5" />
            <span className="text-xs text-gray-600">Build with Tauri</span>
            <span className="text-gray-300">•</span>
            <a
              href="https://github.com/zhxycn/whutjwxk"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
      <div className="md:col-span-8 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
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
                待抢列表 ({cart.length})
              </button>
              <button
                className={`pb-1 text-sm font-medium transition-colors ${
                  view === "selected"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => {
                  setView("selected");
                  fetchSelectedCourses();
                }}
              >
                已选课程
              </button>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              {view === "list"
                ? `${filteredCourses.length} 组课程`
                : view === "cart"
                ? cart.length
                : selectedCourses.length}
            </span>
          </div>
          {view === "list" && (
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative w-full md:flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="搜索课程/教师/编号..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-2.5 top-1.5 text-gray-400 text-xs">
                  🔍
                </span>
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <select
                  className="p-1.5 text-xs border border-gray-300 rounded outline-none bg-white text-gray-600"
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
                  className="p-1.5 text-xs border border-gray-300 rounded outline-none bg-white text-gray-600"
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
                  onClick={fetchCourses}
                  disabled={loading || !selectedBatch}
                  className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded border transition ${
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
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          {view === "list" ? (
            filteredCourses.length > 0 ? (
              <CourseList
                filteredCourses={filteredCourses as any[]}
                cart={cart}
                addToCart={addToCart}
                expandedGroupId={expandedGroupId}
                toggleGroup={toggleGroup}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="text-4xl mb-2">📚</div>
                <p>暂无课程数据，请先点击左侧“获取课程”</p>
              </div>
            )
          ) : view === "cart" ? (
            <CartList
              cart={cart}
              removeFromCart={removeFromCart}
              isGrabbing={isGrabbing}
              toggleGrab={toggleGrab}
            />
          ) : selectedCourses.length > 0 ? (
            <SelectedList
              selectedCourses={selectedCourses}
              onDrop={handleDropCourse}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-4xl mb-2">📋</div>
              <p>暂无已选课程</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
