import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Paper,
  Slider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CustomTabPanel from "./CustomTabPanel.jsx";

const API_BASE_URL = "https://backend-production-5b92.up.railway.app";

function GameConfig({ activeTabIndex }) {
  const [timer, setTimer] = useState(600);
  const [increment, setIncrement] = useState(0);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [gameId, setGameId] = useState("");
  const navigate = useNavigate();

  const handleTimeChange = (event, newTime) => {
    if (newTime !== null) {
      setTimer(newTime);
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

  const handleCreateButton = async () => {
    setIsLoading(true);
    setSuccess(false);

    const token = localStorage.getItem("chess_token");

    try {
      const response = await fetch(`${API_BASE_URL}/games`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name,
          increment: increment,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setError(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 10000);
        setGameId(result.Game_id);

        sessionStorage.setItem("startingSeconds", timer);
        sessionStorage.setItem("increment", increment);

        setName("");
        setTimer(600);
        setIncrement(0);
        navigate(`/game/${result.Game_id}`);
      } else {
        setError(true);
        setErrorMessage(result.error || result.msg);
      }
    } finally {
      setIsLoading(false);
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

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Choose Lobby's Name
                </Typography>

                <TextField
                  label="Name"
                  variant="standard"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  error={error}
                  helperText={error ? errorMessage : ""}
                />
                <Typography variant="subtitle1" gutterBottom>
                  Choose Pace (Minutes)
                </Typography>
                <ToggleButtonGroup
                  value={timer}
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

                <Button
                  loading={isLoading}
                  variant="outlined"
                  onClick={handleCreateButton}
                  sx={{
                    fontWeight: "bold",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.02)" },
                  }}
                  color={success ? "success" : "primary"}
                >
                  Create
                </Button>
              </Box>
            </Paper>
          </Container>
        </Box>
      </CustomTabPanel>
    </>
  );
}
export default GameConfig;
