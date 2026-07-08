import { useState, useRef, useEffect } from "react";
import { grabCourse as apiGrabCourse } from "../services/jwxk";
import { LogLevel } from "./useLogger";
import { Batch } from "./useBatches";
import { getCourseId } from "../utils/course";

export type GrabStatus = "idle" | "pending" | "success" | "error";

export function useGrabber(
  selectedBatch: string,
  selectedType: string,
  addLog: (msg: string, level?: LogLevel, details?: any) => void,
  batches: Batch[] = [],
) {
  const [cart, setCart] = useState<any[]>([]);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const isGrabbingRef = useRef(false);
  const [intervalMs, setIntervalMs] = useState(500);
  const intervalRef = useRef(intervalMs);
  const cartRef = useRef(cart);

  useEffect(() => {
    intervalRef.current = intervalMs;
  }, [intervalMs]);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const updateCartItem = (courseId: string, patch: Record<string, any>) => {
    setCart((prev) =>
      prev.map((c) => (getCourseId(c) === courseId ? { ...c, ...patch } : c)),
    );
  };

  const addToCart = (course: any) => {
    const courseId = getCourseId(course);
    if (cart.some((c) => getCourseId(c) === courseId)) {
      addLog(`${course.KCM} 已经在待抢列表中`, "warn");
      return;
    }
    const batchName =
      batches.find((b) => b.code === selectedBatch)?.name || selectedBatch;
    setCart((prev) => [
      ...prev,
      {
        ...course,
        grabStatus: "idle" as GrabStatus,
        grabBatchId: selectedBatch,
        grabBatchName: batchName,
        grabClazzType: selectedType,
      },
    ]);
    addLog(`已添加 ${course.KCM} 到待抢列表 (批次: ${batchName})`, "info");
  };

  const removeFromCart = (courseId: string) => {
    setCart((prev) => prev.filter((c) => getCourseId(c) !== courseId));
  };

  const stopGrabbing = () => {
    isGrabbingRef.current = false;
    setIsGrabbing(false);
    // 清理停止时残留的 pending 状态
    setCart((prev) =>
      prev.map((c) =>
        c.grabStatus === "pending" ? { ...c, grabStatus: "idle" } : c,
      ),
    );
  };

  const isAuthError = (msg: string | undefined, code?: number) =>
    code === 401 ||
    (!!msg &&
      (msg.includes("登录") || msg.includes("login") || msg.includes("logged in")));

  const runGrabLoop = async () => {
    let consecutiveAuthFailures = 0;
    while (isGrabbingRef.current) {
      const currentCart = cartRef.current;
      let pendingCount = 0;
      let authFailed = false;

      for (let i = 0; i < currentCart.length; i++) {
        if (!isGrabbingRef.current) break;
        const item = currentCart[i];
        const clazzId = getCourseId(item);
        // 以最新购物车为准，跳过本轮中已被移除或已抢到的课程
        const liveItem = cartRef.current.find((c) => getCourseId(c) === clazzId);
        if (!liveItem || liveItem.grabStatus === "success") continue;
        pendingCount++;
        updateCartItem(clazzId, { grabStatus: "pending" });

        const batchId = item.grabBatchId || selectedBatch;
        const clazzType = item.grabClazzType || selectedType;

        try {
          addLog(
            `正在抢 ${item.KCM} [${item.grabBatchName || batchId}] (${i + 1}/${currentCart.length})...`,
            "info",
          );
          const res: any = await apiGrabCourse(
            clazzId,
            item.secretVal || "",
            batchId,
            clazzType,
          );
          if (res.code === 200) {
            consecutiveAuthFailures = 0;
            addLog(
              `成功! 已抢到 ${item.KCM}: ${res.msg || "无消息"}`,
              "success",
            );
            updateCartItem(clazzId, {
              grabStatus: "success",
              grabMsg: res.msg,
            });
          } else if (isAuthError(res.msg, res.code)) {
            consecutiveAuthFailures++;
            if (consecutiveAuthFailures >= 5) {
              authFailed = true;
              break;
            }
          } else {
            consecutiveAuthFailures = 0;
            addLog(`抢课失败 ${item.KCM}`, "error", res);
            updateCartItem(clazzId, { grabStatus: "error", grabMsg: res.msg });
          }
        } catch (e: any) {
          const errorMsg = e?.msg || String(e);
          addLog(`抢课错误 ${item.KCM}`, "error", e);
          updateCartItem(clazzId, { grabStatus: "error", grabMsg: errorMsg });
          if (isAuthError(errorMsg)) {
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
        stopGrabbing();
        addLog("连续5次检测到登录失效，停止抢课", "error");
        break;
      }
      if (pendingCount === 0) {
        stopGrabbing();
        addLog("所有课程已抢到，停止抢课", "success");
        break;
      }
      if (isGrabbingRef.current) {
        addLog(
          `本轮结束，等待 ${intervalRef.current / 1000}s 后开始下一轮...`,
          "warn",
        );
        await new Promise((r) => setTimeout(r, intervalRef.current));
      }
    }
    stopGrabbing();
  };

  const toggleGrab = () => {
    if (isGrabbing) {
      stopGrabbing();
      addLog("正在停止...", "warn");
    } else {
      if (cart.length === 0) {
        addLog("待抢列表为空", "warn");
        return;
      }
      setIsGrabbing(true);
      isGrabbingRef.current = true;
      runGrabLoop();
    }
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    isGrabbing,
    toggleGrab,
    intervalMs,
    setIntervalMs,
  };
}
