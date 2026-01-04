import { useState, useRef, useEffect } from "react";
import { grabCourse as apiGrabCourse } from "../services/jwxk";

export function useGrabber(
  selectedBatch: string,
  selectedType: string,
  addLog: (msg: string) => void
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
