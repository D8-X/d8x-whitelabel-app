import "./polyfills";
import "@rainbow-me/rainbowkit/styles.css";

import {
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { polygonZkEvm, polygonZkEvmTestnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { theme } from "./styles/theme/theme";
import { StyledEngineProvider, ThemeProvider } from "@mui/material";

import "styles/index.scss";

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
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider
            chains={chains}
            theme={lightTheme({
              accentColor: "var(--d8x-color-black)",
            })}
          >
            <App />
          </RainbowKitProvider>
        </WagmiConfig>
      </ThemeProvider>
    </StyledEngineProvider>
  </StrictMode>
);
