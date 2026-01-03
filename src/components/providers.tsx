"use client";

import { ThemeProvider } from "./theme-provider";
import { Header } from "./header";
import { Toaster } from "./toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
