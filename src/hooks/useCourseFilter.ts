import { useState, useMemo } from "react";

export function useCourseFilter(courses: any[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filteredCourses = useMemo(() => {
    return courses
      .map((group) => {
        const filterSection = (section: any) => {
          const searchLower = searchTerm.toLowerCase();
          if (searchLower) {
            const match =
              (section.KCM &&
                section.KCM.toLowerCase().includes(searchLower)) ||
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
  }, [courses, searchTerm, filterDay, filterPeriod, onlyAvailable]);

  return {
    searchTerm,
    setSearchTerm,
    filterDay,
    setFilterDay,
    filterPeriod,
    setFilterPeriod,
    onlyAvailable,
    setOnlyAvailable,
    filteredCourses,
  };
}
