import { useEffect, useState } from "react";
import { getClassTypes as apiGetClassTypes } from "../services/jwxk";
import { LogLevel } from "./useLogger";

export type ClassTypesMap = Record<string, string>;

export function useClassTypes(
  selectedBatch: string,
  addLog: (msg: string, level?: LogLevel, details?: any) => void,
) {
  const [classTypes, setClassTypes] = useState<ClassTypesMap>({});
  const [defaultType, setDefaultType] = useState<string>("");

  useEffect(() => {
    const loadTypes = async () => {
      if (!selectedBatch) {
        setClassTypes({});
        setDefaultType("");
        return;
      }
      try {
        const res: any = await apiGetClassTypes(selectedBatch);
        const list = Array.isArray(res?.list) ? res.list : [];
        const mapping: ClassTypesMap = {};
        for (const item of list) {
          const key = item?.teachingClassType;
          const name = item?.displayName;
          if (typeof key === "string" && typeof name === "string") {
            if (key === "YXKC") continue;
            mapping[key] = name;
          }
        }
        setClassTypes(mapping);
        const firstKey = Object.keys(mapping)[0];
        setDefaultType(firstKey || "");
      } catch (e) {
        addLog("获取课程类型失败", "error", e);
        setClassTypes({});
        setDefaultType("");
      }
    };
    loadTypes();
  }, [selectedBatch]);

  return { classTypes, defaultType };
}
