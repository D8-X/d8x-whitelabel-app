import "./polyfills";
import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { Chain, configureChains, createConfig, WagmiConfig } from "wagmi";
import { arbitrum, arbitrumSepolia, polygonZkEvm } from "wagmi/chains";
import { xlayer } from "./chains";
import { publicProvider } from "wagmi/providers/public";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import polygonIcon from "./assets/icons/polygon.webp";
import x1Icon from "./assets/icons/x1.png";
import { SDKLoader } from "./components/sdk-loader/SDKLoader";

const polygonZkEvmCustom = {
  ...polygonZkEvm,
  iconUrl: polygonIcon,
  iconBackground: "transparent",
} as Chain;
const xlayerCustom = {
  ...xlayer,
  iconUrl: x1Icon,
  iconBackground: "transparent",
} as Chain;

const { chains, publicClient } = configureChains(
  [polygonZkEvmCustom, arbitrum, arbitrumSepolia, xlayerCustom],
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
        <SDKLoader />
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);
