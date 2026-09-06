import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: "我的学习小岛｜儿童趣味学习工作台",
    description: "在小岛冒险中认识拼音、数量和汉字。",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "我的学习小岛",
      description: "在小岛冒险中认识拼音、数量和汉字。",
      type: "website",
      images: [{ url: "/og.png", width: 1536, height: 1024, alt: "宝贝学习乐园彩虹糖果色学习卡片" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "我的学习小岛",
      description: "在小岛冒险中认识拼音、数量和汉字。",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
