import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Paper,
  Button,
} from "@mui/material";
import CustomTabPanel from "./CustomTabPanel.jsx";

function GameConfig({ activeTabIndex }) {
  const [timeControl, setTimeControl] = useState(600);

  const handleTimeChange = (event, newTime) => {
    if (newTime !== null) {
      setTimeControl(newTime);
    }
  };
  return (
    <>
      <CustomTabPanel value={activeTabIndex} index={0}>
        <Box sx={{ py: 4 }}>
          <Container maxWidth="md" sx={{ mt: 8 }}>
            <Paper
              elevation={6}
              sx={{
                p: 4,
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <Typography
                variant="h5"
                align="center"
                sx={{ fontWeight: "bold", mb: 3 }}
              >
                Game Configuration
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                Choose Name
              </Typography>

              <TextField label="Name" variant="standard" />

              <Typography variant="subtitle1" gutterBottom>
                Choose Pace
              </Typography>
              <ToggleButtonGroup
                value={timeControl}
                exclusive
                onChange={handleTimeChange}
                fullWidth
                color="primary"
              >
                <ToggleButton value={60}>1m</ToggleButton>
                <ToggleButton value={300}>5m</ToggleButton>
                <ToggleButton value={600}>10m</ToggleButton>
                <ToggleButton value={1800}>30m</ToggleButton>
              </ToggleButtonGroup>

              <Button variant="outlined">Create</Button>
            </Paper>
          </Container>
        </Box>
      </CustomTabPanel>
    </>
  );
}
export default GameConfig;
