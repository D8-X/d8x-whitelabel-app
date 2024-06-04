import {
  erc20ABI,
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useWalletClient,
} from "wagmi";

import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  lastDepositTimeAtom,
  selectedPoolIdAtom,
  selectedPoolSymbolAtom,
} from "../../store/blockchain.store";
import { Box, Button, Grid, Paper, styled } from "@mui/material";
import { ResponsiveInput } from "../responsive-input/ResponsiveInput";
import { parseUnits } from "viem";
import { DEPOSIT_ABI } from "../../constants";
import { exchangeInfoAtom, traderAPIAtom } from "../../store/sdk.store";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  textAlign: "center",
  color: theme.palette.text.secondary,
  display: "flex", // Ensure flex to stretch child components
  justifyContent: "center", // Center align items
  padding: 0, // Remove padding to allow full-width usage
  margin: 0, // Remove margins that could affect the layout
  width: "100%", // Ensure the item itself is full-width if not already
}));

export function DepositLots() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const selectedPoolId = useAtomValue(selectedPoolIdAtom);
  const selectedPoolSymbol = useAtomValue(selectedPoolSymbolAtom);
  const exchangeInfo = useAtomValue(exchangeInfoAtom);
  const api = useAtomValue(traderAPIAtom);

  const setLastDepositTime = useSetAtom(lastDepositTimeAtom);

  const [depositAmount, setDepositAmount] = useState(0);
  const [inputValue, setInputValue] = useState(`${depositAmount}`);

  const transactionSent = useRef(false);
  const [waitingForTx, setWaitingForTx] = useState(false);

  const inputValueChangedRef = useRef(false);

  const chainId = useMemo(() => {
    return walletClient?.chain?.id;
  }, [walletClient]);

  const marginTokenDecimals = useMemo(() => {
    if (!api || selectedPoolSymbol === "") {
      return undefined;
    }
    let decimals: number | undefined = undefined;
    try {
      decimals = api.getMarginTokenDecimalsFromSymbol(selectedPoolSymbol);
    } catch (e) {
      console.error(e);
    }
    return decimals;
  }, [api, selectedPoolSymbol]);

  const lotSize = useMemo(() => {
    const brokerCollateralLotSize = exchangeInfo?.pools.find(
      (pool) => pool.poolSymbol === selectedPoolSymbol
    )?.brokerCollateralLotSize;
    if (
      brokerCollateralLotSize !== undefined &&
      marginTokenDecimals !== undefined
    ) {
      return 10 ** -10 * Math.ceil(brokerCollateralLotSize * 10 ** 10);
    }
  }, [selectedPoolSymbol, marginTokenDecimals, exchangeInfo]);

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
    if (
      lotSize !== undefined &&
      depositAmount !== undefined &&
      marginTokenDecimals !== undefined &&
      depositAmount > 0
    ) {
      return parseUnits(
        (lotSize * depositAmount).toString(),
        marginTokenDecimals
      );
    }
  }, [lotSize, depositAmount, marginTokenDecimals]);

  const {
    data: allowance,
    refetch: refetchAllowance,
    isFetching,
  } = useContractRead({
    address: poolTokenAddr,
    abi: erc20ABI,
    functionName: "allowance",
    chainId: chainId,
    enabled:
      proxyAddr !== undefined && walletClient?.account?.address !== undefined,
    args: [
      walletClient?.account?.address as `0x${string}`,
      proxyAddr as `0x${string}`,
    ],
  });

  const {
    data: balance,
    refetch: refetchBalance,
    isFetching: isFetchingBalance,
  } = useContractRead({
    address: poolTokenAddr,
    abi: erc20ABI,
    functionName: "balanceOf",
    chainId: chainId,
    enabled:
      proxyAddr !== undefined && walletClient?.account?.address !== undefined,
    args: [walletClient?.account?.address as `0x${string}`],
  });

  const { config: approveConfig } = usePrepareContractWrite({
    address: poolTokenAddr,
    abi: erc20ABI,
    functionName: "approve",
    chainId: chainId,
    enabled:
      isConnected &&
      walletClient?.chain !== undefined &&
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
    chainId: chainId,
    enabled:
      isConnected &&
      selectedPoolId !== undefined &&
      walletClient?.chain !== undefined &&
      allowance !== undefined &&
      amountInUnits !== undefined &&
      selectedPoolId > 0 &&
      depositAmount > 0 &&
      allowance >= amountInUnits,
    args: [selectedPoolId as number, depositAmount],
    gas: 2_000_000n,
    account: address,
  });

  const { data: approveTxn, writeAsync: approve } =
    useContractWrite(approveConfig);

  const { data: depositTxn, writeAsync: execute } =
    useContractWrite(depositLotsConfig);

  const approveToken = useCallback(async () => {
    if (transactionSent.current || !approve) {
      return;
    }
    transactionSent.current = true;
    setWaitingForTx(true);
    await approve()
      .then((result) => {
        console.log("approve txn sent", result.hash);
      })
      .finally(() => {
        transactionSent.current = false;
      });
  }, [approve, setWaitingForTx]);

  const depositLots = useCallback(async () => {
    if (transactionSent.current || !execute) {
      return;
    }
    transactionSent.current = true;
    setWaitingForTx(true);
    await execute()
      .then((result) => {
        console.log("deposit txn sent", result.hash);
      })
      .finally(() => {
        transactionSent.current = false;
      });
  }, [execute, setWaitingForTx]);

  useWaitForTransaction({
    hash: approveTxn?.hash,
    confirmations: 5,
    onSuccess: () => {
      console.log("approve txn confirmed", approveTxn?.hash);
      refetchBalance?.().then();
      refetchAllowance?.().then();
    },
    onSettled: () => {
      setWaitingForTx(false);
    },
  });

  useWaitForTransaction({
    hash: depositTxn?.hash,
    confirmations: 10,
    onSuccess: () => {
      console.log("deposit txn confirmed", depositTxn?.hash);
      refetchBalance?.().then();
      refetchAllowance?.().then();
      setDepositAmount(0);
      setInputValue("");
      setLastDepositTime(Date.now());
    },
    onSettled: () => {
      setWaitingForTx(false);
    },
  });

  const [buttonMessage, isButtonEnabled] = useMemo(() => {
    if (amountInUnits === undefined) {
      return ["Enter Amount", false];
    } else if (waitingForTx) {
      return ["Processing...", false];
    } else if (
      allowance === undefined ||
      balance === undefined ||
      isFetching ||
      isFetchingBalance
    ) {
      return ["Loading...", false];
    } else if (amountInUnits > balance) {
      return ["Insufficient Balance", false];
    } else if (allowance < amountInUnits) {
      return ["Approve Allowance", true];
    } else {
      return ["Buy Lots", true];
    }
  }, [
    allowance,
    balance,
    amountInUnits,
    isFetchingBalance,
    isFetching,
    waitingForTx,
  ]);

  const handleClick = () => {
    if (
      allowance !== undefined &&
      amountInUnits !== undefined &&
      balance !== undefined
    ) {
      if (allowance >= amountInUnits && balance >= amountInUnits) {
        return depositLots().then();
      } else {
        return approveToken().then();
      }
    } else {
      console.log("should not be here");
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2} marginTop={2}>
        <Grid item xs={6}>
          <Item elevation={0} sx={{ backgroundColor: "#201b35" }}>
            <ResponsiveInput
              id="deposit-lots-amount"
              inputValue={inputValue}
              setInputValue={handleInputCapture}
              currency={`${((lotSize ?? 0) * depositAmount).toFixed(
                5
              )} ${selectedPoolSymbol}`}
            />
          </Item>
        </Grid>
        <Grid item xs={6}>
          <Item>
            <Button
              onClick={handleClick}
              disabled={!isButtonEnabled || transactionSent.current}
              variant="contained" // Use the contained style for more emphasis
              color="primary" // Make the button stand out with a primary color
              size="large" // Optionally increase the size for better accessibility
              fullWidth={true}
              sx={{
                width: "100%",
                height: "52px",
                color: "#e0e0e0",
                fontSize: "16px",
                backgroundColor: "#7860e3", // Custom color
                "&:hover": {
                  backgroundColor: "#604db6", // Darker on hover
                },
                "&.Mui-disabled": {
                  backgroundColor: "#4a426a", // Custom color for disabled state
                  color: "#ccc", // Optional: change text color in disabled state
                },
              }} // Optional: Make the button full width of its container
            >
              {buttonMessage}
            </Button>
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
}
