import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PostPay — Premium Advertising for Ghanaian Businesses",
  description: "Stop wasting money on billboards and flyers. Reach thousands of real Ghanaians through WhatsApp Status for a fraction of the cost. Pay via MoMo.",
};

import { ToastProvider } from "@/hooks/useToast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
