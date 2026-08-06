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
    title: "宝贝学习乐园｜4 岁儿童快乐学习工作台",
    description: "字母、古诗、数字、逻辑和闯关五大模块，让孩子在游戏中快乐学习。",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "宝贝学习乐园",
      description: "快乐学 · 勇敢闯 · 星星亮",
      type: "website",
      images: [{ url: "/og.png", width: 1536, height: 1024, alt: "宝贝学习乐园彩虹糖果色学习卡片" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "宝贝学习乐园",
      description: "快乐学 · 勇敢闯 · 星星亮",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
