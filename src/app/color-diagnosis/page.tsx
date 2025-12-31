"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, RefreshCw, X } from "lucide-react";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useColorStore } from "@/store/useColorStore";

export default function ColorDiagnosisPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { analyzeColor, isAnalyzing } = useColorStore();

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraReady(true);
        };
      }
    } catch (error) {
      console.error("Camera access failed:", error);
      setCameraError("카메라 권한을 허용해주세요");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  };

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Mirror the image for selfie camera
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
    }

    // Convert to base64
    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(imageData);

    // Stop camera after capture
    stopCamera();
  }, []);

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
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
          <div className="aspect-square bg-neutral-900 rounded-xl flex flex-col items-center justify-center overflow-hidden relative">
            {cameraError ? (
              <div className="text-center p-4">
                <Camera className="w-12 h-12 text-white/50 mx-auto mb-3" />
                <p className="text-white/70 text-sm mb-4">{cameraError}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={startCamera}
                >
                  다시 시도
                </Button>
              </div>
            ) : capturedImage ? (
              <>
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleRetake}
                  className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
                {!isCameraReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900">
                    <Camera className="w-12 h-12 text-white/70 mb-3 animate-pulse" />
                    <p className="text-white/70 text-center text-sm">
                      카메라 연결 중...
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          {/* Hidden canvas for capturing */}
          <canvas ref={canvasRef} className="hidden" />
        </Card>

        {/* Action Buttons */}
        {capturedImage ? (
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={handleRetake}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              다시 찍기
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleAnalyze}
              isLoading={isAnalyzing}
            >
              분석하기
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleCapture}
            disabled={!isCameraReady || !!cameraError}
          >
            <Camera className="w-5 h-5 mr-2" />
            사진 촬영
          </Button>
        )}
      </div>
    </div>
  );
}
