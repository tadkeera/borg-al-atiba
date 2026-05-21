import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({ subsets: ["arabic"], variable: '--font-cairo' });

export const metadata: Metadata = {
  title: "مستشفى برج الأطباء - نظام التسجيل",
  description: "نظام إدارة التسجيل في مستشفى برج الأطباء",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
