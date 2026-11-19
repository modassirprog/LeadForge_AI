import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { ToastContainer } from "@/components/ToastContainer";

export const metadata: Metadata = {
  title: "LeadForge AI — Agency Lead Generation & Business Intelligence Platform",
  description: "Discover real businesses with missing or broken websites, audit technical vulnerabilities, and generate hyper-personalized sales outreach via OpenRouter AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-black text-white min-h-screen selection:bg-cyan-500/20 selection:text-cyan-200">
        <AppProvider>
          {children}
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
