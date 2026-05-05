"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { GlobalSuccessNotification } from "./global-success-notification";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <GlobalSuccessNotification />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--toast-bg)",
            color: "var(--toast-color)",
          },
        }}
      />
    </ThemeProvider>
  );
}




