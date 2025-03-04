import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWalletClient,
  useWriteContract,
} from "wagmi";

import { Box, Button, Grid, Paper, styled } from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Address, erc20Abi, parseUnits, zeroAddress } from "viem";
import { flatTokenAbi } from "../../abi/flatTokenAbi";
import { DEPOSIT_ABI } from "../../constants";
import {
  lastDepositTimeAtom,
  selectedPoolIdAtom,
  selectedPoolSymbolAtom,
} from "../../store/blockchain.store";
import { exchangeInfoAtom, traderAPIAtom } from "../../store/sdk.store";
import { ResponsiveInput } from "../responsive-input/ResponsiveInput";

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

  // const proxyAddr = useMemo(() => {
  //   return exchangeInfo?.proxyAddr as `0x${string}` | undefined;
  // }, [exchangeInfo]);

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

  const { data: registeredToken, refetch: refetchRegisteredToken } =
    useReadContract({
      address: poolTokenAddr,
      abi: flatTokenAbi,
      functionName: "registeredToken",
      args: [walletClient?.account?.address as Address],
      query: { enabled: !!walletClient?.account?.address && !!poolTokenAddr },
    });

  const { data: supportedTokens } = useReadContract({
    address: poolTokenAddr,
    abi: flatTokenAbi,
    functionName: "getSupportedTokens",
    query: { enabled: !!poolTokenAddr },
  });

  const spenderAddr = useMemo(() => {
    if (supportedTokens) {
      // composite token is spender
      return poolTokenAddr;
    } else {
      // proxy
      return exchangeInfo?.proxyAddr as Address | undefined;
    }
  }, [exchangeInfo, supportedTokens, poolTokenAddr]);

  const userTokenAddr = useMemo(() => {
    if (supportedTokens) {
      // user pays in another token
      return registeredToken && registeredToken !== zeroAddress
        ? registeredToken
        : supportedTokens[0];
    } else {
      // normal case
      return poolTokenAddr;
    }
  }, [supportedTokens, poolTokenAddr, registeredToken]);

  const {
    data: allowance,
    refetch: refetchAllowance,
    isFetching,
  } = useReadContract({
    address: userTokenAddr,
    abi: erc20Abi,
    functionName: "allowance",
    chainId: chainId,
    query: {
      enabled:
        userTokenAddr !== undefined &&
        spenderAddr !== undefined &&
        walletClient?.account?.address !== undefined,
    },
    args: [walletClient?.account?.address as Address, spenderAddr as Address],
  });

  const {
    data: balance,
    refetch: refetchBalance,
    isFetching: isFetchingBalance,
  } = useReadContract({
    address: userTokenAddr,
    abi: erc20Abi,
    functionName: "balanceOf",
    chainId: chainId,
    query: {
      enabled:
        userTokenAddr !== undefined &&
        walletClient?.account?.address !== undefined,
      refetchInterval: 7_000,
    },
    args: [walletClient?.account?.address as `0x${string}`],
  });

  const approveConfig = {
    address: userTokenAddr as Address,
    abi: erc20Abi,
    functionName: "approve" as const,
    chainId: chainId,
    enabled:
      isConnected &&
      walletClient?.chain !== undefined &&
      spenderAddr !== undefined &&
      userTokenAddr !== undefined &&
      allowance !== undefined &&
      amountInUnits !== undefined &&
      amountInUnits > allowance,
    args: [spenderAddr, amountInUnits] as [`0x${string}`, bigint],
  };

  const registerConfig = {
    address: poolTokenAddr as Address,
    abi: flatTokenAbi,
    functionName: "registerAccount" as const,
    chainId: chainId,
    enabled:
      isConnected &&
      walletClient?.chain !== undefined &&
      supportedTokens !== undefined &&
      poolTokenAddr !== undefined,
    args: [supportedTokens?.[0]] as [Address],
  };

  const depositLotsConfig = {
    address: exchangeInfo?.proxyAddr as Address,
    abi: DEPOSIT_ABI,
    functionName: "depositBrokerLots" as const,
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
    args: [selectedPoolId, depositAmount] as [number, number],
    gas: 2_000_000n,
    account: address,
  };

  const { writeContractAsync } = useWriteContract();

  const [approveTxn, setApproveTxn] = useState<Address | undefined>();
  const [depositTxn, setDepositTxn] = useState<Address | undefined>();
  const [registerTxn, setRegisterTxn] = useState<Address | undefined>();

  const approve = async () => {
    return writeContractAsync(approveConfig).then((hash) => {
      setApproveTxn(hash);
      return hash;
    });
  };

  const execute = async () => {
    return writeContractAsync(depositLotsConfig).then((hash) => {
      setDepositTxn(hash);
      return hash;
    });
  };

  const register = async () => {
    return writeContractAsync(registerConfig).then((hash) => {
      setRegisterTxn(hash);
      return hash;
    });
  };

  const approveToken = async () => {
    if (transactionSent.current || !approve) {
      return;
    }
    transactionSent.current = true;
    setWaitingForTx(true);
    await approve()
      .then((result) => {
        console.log("approve txn sent", result);
      })
      .finally(() => {
        transactionSent.current = false;
      });
  };

  const depositLots = async () => {
    if (transactionSent.current || !execute) {
      return;
    }
    transactionSent.current = true;
    setWaitingForTx(true);
    await execute()
      .then((result) => {
        console.log("deposit txn sent", result);
      })
      .finally(() => {
        transactionSent.current = false;
      });
  };

  const registerAccount = async () => {
    if (transactionSent.current || !register) {
      return;
    }
    transactionSent.current = true;
    setWaitingForTx(true);
    await register()
      .then((result) => {
        console.log("register txn sent", result);
      })
      .finally(() => {
        transactionSent.current = false;
      });
  };

  const { isSuccess: approveSuccess, isError: approveError } =
    useWaitForTransactionReceipt({
      hash: approveTxn,
    });

  const { isSuccess: executeSuccess, isError: executeError } =
    useWaitForTransactionReceipt({
      hash: depositTxn,
    });

  const { isSuccess: registerSuccess, isError: registerError } =
    useWaitForTransactionReceipt({
      hash: registerTxn,
    });

  useEffect(() => {
    if (approveSuccess) {
      refetchBalance?.().then();
      refetchAllowance?.().then();
      setApproveTxn(undefined);
      setWaitingForTx(false);
    }
  }, [approveSuccess, refetchBalance, refetchAllowance]);

  useEffect(() => {
    if (registerSuccess) {
      refetchRegisteredToken?.().then();
      setRegisterTxn(undefined);
      setWaitingForTx(false);
    }
  }, [registerSuccess, refetchRegisteredToken]);

  useEffect(() => {
    if (registerError) {
      setRegisterTxn(undefined);
      setWaitingForTx(false);
      refetchRegisteredToken?.().then();
    }
  }, [registerError, refetchRegisteredToken]);

  useEffect(() => {
    if (approveError) {
      setApproveTxn(undefined);
      setWaitingForTx(false);
    }
  }, [approveError]);

  useEffect(() => {
    if (executeSuccess) {
      refetchBalance?.().then();
      refetchAllowance?.().then();
      setDepositAmount(0);
      setInputValue("");
      setLastDepositTime(Date.now());
      setDepositTxn(undefined);
      setWaitingForTx(false);
    }
  }, [executeSuccess, refetchBalance, refetchAllowance, setLastDepositTime]);

  useEffect(() => {
    if (executeError) {
      setApproveTxn(undefined);
      setWaitingForTx(false);
    }
  }, [executeError]);

  const [buttonMessage, isButtonEnabled] = useMemo(() => {
    if (
      supportedTokens &&
      (!registeredToken || registeredToken === zeroAddress)
    ) {
      return ["Register Token", true];
    } else if (amountInUnits === undefined) {
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
    supportedTokens,
    registeredToken,
  ]);

  const handleClick = () => {
    if (
      allowance !== undefined &&
      amountInUnits !== undefined &&
      balance !== undefined
    ) {
      if (
        (supportedTokens && !registeredToken) ||
        registeredToken === zeroAddress
      ) {
        return registerAccount().then();
      } else if (allowance >= amountInUnits && balance >= amountInUnits) {
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
