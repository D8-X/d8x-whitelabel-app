import { Box } from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const Connect = () => {
  return (
    <Box>
      <Box sx={{ position: "fixed", top: 0, right: 0, zIndex: 2000 }}>
        <ConnectButton />
      </Box>
    </Box>
  );
};
