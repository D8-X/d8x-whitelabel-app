import { useEffect, useState } from "react";
import useTraderAPI from "./useTraderAPI";
import { useAtom } from "jotai";
import { exchangeInfoAtom } from "../store/sdk.store";

const useExchangeInfo = (chainId: number | undefined) => {
  const [exchangeInfo, setExchangeInfo] = useAtom(exchangeInfoAtom);

  const { traderAPI, isLoading: isAPILoading } = useTraderAPI(chainId);

  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (!traderAPI || isAPILoading) {
      setLoading(isAPILoading);
      return;
    }
    setLoading(true);
    traderAPI
      .exchangeInfo()
      .then(setExchangeInfo)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [traderAPI, isAPILoading, setExchangeInfo, setLoading]);
  return { exchangeInfo, isLoading };
};

export default useExchangeInfo;
