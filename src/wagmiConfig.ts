import "@rainbow-me/rainbowkit/styles.css";
import "./polyfills";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  bybitWallet,
  coinbaseWallet,
  metaMaskWallet,
  okxWallet,
  phantomWallet,
  rabbyWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createClient, http } from "viem";
import { createConfig } from "wagmi";
import { arbitrum, base, Chain, polygonZkEvm } from "wagmi/chains";
import polygonIcon from "./assets/icons/polygon.webp";
import { berachain } from "./chains";

const chains = [
  {
    ...polygonZkEvm,
    iconUrl: polygonIcon,
    iconBackground: "transparent",
  } as Chain,
  { ...berachain },
  {
    ...arbitrum,
    blockExplorers: {
      default: {
        name: "Arbiscan",
        url: "https://arbiscan.io/",
      },
    },
  },
  {
    ...base,
    blockExplorers: {
      default: {
        name: "Base Blockscout",
        url: "	https://base.blockscout.com/",
      },
    },
  },
] as [Chain, ...Chain[]];

const projectId = "973a37d0572219f1fc28dda28dc7765f";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, rabbyWallet, walletConnectWallet, bybitWallet],
    },
    {
      groupName: "Others",
      wallets: [phantomWallet, coinbaseWallet, okxWallet, rainbowWallet],
    },
  ],
  { projectId, appName: "D8X App" }
);

export const wagmiConfig = createConfig({
  chains,
  connectors,
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});
