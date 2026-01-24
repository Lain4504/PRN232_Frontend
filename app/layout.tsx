import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fira_Sans, Fira_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/lib/provider/client-providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const firaSans = Fira_Sans({
  subsets: ["latin"],
  variable: "--font-fira-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const firaMono = Fira_Mono({
  subsets: ["latin"],
  variable: "--font-fira-mono",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "AISAM | Quản lý quảng cáo thông minh",
  description: "Quản lý chiến dịch quảng cáo đa nền tảng với AI: tạo nội dung, lập lịch, phân tích hiệu quả.",
  openGraph: {
    title: "AISAM | Quản lý quảng cáo thông minh",
    description: "Quản lý chiến dịch quảng cáo đa nền tảng với AI: tạo nội dung, lập lịch, phân tích hiệu quả.",
    url: "https://aisam.app/",
    siteName: "AISAM",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AISAM | Quản lý quảng cáo thông minh",
    description: "Quản lý chiến dịch quảng cáo đa nền tảng với AI: tạo nội dung, lập lịch, phân tích hiệu quả.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.className} ${plusJakartaSans.variable} ${firaSans.variable} ${firaMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
