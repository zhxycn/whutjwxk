import { useState, useEffect } from "react";

export interface Batch {
  code: string;
  name: string;
  beginTime?: string;
  endTime?: string;
  multiCampus?: string;
}

export function useBatches(studentInfo: any | null) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedCampus, setSelectedCampus] = useState<string>("");

  useEffect(() => {
    if (
      studentInfo?.electiveBatchList &&
      studentInfo.electiveBatchList.length > 0
    ) {
      setBatches(studentInfo.electiveBatchList);
      setSelectedBatch(studentInfo.electiveBatchList[0].code);
    }
    if (studentInfo?.campus) {
      setSelectedCampus(studentInfo.campus);
    }
  }, [studentInfo]);

  return {
    batches,
    selectedBatch,
    setSelectedBatch,
    selectedType,
    setSelectedType,
    selectedCampus,
    setSelectedCampus,
  };
}
