import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Great_Vibes } from "next/font/google";
import { getActiveTheme } from "@/lib/theme-server";
import { themeToStyle } from "@/lib/theme-config";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans-loader",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Có điều gì đó dành cho bạn",
  description:
    "Một tấm thiệp sinh nhật bay từ nơi bạn sinh ra đến nơi bạn đang ở.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#EEF8FF",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getActiveTheme();

  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${greatVibes.variable}`}
      style={themeToStyle(theme)}
      data-theme-motion={theme.motion}
    >
      <body>{children}</body>
    </html>
  );
}
