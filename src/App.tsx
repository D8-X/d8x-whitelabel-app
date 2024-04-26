import { Box, Container, Paper, Typography, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Connect } from "./components/connect-wallet/Connect";
import { SelectPool } from "./components/select-pool/SelectPool";
import { DepositLots } from "./components/deposit-lots/DepositLots";
import { Summary } from "./components/summary/Summary";

// Create a custom theme with updated background color
const theme = createTheme({
  palette: {
    primary: {
      main: '#fff',
    },
    secondary: {
      main: '#7860e3',
    },
    background: {
      default: '#201b35'  // Set the background color of the page
    },
    text: {
      primary: '#e0e0e0', // Light grey text for general use
    }
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    button: {
      textTransform: 'none' // Removes uppercase transformation on buttons.
    }
  },
  components: {
    // Apply baseline CSS across the app
    MuiCssBaseline: {
      styleOverrides: `
        body {
          background-color: #fff; // Ensure the body background color is applied
        }
      `
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          sx={{ gap: 2 }}
        >
          <Paper elevation={3} sx={{ width: '100%', p: 4, borderRadius: 2, backgroundColor: '#201b35' }}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Typography variant="h4" color="primary" gutterBottom>
                Buy Broker Lots
              </Typography>
              <Connect /> {/* Connect button aligned to the right of the title */}
            </Box>
            <Paper elevation={3} sx={{ width: '100%', p: 4, borderRadius: 2, backgroundColor: '#111216' }}>
              <Typography variant="h6" color="secondary" gutterBottom>
                Select Pool
              </Typography>
              <SelectPool />
              <Typography variant="h6" color="secondary" gutterBottom>
                Summary
              </Typography>
              <Summary />
              <Typography variant="h6" color="secondary" gutterBottom>
                Deposit Lots
              </Typography>
              <DepositLots />
            </Paper>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
