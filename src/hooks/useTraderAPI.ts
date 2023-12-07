import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { traderAPIAtom } from "../store/sdk.store";
import { PerpetualDataHandler, TraderInterface } from "@d8x/perpetuals-sdk";

const useTraderAPI = (chainId: number | undefined) => {
  const [traderAPI, setTraderAPI] = useAtom(traderAPIAtom);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (
      chainId === undefined ||
      (!!traderAPI && traderAPI.chainId === chainId)
    ) {
      return;
    }
    setLoading(true);
    const api = new TraderInterface(
      PerpetualDataHandler.readSDKConfig(chainId)
    );
    api
      .createProxyInstance()
      .then(() => setTraderAPI(api))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [chainId, traderAPI, setTraderAPI, setLoading]);
  return { traderAPI: traderAPI, isLoading: isLoading };
};

export default useTraderAPI;
