import { useState, useEffect } from "react";

export interface Batch {
  code: string;
  name: string;
  beginTime?: string;
  endTime?: string;
}

export function useBatches(studentInfo: any | null) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  useEffect(() => {
    if (
      studentInfo?.electiveBatchList &&
      studentInfo.electiveBatchList.length > 0
    ) {
      setBatches(studentInfo.electiveBatchList);
      setSelectedBatch(studentInfo.electiveBatchList[0].code);
    }
  }, [studentInfo]);

  return {
    batches,
    selectedBatch,
    setSelectedBatch,
    selectedType,
    setSelectedType,
  };
}
