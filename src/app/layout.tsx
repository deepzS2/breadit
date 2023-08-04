import "@/styles/globals.css";

import { Inter } from "next/font/google";

import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Breadit",
  description: "A Reddit clone built with Next.js and TypeScript.",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  return (
    <html
      className={cn(
        "bg-white text-slate-900 antialiased light",
        inter.className
      )}
      lang="en"
    >
      <body className="pt-12 min-h-screen antialiased bg-slate-50">
        <Providers>
          {/* @ts-expect-error server component */}
          <Navbar />

          {authModal}

          <div className="container pt-12 mx-auto max-w-7xl h-full">
            {children}
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
