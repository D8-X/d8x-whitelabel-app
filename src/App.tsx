import { SelectPool } from "./components/select-pool/SelectPool";
import { DepositLots } from "./components/deposit-lots/DepositLots";
import { Summary } from "./components/summary/Summary";
import { Box, Paper } from "@mui/material";
import { Connect } from "./components/connect-wallet/Connect";

function App() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Paper elevation={3}>
        <Connect />
        <Paper elevation={3}>
          <SelectPool />
          <Summary />
          <DepositLots />
        </Paper>
      </Paper>
    </Box>
  );
}

export default App;
