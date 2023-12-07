import "./polyfills";
import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { polygonZkEvm, polygonZkEvmTestnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const { chains, publicClient } = configureChains(
  [polygonZkEvm, polygonZkEvmTestnet],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "Whitelabel Partner App",
  projectId: "973a37d0572219f1fc28dda28dc7765f",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);
