import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { wagmiConfig } from "@/lib/wagmi";
import { resolveApiBaseUrl } from "@/lib/apiBase";
import { App } from "@/App";
import { ThemeProvider, useTheme } from "@/wbr/theme/ThemeProvider";

import "@rainbow-me/rainbowkit/styles.css";
import "@/wbr/tokens.css";
import "@/styles/globals.css";

void resolveApiBaseUrl();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

function RainbowWithTheme({ children }: { children: React.ReactNode }) {
  const { resolved } = useTheme();
  const theme =
    resolved === "light"
      ? lightTheme({
          accentColor: "#b8924a",
          accentColorForeground: "#1a1406",
          borderRadius: "large",
          fontStack: "system",
          overlayBlur: "small",
        })
      : darkTheme({
          accentColor: "#c9a86a",
          accentColorForeground: "#1a1406",
          borderRadius: "large",
          fontStack: "system",
          overlayBlur: "small",
        });

  return (
    <RainbowKitProvider theme={theme} modalSize="compact" coolMode>
      {children}
    </RainbowKitProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowWithTheme>
            <BrowserRouter>
              <App />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: "var(--glass-fill-elevated, #101013)",
                    color: "var(--text-1, #f3f3f3)",
                    border: "1px solid var(--glass-border, rgba(201,168,106,0.35))",
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.7)",
                  },
                }}
              />
            </BrowserRouter>
          </RainbowWithTheme>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
