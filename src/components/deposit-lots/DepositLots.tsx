import {
  useContractWrite,
  useWaitForTransaction,
  useWalletClient,
} from "wagmi";

import { PROXY_ABI } from "@d8x/perpetuals-sdk";
import { useAtomValue } from "jotai";
import { useCallback, useMemo, useRef, useState } from "react";
import useExchangeInfo from "../../hooks/useExchangeInfo";
import useTraderAPI from "../../hooks/useTraderAPI";
import { selectedPoolSymbolAtom } from "../../store/blockchain.store";
import { Box, Button, Grid, Paper, styled } from "@mui/material";
import { ResponsiveInput } from "../responsive-input/ResponsiveInput";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export function DepositLots() {
  const { data: wallet } = useWalletClient();
  const { traderAPI, isLoading: isTraderAPILoading } = useTraderAPI(
    wallet?.chain.id
  );
  const { exchangeInfo } = useExchangeInfo(wallet?.chain.id);

  const selectedPoolSymbol = useAtomValue(selectedPoolSymbolAtom);

  const [depositAmount, setDepositAmount] = useState(0);
  const [inputValue, setInputValue] = useState(`${depositAmount}`);

  const inputValueChangedRef = useRef(false);

  const lotSize = useMemo(() => {
    const selectedPool = exchangeInfo?.pools.find(
      (pool) => pool.poolSymbol === selectedPoolSymbol
    );
    return selectedPool?.brokerCollateralLotSize;
  }, [selectedPoolSymbol, exchangeInfo]);

  const handleInputCapture = useCallback((orderSizeValue: string) => {
    if (orderSizeValue) {
      setDepositAmount(+orderSizeValue);
      setInputValue(orderSizeValue);
    } else {
      setDepositAmount(0);
      setInputValue("");
    }
    inputValueChangedRef.current = true;
  }, []);

  const poolId = useMemo(() => {
    if (
      !traderAPI ||
      isTraderAPILoading ||
      selectedPoolSymbol === "" ||
      traderAPI.chainId !== wallet?.chain.id
    ) {
      return 0;
    }
    let id: number | undefined = undefined;
    try {
      id = traderAPI.getPoolIdFromSymbol(selectedPoolSymbol);
    } catch (e) {
      console.error(e);
    }
    return id;
  }, [traderAPI, wallet?.chain.id, isTraderAPILoading, selectedPoolSymbol]);

  const { data, write } = useContractWrite({
    address: exchangeInfo?.proxyAddr as `0x${string}` | undefined,
    abi: [...PROXY_ABI],
    functionName: "depositBrokerLots",
    chainId: wallet?.chain.id,
    args: [poolId, +depositAmount],
    enabled: !!traderAPI && Boolean(depositAmount),
    gas: BigInt(1_000_000),
  });

  useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => {
      console.log("txn", data?.hash);
    },
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2} marginTop={2}>
        <Grid item xs={6} marginTop={1}>
          <Item variant="outlined">
            <Button
              onClick={() => {
                write?.();
              }}
              disabled={depositAmount <= 0}
            >
              {" "}
              Buy Lots{" "}
            </Button>
          </Item>
        </Grid>
        <Grid item xs={6}>
          <Item elevation={0}>
            <ResponsiveInput
              id="deposit-lots-amount"
              inputValue={inputValue}
              setInputValue={handleInputCapture}
              currency={`${
                (lotSize ?? 0) * depositAmount
              } ${selectedPoolSymbol}`}
              // step="1"
              // min={0}
              // max={poolTokenBalance || 999999}
            />
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
}
