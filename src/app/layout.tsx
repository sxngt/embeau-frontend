import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "EMBEAU - 오롯이 나를 위해 단단해지는 시간",
  description: "오늘의 감정을 색으로 표현하거나, 색으로 마음을 다독일 수 있어요.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EMBEAU",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "EMBEAU",
    title: "EMBEAU - 오롯이 나를 위해 단단해지는 시간",
    description: "오늘의 감정을 색으로 표현하거나, 색으로 마음을 다독일 수 있어요.",
  },
  twitter: {
    card: "summary",
    title: "EMBEAU - 오롯이 나를 위해 단단해지는 시간",
    description: "오늘의 감정을 색으로 표현하거나, 색으로 마음을 다독일 수 있어요.",
  },
};

export const viewport: Viewport = {
  themeColor: "#F98B9E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
