import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Container,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Button,
  Tooltip,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CustomTabPanel from "./CustomTabPanel.jsx";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://backend-production-5b92.up.railway.app";

function Join({ activeTabIndex }) {
  const [matchList, setMatchList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("chess_token");
      const response = await fetch(`${API_BASE_URL}/fetch`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (response.ok) {
        setMatchList(result);
      }
    } catch (err) {
      console.error("Fetch Failed:", err);
    }
  };
  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchData();
    setIsLoading(false);
  };
  useEffect(() => {
    if (activeTabIndex == 1) {
      fetchData();
    }
  }, [activeTabIndex]);

  useEffect(() => {
    if (activeTabIndex == 1) {
      const interval = setInterval(() => {
        fetchData();
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [activeTabIndex]);

const joinGame = async (matchID) => {
  const token = localStorage.getItem("chess_token");
  const response = await fetch(`${API_BASE_URL}/join/${matchID}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (response.ok) {
    console.log("Success!", matchID);
    navigate(`/game/${matchID}`);
  } else {
    return console.error("Join failed:", result.error);
  }
};

  return (
    <Box>
      <CustomTabPanel value={activeTabIndex} index={1}>
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
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  Matches
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Refresh"}
                </Button>
              </Box>
              <List
                sx={{ overflowY: "auto", maxHeight: "50vh" }}
                subheader={
                  <ListSubheader
                    sx={{
                      color: "primary.main",
                      fontWeight: "bold",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: 2,
                      zIndex: 1,
                    }}
                  >
                    <span>Lobby's Name</span>
                    <span style={{ marginRight: "1rem" }}>Status</span>
                  </ListSubheader>
                }
              >
                {matchList.map((current) => (
                  <ListItem
                    key={current.id}
                    divider
                    secondaryAction={
                      current.status === "active" || current.status === "waiting" ? (
                        <Tooltip title="Join">
                          <IconButton
                            sx={{ mr: 2 }}
                            onClick={() => joinGame(current.id)}
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Spectate">
                          <IconButton
                            sx={{ mr: 2 }}
                            onClick={() => navigate(`/game/${current.id}`)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }
                  >
                    <ListItemText
                      primary={current.name || `Lobby #${current.id}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Container>
        </Box>
      </CustomTabPanel>
    </Box>
  );
}

export default Join;
