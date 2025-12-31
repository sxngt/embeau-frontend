"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useColorStore } from "@/store/useColorStore";

export default function ColorDiagnosisPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { analyzeColor, isAnalyzing } = useColorStore();

  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;
      setCapturedImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!capturedImage) return;

    try {
      await analyzeColor(capturedImage);
      router.push("/color-diagnosis/result");
    } catch (error) {
      console.error("Color analysis failed:", error);
    }
  };

  return (
    <div className="min-h-screen pb-8">
      <Header showBack onBack={() => router.push("/main")} />

      {/* Title Section */}
      <div className="text-center pt-4 md:pt-8 px-8 mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
          <span className="text-gradient-purple">퍼스널컬러</span>{" "}
          <span className="text-neutral-400">진단</span>
        </h1>
        <p className="text-neutral-800 text-lg md:text-xl font-medium">
          가장 나다운 빛깔을 발견하는 시간
        </p>
      </div>

      <div className="px-5 md:px-8 lg:px-16 space-y-6 max-w-3xl mx-auto">
        {/* Instructions Card */}
        <Card variant="outlined" padding="md">
          <h3 className="font-semibold text-neutral-700 mb-3">
            시작하기 전 준비해요
          </h3>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-purple mt-1.5 flex-shrink-0" />
              <span>블루라이트 필터 잠시멈춰!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-purple mt-1.5 flex-shrink-0" />
              <span>자연광, 흰조명 OK</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-purple mt-1.5 flex-shrink-0" />
              <span>화장하지않은 얼굴이 좋아요~</span>
            </li>
          </ul>
        </Card>

        {/* Camera Section */}
        <Card variant="outlined" padding="lg">
          <div
            className="aspect-square bg-neutral-900 rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden"
            onClick={handleCapture}
          >
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <Camera className="w-12 h-12 text-white/70 mb-3" />
                <p className="text-white/70 text-center text-sm">
                  자연스럽고 편안한 자세로
                  <br />
                  셀카를 찍어주세요.
                </p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileChange}
            className="hidden"
          />
        </Card>

        {/* Action Button */}
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={capturedImage ? handleAnalyze : handleCapture}
          isLoading={isAnalyzing}
        >
          {capturedImage ? "분석하기" : "사진촬영"}
        </Button>
      </div>
    </div>
  );
}
