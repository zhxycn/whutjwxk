type AnyCourse = any;

const weekdayMap: Record<string, string> = {
  "1": "星期一",
  "2": "星期二",
  "3": "星期三",
  "4": "星期四",
  "5": "星期五",
  "6": "星期六",
  "7": "星期日",
};

export function buildTimeText(course: AnyCourse): string {
  if (Array.isArray(course?.SKSJ) && course.SKSJ.length > 0) {
    const parts = (course.SKSJ as any[]).map((s: any) => {
      const weekRange =
        (s.QSZC && s.JZZC) ? `${s.QSZC}-${s.JZZC}周` : (s.ZC ? `${s.ZC}周` : "");
      const day = s.SKXQ ? (weekdayMap[String(s.SKXQ)] || `星期${s.SKXQ}`) : "";
      const period = (s.KSJC && s.JSJC) ? `第${s.KSJC}-${s.JSJC}节` : "";
      return [weekRange, day, period].filter(Boolean).join(" ");
    }).filter(Boolean);
    return parts.join("、");
  }
  const y = course?.YPSJDD || course?.SJDD || "";
  if (y) {
    const dayMatch = y.match(/星期[一二三四五六日七]/);
    const periodMatch = y.match(/第(\d+)(?:[节\-到至~]?(?:第)?(\d+))?节/);
    const periodStr = periodMatch
      ? (periodMatch[2] ? `第${periodMatch[1]}-${periodMatch[2]}节` : `第${periodMatch[1]}节`)
      : "";
    return [dayMatch ? dayMatch[0] : "", periodStr].filter(Boolean).join(" ");
  }
  return "";
}

export function buildPlaceText(course: AnyCourse): string {
  if (Array.isArray(course?.SKSJ) && course.SKSJ.length > 0) {
    const locs = (course.SKSJ as any[])
      .map((s: any) => s.JASMC || s.SKDD)
      .filter(Boolean);
    const locAgg = locs.join("、");
    return locAgg || course.SKDD || course.JASMC || course.teachingPlace || "";
  }
  return course.SKDD || course.JASMC || course.teachingPlace || "";
}
