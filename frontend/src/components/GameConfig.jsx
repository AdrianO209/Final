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
  Slider,
} from "@mui/material";
import CustomTabPanel from "./CustomTabPanel.jsx";

function GameConfig({ activeTabIndex }) {
  const [timeControl, setTimeControl] = useState(600);
  const [increment, setIncrement] = useState(0);
  const [name, setName] = useState("");

  const handleTimeChange = (event, newTime) => {
    if (newTime !== null) {
      setTimeControl(newTime);
    }
  };

  const handleIncrementChange = (event, newIncrementTime) => {
    setIncrement(newIncrementTime);
  };

  const incrementMarks = [
    { value: 0, label: "0s" },
    { value: 1, label: "1s" },
    { value: 2, label: "2s" },
    { value: 5, label: "5s" },
    { value: 10, label: "10s" },
    { value: 15, label: "15s" },
    { value: 30, label: "30s" },
  ];

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

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Choose Name
                </Typography>

                <TextField
                  label="Name"
                  variant="standard"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />
                <Typography variant="subtitle1" gutterBottom>
                  Choose Pace (Minutes)
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

                <Typography variant="subtitle1" gutterBottom>
                  {" "}
                  Bonus Time (Increment)
                </Typography>

                <Slider
                  value={increment}
                  onChange={handleIncrementChange}
                  marks={incrementMarks}
                  max={30}
                  step={null}
                  valueLabelDisplay="off"
                />

                <Button variant="outlined">Create</Button>
              </Box>
            </Paper>
          </Container>
        </Box>
      </CustomTabPanel>
    </>
  );
}
export default GameConfig;
