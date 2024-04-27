import { useWalletClient } from "wagmi";
import useExchangeInfo from "../../hooks/useExchangeInfo";
import { selectedPoolSymbolAtom } from "../../store/blockchain.store";
import { useAtom } from "jotai";
import { memo, useMemo } from "react";
import useTraderAPI from "../../hooks/useTraderAPI";
import { Box, FormControl, InputLabel, MenuItem, Select, CircularProgress } from "@mui/material";

export const SelectPool = memo(() => {
  const { data } = useWalletClient();
  const { traderAPI } = useTraderAPI(data?.chain.id);
  const { exchangeInfo, isLoading } = useExchangeInfo(data?.chain.id);
  const [selectedPoolSymbol, setSelectedPoolSymbol] = useAtom(selectedPoolSymbolAtom);

  const symbols = useMemo(() => {
    if (isLoading || !exchangeInfo || traderAPI?.chainId !== data?.chain.id) {
      return [];
    }
    return exchangeInfo.pools
      .filter((pool) => pool.isRunning)
      .map((pool) => pool.poolSymbol);
  }, [traderAPI, exchangeInfo, isLoading, data?.chain.id]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="100%"  // Ensure it takes the full width of the container
    >
      <FormControl fullWidth variant="outlined" margin="normal" sx={{ width: '100%', marginBottom: 4  }}>
        <InputLabel id="demo-simple-select-label">Liquidity Pool</InputLabel>
        <Select
          labelId="label-select-pool"
          id="id-select-pool"
          value={selectedPoolSymbol || ""} // Ensuring value is controlled properly
          label="Liquidity Pool"
          onChange={(e) => setSelectedPoolSymbol(e.target.value)}
          sx={{
            width: '100%', // Ensure the Select component fills its parent width
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main', // Ensures the outline is always visible
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.dark', // Darker on hover for better visibility
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'secondary.main', // Changes when field is focused
              borderWidth: '2px', // Makes the outline thicker on focus
            }
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: '#201b35', // Change the dropdown background color here
                color: 'primary.main', // Optional: change text color if needed
              }
            }
          }}
        >
          <MenuItem value="" disabled>
            Select a pool
          </MenuItem>
          {symbols.map((poolSymbol) => (
            <MenuItem key={poolSymbol} value={poolSymbol}>{poolSymbol}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
});