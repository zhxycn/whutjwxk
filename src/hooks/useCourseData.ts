import { useState, useEffect } from "react";
import {
  getCourseList,
  getSelectedCourses as apiGetSelectedCourses,
  dropCourse as apiDropCourse,
} from "../services/jwxk";

export function useCourseData(
  selectedBatch: string,
  selectedType: string,
  addLog: (msg: string) => void
) {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  return {
    courses,
    selectedCourses,
    loading,
    fetchCourses,
    fetchSelectedCourses,
    handleDropCourse,
  };
}
