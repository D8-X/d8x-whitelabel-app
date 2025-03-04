import { useBalance, useWalletClient } from "wagmi";
import {
  lastDepositTimeAtom,
  selectedPoolSymbolAtom,
} from "../../store/blockchain.store";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import useBrokerTool from "../../hooks/useBrokerTool";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  CardHeader,
  Divider,
  Grid,
  Tooltip,
} from "@mui/material";

export const Summary = () => {
  const { data } = useWalletClient();
  const chainId = useMemo(() => data?.chain?.id, [data?.chain]);

  const utilityTokenAddr = useMemo(() => {
    switch (chainId) {
      case 1442:
        return "0x9a1E6C2f81bE72Af2C4138Bbec3d9029516f27a6";
      case 195:
        return "0xd08B8E59a36BaA7EED60E21C1D6a7778811C30eD";
      default:
        return chainId
          ? "0xDc28023CCdfbE553643c41A335a4F555Edf937Df"
          : undefined;
    }
  }, [chainId]);

  const { brokerTool, isLoading: isToolLoading } = useBrokerTool(
    data?.chain.id
  );
  const [selectedPoolSymbol] = useAtom(selectedPoolSymbolAtom);

  const lastDepositTime = useAtomValue(lastDepositTimeAtom);

  const [lotsPurchased, setLotsPurchased] = useState<number | undefined>(
    undefined
  );
  const [lotsFee, setLotsFee] = useState<number | undefined>(undefined);
  const [volumeUSD, setVolumeUSD] = useState<number | undefined>(undefined);
  const [volumeFee, setVolumeFee] = useState<number | undefined>(undefined);
  const [stakeFee, setStakeFee] = useState<number | undefined>(undefined);
  const [totalFee, setTotalFee] = useState<number | undefined>(undefined);

  const { data: utilityTokenBalance } = useBalance({
    address: data?.account?.address,
    token: utilityTokenAddr,
  });

  useEffect(() => {
    if (
      brokerTool &&
      !isToolLoading &&
      selectedPoolSymbol &&
      lastDepositTime < Date.now()
    ) {
      brokerTool
        .getBrokerDesignation(selectedPoolSymbol)
        .then(setLotsPurchased);
      brokerTool
        .getFeeForBrokerDesignation(selectedPoolSymbol)
        .then(setLotsFee);
      brokerTool.getFeeForBrokerStake().then(setStakeFee);
      brokerTool.getFeeForBrokerVolume(selectedPoolSymbol).then(setVolumeFee);
      brokerTool.getCurrentBrokerVolume(selectedPoolSymbol).then(setVolumeUSD);
      brokerTool.getBrokerInducedFee(selectedPoolSymbol).then(setTotalFee);
    }
  }, [brokerTool, isToolLoading, selectedPoolSymbol, lastDepositTime]);

  if (isToolLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={100}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, padding: 2, marginBottom: 4 }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={4}>
          <Card raised sx={{ backgroundColor: "#201b35" }}>
            <CardHeader
              title="Lots"
              titleTypographyProps={{ align: "center", variant: "h6" }}
            />
            <Divider />
            <CardContent>
              <Typography variant="body2">
                Owned: {lotsPurchased ?? "-"}
              </Typography>
              <Typography variant="body2">
                Induced Fee:{" "}
                {lotsFee !== undefined ? `${lotsFee * 1e4} BP` : "-"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card raised sx={{ backgroundColor: "#201b35" }}>
            <CardHeader
              title="D8X Coin"
              titleTypographyProps={{ align: "center", variant: "h6" }}
            />
            <Divider />
            <CardContent>
              <Typography variant="body2">
                Owned:{" "}
                {utilityTokenBalance ? utilityTokenBalance.formatted : "-"}
              </Typography>
              <Typography variant="body2">
                Induced Fee:{" "}
                {stakeFee !== undefined ? `${stakeFee * 1e4} BP` : "-"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card raised sx={{ backgroundColor: "#201b35" }}>
            <CardHeader
              title="Volume"
              titleTypographyProps={{ align: "center", variant: "h6" }}
            />
            <Divider />
            <CardContent>
              <Typography variant="body2">
                Current:{" "}
                {volumeUSD !== undefined
                  ? `${(volumeUSD / 1e6).toFixed(4)} mmUSD`
                  : "-"}
              </Typography>
              <Typography variant="body2">
                Induced Fee:{" "}
                {volumeFee !== undefined ? `${volumeFee * 1e4} BP` : "-"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card raised sx={{ width: "100%", backgroundColor: "#201b35" }}>
            <CardHeader
              title="Total Fees"
              titleTypographyProps={{ align: "center", variant: "h6" }}
            />
            <Divider />
            <CardContent>
              <Typography variant="body2">
                <Tooltip
                  title="Exchange fee your customers will pay. Depends on the amount of lots you purchased, your $D8X holdings and your monthly trading volume."
                  placement="top"
                >
                  <span
                    style={{
                      borderBottom: "1px dotted",
                      paddingBottom: "2px", // Adjust this value to increase vertical distance
                      lineHeight: "normal", // Ensures the line height does not compress the padding
                    }}
                  >
                    Final Fee
                  </span>
                </Tooltip>
                {": "}
                {totalFee !== undefined
                  ? `${totalFee * 1e4} BP`
                  : "Buy at least 1 lot to become a broker"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
