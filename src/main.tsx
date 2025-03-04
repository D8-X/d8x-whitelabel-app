import "@rainbow-me/rainbowkit/styles.css";
import "./polyfills";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import App from "./App";
import { SDKLoader } from "./components/sdk-loader/SDKLoader";
import { wagmiConfig } from "./wagmiConfig";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          appInfo={{
            appName: "D8X Whitelist",
            learnMoreUrl: "https://d8x.exchange/",
          }}
          modalSize="compact"
        >
          <SDKLoader />
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
