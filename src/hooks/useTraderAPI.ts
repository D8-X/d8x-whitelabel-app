import { useCallback, useRef, useState } from "react";
import { useAtom } from "jotai";
import { traderAPIAtom } from "../store/sdk.store";
import { PerpetualDataHandler, TraderInterface } from "@d8x/perpetuals-sdk";

const useTraderAPI = () => {
  const [traderAPI, setTraderAPI] = useAtom(traderAPIAtom);

  const isLoadingRef = useRef(false);

  const [connectedChainId, setConnectedChainId] = useState(
    Number(traderAPI?.chainId)
  );

  const connectAsync = useCallback(
    async (_chainId: number) => {
      if (
        (traderAPI && connectedChainId === _chainId) ||
        isLoadingRef.current
      ) {
        // already connected to this chain, or busy
        return;
      }

      isLoadingRef.current = true;
      const api = new TraderInterface(
        PerpetualDataHandler.readSDKConfig(_chainId)
      );
      await api
        .createProxyInstance()
        .then(() => {
          setTraderAPI(api);
          setConnectedChainId(Number(api.chainId));
        })
        .catch(console.error)
        .finally(() => {
          isLoadingRef.current = false;
        });
    },
    [traderAPI, connectedChainId, setTraderAPI]
  );

  return {
    api: traderAPI,
    isLoading: isLoadingRef.current,
    chainId: connectedChainId,
    connect: isLoadingRef.current ? undefined : connectAsync,
  };
};

export default useTraderAPI;
