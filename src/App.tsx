import { SelectPool } from "./components/select-pool/SelectPool";
import { DepositLots } from "./components/deposit-lots/DepositLots";
import { Summary } from "./components/summary/Summary";
import { Connect } from "./components/connect-wallet/Connect";

import styles from "./App.module.scss";
import { Dialog } from "@mui/material";

function App() {
  return (
    <div className={styles.root}>
      <Dialog open>
        <div className={styles.subtitle}>Select Liquidity Pool</div>
        <div>
          <SelectPool />
        </div>
        <div className={styles.subtitle}>Account Details</div>
        <div>
          <Summary />
        </div>

        <div className={styles.subtitle}>Deposit Lots</div>
        <div className={styles.connectButton}>
          <Connect />
        </div>
        <div>
          <DepositLots />
        </div>
      </Dialog>
    </div>
  );
}

export default App;
