import { getWalletClient } from "@wagmi/core";
import { BrowserProvider } from "ethers";
import { useMemo } from "react";
import { WalletClient } from "viem";
import { useWalletClient } from "wagmi";
import { wagmiConfig } from "../wagmiConfig";

export function walletClientToSigner(walletClient?: WalletClient | null) {
  if (walletClient) {
    const provider = new BrowserProvider(walletClient.transport, "any");
    return provider.getSigner();
  } else {
    throw Error("WalletClient not found");
  }
}

export async function walletClientToSignerAsync(chainId?: number) {
  const walletClient = await getWalletClient(wagmiConfig, { chainId });
  return walletClientToSigner(walletClient);
}

export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId });
  return useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient]
  );
}
