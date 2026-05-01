import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Container,
  List,
  ListItem,
  Button,
  Tooltip,
} from "@mui/material";
import CustomTabPanel from "./CustomTabPanel.jsx";

const API_BASE_URL = "https://backend-production-5b92.up.railway.app";

function Join({ activeTabIndex }) {
  const [matchList, setMatchList] = useState([]);

  useEffect(() => {
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
        console.error("Fetch failed:", err);
      }
    };

    if (activeTabIndex == 1) {
      fetchData();
    }
  }, [activeTabIndex]);

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
              <Typography
                variant="h5"
                align="center"
                sx={{ fontWeight: "bold", mb: 3 }}
              >
                Matches
              </Typography>{" "}
              {matchList.map((current) => (
                <ListIteam
                  key={current.id}
                  divider
                  secondaryAction={
                    <Tooltip title="Join">
                      <Button>Join</Button>
                    </Tooltip>
                  }
                >
                  <ListItem primary={current.name || `Lobby #${current.id}`} />
                </ListIteam>
              ))}
            </Paper>
          </Container>
        </Box>
      </CustomTabPanel>
    </Box>
  );
}

export default Join;
