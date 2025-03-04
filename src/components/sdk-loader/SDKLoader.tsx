import { useAtom } from "jotai";
import { memo, useEffect, useMemo, useRef } from "react";
import { useWalletClient } from "wagmi";
import { exchangeInfoAtom, traderAPIAtom } from "../../store/sdk.store";
import { PerpetualDataHandler, TraderInterface } from "@d8x/perpetuals-sdk";

export const SDKLoader = memo(() => {
  const { data: walletClient } = useWalletClient();

  const [traderAPI, setTraderAPI] = useAtom(traderAPIAtom);
  const [exchangeInfo, setExchangeInfo] = useAtom(exchangeInfoAtom);

  const loadingAPIRef = useRef(false);
  const loadingExchangeInfoRef = useRef(false);

  const chainId = useMemo(() => {
    return walletClient?.chain?.id;
  }, [walletClient]);

  useEffect(() => {
    if (
      !chainId ||
      Number(traderAPI?.chainId) === chainId ||
      loadingAPIRef.current
    ) {
      return;
    }
    loadingAPIRef.current = true;
    const newAPI = new TraderInterface(
      PerpetualDataHandler.readSDKConfig(chainId)
    );
    newAPI
      .createProxyInstance()
      .then(() => {
        console.log("init");
        setTraderAPI(newAPI);
      })
      .catch(console.error)
      .finally(() => {
        console.log("finally init");
        loadingAPIRef.current = false;
      });
  }, [chainId, traderAPI?.chainId, setTraderAPI]);

  useEffect(() => {
    if (
      loadingExchangeInfoRef.current ||
      loadingAPIRef.current ||
      !traderAPI ||
      !chainId ||
      exchangeInfo?.chainId === chainId
    ) {
      return;
    }
    loadingExchangeInfoRef.current = true;
    setExchangeInfo(undefined);
    traderAPI
      .exchangeInfo()
      .then((info) => {
        console.log("xch info");
        setExchangeInfo({ ...info, chainId });
      })
      .catch(console.error)
      .finally(() => {
        console.log("finally xchg info");
        loadingExchangeInfoRef.current = false;
      });
  }, [chainId, traderAPI, exchangeInfo, setExchangeInfo]);

  return null;
});
