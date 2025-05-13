import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { MessageContainer } from "@/components/Message";
import dynamic from "next/dynamic";

// 动态导入消息容器，避免SSR错误
const DynamicMessageContainer = dynamic(
  () => import('@/components/Message').then(mod => mod.MessageContainer),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "学习平台",
  description: "一个全面的在线学习平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-16 mt-4">
              {children}
            </main>
            <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6">
              <div className="max-w-screen-xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
                <p>© {new Date().getFullYear()} 学习平台. 保留所有权利.</p>
              </div>
            </footer>
          </div>
          {/* 消息容器 */}
          <DynamicMessageContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
