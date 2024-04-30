import { useCallback, useRef, useState } from "react";
import useTraderAPI from "./useTraderAPI";
import { useAtom } from "jotai";
import { exchangeInfoAtom } from "../store/sdk.store";

const useExchangeInfo = () => {
  const [exchangeInfo, setExchangeInfo] = useAtom(exchangeInfoAtom);

  const { api, isLoading: isAPILoading, connect } = useTraderAPI();

  const [isLoading, setIsLoading] = useState(false);

  const fetchingChainId = useRef(0);

  const refetchAsync = useCallback(
    async (_chainId: number) => {
      if (isAPILoading || !connect) {
        // sdk is loading - this fn is undefined
        setIsLoading(isAPILoading);
        return;
      }
      if (fetchingChainId.current === _chainId) {
        // already fetching
        return;
      }
      setIsLoading(true);
      fetchingChainId.current = _chainId;
      await connect(_chainId);
      await api
        ?.exchangeInfo()
        .then((info) => {
          setExchangeInfo({ ...info, chainId: _chainId });
        })
        .catch(console.error)
        .finally(() => {
          setIsLoading(false);
        });
    },
    [api, isAPILoading, connect, setExchangeInfo]
  );
  console.log("useExch", isAPILoading, isLoading, !connect);
  return {
    exchangeInfo,
    isLoading,
    refetch: refetchAsync,
  };
};

export default useExchangeInfo;
