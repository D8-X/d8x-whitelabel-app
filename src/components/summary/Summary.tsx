import { useWalletClient } from "wagmi";
import { selectedPoolSymbolAtom } from "../../store/blockchain.store";
import { useAtom } from "jotai";
import { memo, useEffect, useState } from "react";
import useBrokerTool from "../../hooks/useBrokerTool";
import { Box, Grid, Paper, styled } from "@mui/material";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export const Summary = memo(() => {
  const { data } = useWalletClient();
  const { brokerTool, isLoading: isToolLoading } = useBrokerTool(
    data?.chain.id
  );
  const [selectedPoolSymbol] = useAtom(selectedPoolSymbolAtom);

  const [lotsPurchased, setLotsPurchased] = useState<number | undefined>(
    undefined
  );

  const [lotsFee, setLotsFee] = useState<number | undefined>(undefined);

  const [volumeUSD, setVolumeUSD] = useState<number | undefined>(undefined);
  const [volumeFee, setVolumeFee] = useState<number | undefined>(undefined);

  const [stakeFee, setStakeFee] = useState<number | undefined>(undefined);

  const [totalFee, setTotalFee] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!!brokerTool && !isToolLoading && selectedPoolSymbol !== "") {
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
  }, [
    brokerTool,
    isToolLoading,
    selectedPoolSymbol,
    setLotsPurchased,
    setLotsFee,
    setVolumeFee,
    setVolumeUSD,
    setTotalFee,
  ]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Item>Lots</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>Owned</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>{lotsPurchased ?? "-"}</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>Induced Fee</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>{lotsFee !== undefined ? lotsFee * 1e4 : "-"}</Item>
        </Grid>

        <Grid item xs={12}>
          <Item>D8X Coin</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>Owned</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>{"-"}</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>Induced Fee</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>{stakeFee !== undefined ? stakeFee * 1e4 : "-"}</Item>
        </Grid>

        <Grid item xs={12}>
          <Item>Volume</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>Current</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>
            {volumeUSD !== undefined ? `${volumeUSD / 1e6} mmUSD` : "-"}
          </Item>
        </Grid>
        <Grid item xs={3}>
          <Item>Induced Fee</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>{volumeFee !== undefined ? volumeFee * 1e4 : "-"}</Item>
        </Grid>

        <Grid item xs={6}>
          <Item>Final Fee</Item>
        </Grid>
        <Grid item xs={6}>
          <Item>{totalFee !== undefined ? totalFee * 1e4 : "-"}</Item>
        </Grid>
      </Grid>
    </Box>
  );
});
