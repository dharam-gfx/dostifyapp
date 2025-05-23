"use client"

import { Provider } from "react-redux";
import { store } from "@/store/strore";
import { ThemeProvider } from "@/components/theme/theme-provider";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { Toaster } from "@/components/ui/sonner";
import { SoundProvider } from "@/providers/SoundProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function ClientLayout( { children }: { children: React.ReactNode } ) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange      >
        <SoundProvider>
          <ErrorBoundary>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster />
          </ErrorBoundary>
        </SoundProvider>
      </ThemeProvider>
    </Provider>
  );
}
