import { useAtom } from "jotai";
import { memo, useEffect, useMemo } from "react";
import { useWalletClient } from "wagmi";

import { FormControl, Select } from "@mui/material";

import { selectedPoolSymbolAtom } from "../../store/blockchain.store";

import styles from "./SelectPool.module.scss";
import useExchangeInfo from "../../hooks/useExchangeInfo";

export const SelectPool = memo(() => {
  const { data } = useWalletClient();
  const { exchangeInfo, isLoading } = useExchangeInfo(data?.chain?.id);
  const [selectedPoolSymbol, setSelectedPoolSymbol] = useAtom(
    selectedPoolSymbolAtom
  );

  const symbols = useMemo(() => {
    if (isLoading || !exchangeInfo) {
      return [];
    }
    return exchangeInfo.pools
      .filter((pool) => pool.isRunning)
      .map((pool) => pool.poolSymbol);
  }, [exchangeInfo, isLoading]);

  useEffect(() => {
    if (symbols.length > 0) {
      setSelectedPoolSymbol(symbols[0]);
    }
  }, [symbols, setSelectedPoolSymbol]);

  useEffect(() => {
    setSelectedPoolSymbol("");
  }, [data?.chain?.id, setSelectedPoolSymbol]);

  return (
    <FormControl
      fullWidth
      variant="standard"
      margin="normal"
      className={styles.root}
    >
      <Select
        placeholder="Collateral currency"
        id="select-pool-id"
        value={selectedPoolSymbol}
        label=""
        native={true}
        onChange={(e) => {
          setSelectedPoolSymbol(e.target.value);
        }}
      >
        {symbols.map((poolSymbol) => (
          <option key={poolSymbol} value={poolSymbol}>
            {poolSymbol}
          </option>
        ))}
      </Select>
    </FormControl>
  );
});
