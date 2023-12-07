import { useWalletClient } from "wagmi";
import useExchangeInfo from "../../hooks/useExchangeInfo";
import { selectedPoolSymbolAtom } from "../../store/blockchain.store";
import { useAtom } from "jotai";
import { memo, useMemo } from "react";
import useTraderAPI from "../../hooks/useTraderAPI";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export const SelectPool = memo(() => {
  const { data } = useWalletClient();
  const { traderAPI } = useTraderAPI(data?.chain.id);
  const { exchangeInfo, isLoading } = useExchangeInfo(data?.chain.id);
  const [selectedPoolSymbol, setSelectedPoolSymbol] = useAtom(
    selectedPoolSymbolAtom
  );

  const symbols = useMemo(() => {
    if (isLoading || !exchangeInfo || traderAPI?.chainId !== data?.chain.id) {
      return [];
    }
    return exchangeInfo.pools
      .filter((pool) => pool.isRunning)
      .map((pool) => pool.poolSymbol);
  }, [traderAPI, exchangeInfo, isLoading, data?.chain.id]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      marginInline={50}
    >
      <FormControl fullWidth variant="standard" margin="normal">
        <InputLabel id="demo-simple-select-label">Liquidity Pool</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={selectedPoolSymbol}
          label="Age"
          onChange={(e) => {
            setSelectedPoolSymbol(e.target.value);
          }}
        >
          {symbols.map((poolSymbol) => (
            <MenuItem value={poolSymbol}> {poolSymbol} </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
});

//   return (
//     <Box>
//       {isLoading && <div>Loading exchange information...</div>}
//       <form hidden={!exchangeInfo || isLoading}>
//         <label htmlFor="pools">Select Pool </label>
//         <select
//           id="pools"
//           onChange={(e) => {
//             setSelectedPoolSymbol(e.target.value);
//           }}
//           value={selectedPoolSymbol}
//         >
//           <option disabled value="">
//             -
//           </option>
//           {symbols.map((poolSymbol) => (
//             <option value={poolSymbol} key={poolSymbol}>
//               {poolSymbol}
//             </option>
//           ))}
//         </select>
//         <div> Lot size: {lotSize ?? "-"} </div>
//       </form>
//     </Box>
//   );
// });
