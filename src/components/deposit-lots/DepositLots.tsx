import {
  erc20ABI,
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useWalletClient,
} from "wagmi";

import { useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useExchangeInfo from "../../hooks/useExchangeInfo";
import useTraderAPI from "../../hooks/useTraderAPI";
import { selectedPoolSymbolAtom } from "../../store/blockchain.store";
import { Box, Button, Grid, Paper, styled } from "@mui/material";
import { ResponsiveInput } from "../responsive-input/ResponsiveInput";
import { parseUnits } from "viem";
import { DEPOSIT_ABI } from "../../constants";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export function DepositLots() {
  const { address, isConnected } = useAccount();
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
  }, [traderAPI, wallet?.chain?.id, isTraderAPILoading, selectedPoolSymbol]);

  const marginTokenDecimals = useMemo(() => {
    if (
      !traderAPI ||
      isTraderAPILoading ||
      selectedPoolSymbol === "" ||
      traderAPI.chainId !== wallet?.chain?.id
    ) {
      return undefined;
    }
    let decimals: number | undefined = undefined;
    try {
      traderAPI.getPoolStaticInfoIndexFromSymbol(selectedPoolSymbol);
      decimals = traderAPI.getMarginTokenDecimalsFromSymbol(selectedPoolSymbol);
    } catch (e) {
      console.error(e);
    }
    return decimals;
  }, [traderAPI, wallet?.chain?.id, isTraderAPILoading, selectedPoolSymbol]);

  const poolTokenAddr = useMemo(() => {
    if (selectedPoolSymbol === "" || !exchangeInfo) {
      return undefined;
    }
    return exchangeInfo?.pools.find(
      (pool) => pool.poolSymbol === selectedPoolSymbol && pool.isRunning
    )?.marginTokenAddr as `0x${string}` | undefined;
  }, [exchangeInfo, selectedPoolSymbol]);

  const proxyAddr = useMemo(() => {
    return exchangeInfo?.proxyAddr as `0x${string}` | undefined;
  }, [exchangeInfo]);

  const amountInUnits = useMemo(() => {
    return lotSize !== undefined &&
      depositAmount !== undefined &&
      marginTokenDecimals !== undefined &&
      depositAmount > 0
      ? parseUnits((lotSize * depositAmount).toString(), marginTokenDecimals)
      : undefined;
  }, [lotSize, depositAmount, marginTokenDecimals]);

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    address: poolTokenAddr,
    abi: erc20ABI,
    functionName: "allowance",
    chainId: wallet?.chain?.id,
    enabled: proxyAddr !== undefined && wallet?.account?.address !== undefined,
    args: [
      wallet?.account?.address as `0x${string}`,
      proxyAddr as `0x${string}`,
    ],
  });

  const { config: approveConfig } = usePrepareContractWrite({
    address: poolTokenAddr,
    abi: erc20ABI,
    functionName: "approve",
    chainId: wallet?.chain?.id,
    enabled:
      isConnected &&
      wallet?.chain !== undefined &&
      proxyAddr !== undefined &&
      allowance !== undefined &&
      amountInUnits !== undefined &&
      amountInUnits > allowance,
    args: [proxyAddr as `0x${string}`, amountInUnits as bigint],
  });

  const { config: depositLotsConfig } = usePrepareContractWrite({
    address: exchangeInfo?.proxyAddr as `0x${string}` | undefined,
    abi: DEPOSIT_ABI,
    functionName: "depositBrokerLots",
    chainId: wallet?.chain?.id,
    enabled:
      !!traderAPI &&
      isConnected &&
      poolId !== undefined &&
      wallet?.chain !== undefined &&
      allowance !== undefined &&
      amountInUnits !== undefined &&
      poolId > 0 &&
      depositAmount > 0 &&
      allowance >= amountInUnits,
    args: [poolId as number, depositAmount],
    gas: 1_000_000n,
    account: address,
  });

  const {
    data: approveTxn,
    writeAsync: approve,
    isSuccess: isApproved,
  } = useContractWrite(approveConfig);

  const { writeAsync: execute } = useContractWrite(depositLotsConfig);

  useWaitForTransaction({
    hash: approveTxn?.hash,
    onSuccess: () => {
      console.log("approve txn", approveTxn?.hash);
    },
    onSettled: () => {
      refetchAllowance?.().then();
    },
  });

  const depositLots = async () => {
    if (
      allowance === undefined ||
      amountInUnits === undefined ||
      amountInUnits <= 0n
    ) {
      return;
    }
    if (allowance < amountInUnits) {
      await approve?.();
    } else {
      await execute?.();
    }
  };

  useEffect(() => {
    if (isApproved) {
      execute?.().then();
    }
  }, [isApproved, execute]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2} marginTop={2}>
        <Grid item xs={6} marginTop={1}>
          <Item variant="outlined">
            <Button
              onClick={() => {
                depositLots().then();
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
