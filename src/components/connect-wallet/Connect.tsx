import { Box } from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const Connect = () => {
  return (
    <Box>
      {/* Removed the position fixed to integrate button into the normal document flow */}
      <ConnectButton />
    </Box>
  );
};