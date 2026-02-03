"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { WeeklyReportPDF, type WeeklyReportData } from "@/components/reports/WeeklyReportPDF";

export function useWeeklyReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch report data from API
      const response = await fetch("/api/reports/weekly");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || "리포트 데이터를 가져오는데 실패했습니다.");
      }

      const data: WeeklyReportData = result.data;

      // Generate PDF blob
      const blob = await pdf(<WeeklyReportPDF data={data} />).toBlob();

      // Download the PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `embeau_weekly_report_${data.weekStart}_${data.weekEnd}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(message);
      console.error("Download report error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    downloadReport,
    isLoading,
    error,
  };
}
