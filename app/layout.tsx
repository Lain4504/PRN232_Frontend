import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/lib/provider/client-providers";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-league-spartan",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
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
        className={`${leagueSpartan.className} ${leagueSpartan.variable} antialiased`}
        suppressHydrationWarning
      >
        <ClientProviders>
            {children}
        </ClientProviders>
      </body>
    </html>
  );
}
