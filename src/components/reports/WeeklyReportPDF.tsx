"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register Korean font (using Google Fonts)
Font.register({
  family: "Noto Sans KR",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoyeLTq8H4hfeE.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoz2rTq8H4hfeE.ttf",
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Noto Sans KR",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#4A5568",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    fontSize: 11,
    color: "#666",
    width: 100,
  },
  value: {
    fontSize: 11,
    color: "#333",
    flex: 1,
  },
  table: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: "#4A5568",
    borderBottomWidth: 0,
  },
  tableHeaderText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    textAlign: "center",
    paddingHorizontal: 5,
  },
  insightBox: {
    backgroundColor: "#F7FAFC",
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  insightText: {
    fontSize: 11,
    color: "#333",
    lineHeight: 1.5,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  statBox: {
    width: "48%",
    backgroundColor: "#EBF8FF",
    padding: 10,
    marginRight: "2%",
    marginBottom: 10,
    borderRadius: 5,
  },
  statLabel: {
    fontSize: 9,
    color: "#666",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2B6CB0",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#999",
  },
  colorBox: {
    width: 20,
    height: 20,
    marginRight: 10,
    borderRadius: 3,
  },
  colorInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
});

export interface WeeklyReportData {
  user: {
    email: string;
    participantId: string;
  };
  weekStart: string;
  weekEnd: string;
  personalColor?: {
    season: string;
    tone: string;
    description: string;
  };
  emotionSummary?: {
    anxiety: number;
    stress: number;
    satisfaction: number;
    happiness: number;
    depression: number;
    totalEntries: number;
  };
  weeklyInsight?: {
    improvement: string;
    nextWeekSuggestion: string;
    activeDays: number;
    moodImprovement: number;
    stressRelief: number;
    colorImprovement: number;
  };
}

interface WeeklyReportPDFProps {
  data: WeeklyReportData;
}

const seasonKorean: Record<string, string> = {
  spring: "봄",
  summer: "여름",
  autumn: "가을",
  winter: "겨울",
};

const toneKorean: Record<string, string> = {
  warm: "웜톤",
  cool: "쿨톤",
};

export function WeeklyReportPDF({ data }: WeeklyReportPDFProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>EMBEAU 주간 리포트</Text>
          <Text style={styles.subtitle}>
            {formatDate(data.weekStart)} - {formatDate(data.weekEnd)}
          </Text>
        </View>

        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>사용자 정보</Text>
          <View style={styles.row}>
            <Text style={styles.label}>이메일:</Text>
            <Text style={styles.value}>{data.user.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>참가자 ID:</Text>
            <Text style={styles.value}>{data.user.participantId}</Text>
          </View>
        </View>

        {/* Personal Color */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>퍼스널 컬러</Text>
          {data.personalColor ? (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>시즌:</Text>
                <Text style={styles.value}>
                  {seasonKorean[data.personalColor.season] || data.personalColor.season} |{" "}
                  {toneKorean[data.personalColor.tone] || data.personalColor.tone}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>설명:</Text>
                <Text style={styles.value}>{data.personalColor.description}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.value}>아직 퍼스널 컬러 분석이 진행되지 않았습니다.</Text>
          )}
        </View>

        {/* Emotion Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>주간 감정 요약</Text>
          {data.emotionSummary && data.emotionSummary.totalEntries > 0 ? (
            <>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, styles.tableHeaderText]}>감정</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderText]}>평균 점수</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>불안</Text>
                  <Text style={styles.tableCell}>{data.emotionSummary.anxiety.toFixed(1)}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>스트레스</Text>
                  <Text style={styles.tableCell}>{data.emotionSummary.stress.toFixed(1)}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>만족감</Text>
                  <Text style={styles.tableCell}>{data.emotionSummary.satisfaction.toFixed(1)}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>행복</Text>
                  <Text style={styles.tableCell}>{data.emotionSummary.happiness.toFixed(1)}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>우울</Text>
                  <Text style={styles.tableCell}>{data.emotionSummary.depression.toFixed(1)}</Text>
                </View>
              </View>
              <Text style={[styles.value, { marginTop: 10 }]}>
                이번 주 총 기록: {data.emotionSummary.totalEntries}건
              </Text>
            </>
          ) : (
            <Text style={styles.value}>이번 주에 기록된 감정이 없습니다.</Text>
          )}
        </View>

        {/* Weekly Insight */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>주간 인사이트</Text>
          {data.weeklyInsight ? (
            <>
              <View style={styles.insightBox}>
                <Text style={styles.insightText}>
                  💡 분석: {data.weeklyInsight.improvement}
                </Text>
                <Text style={[styles.insightText, { marginTop: 10 }]}>
                  📝 제안: {data.weeklyInsight.nextWeekSuggestion}
                </Text>
              </View>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>활동일 수</Text>
                  <Text style={styles.statValue}>{data.weeklyInsight.activeDays}일</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>기분 개선</Text>
                  <Text style={styles.statValue}>
                    {data.weeklyInsight.moodImprovement > 0 ? "+" : ""}
                    {data.weeklyInsight.moodImprovement.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>스트레스 완화</Text>
                  <Text style={styles.statValue}>
                    {data.weeklyInsight.stressRelief > 0 ? "+" : ""}
                    {data.weeklyInsight.stressRelief.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>컬러 활용도</Text>
                  <Text style={styles.statValue}>{data.weeklyInsight.colorImprovement}%</Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.value}>주간 인사이트가 아직 생성되지 않았습니다.</Text>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by EMBEAU on {new Date().toLocaleDateString("ko-KR")} {new Date().toLocaleTimeString("ko-KR")}
        </Text>
      </Page>
    </Document>
  );
}

export default WeeklyReportPDF;
