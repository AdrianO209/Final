import { useState } from "react";
import { Box, Typography, Paper, Container } from "@mui/material";
import CustomTabPanel from "./CustomTabPanel.jsx";

const API_BASE_URL = "https://backend-production-5b92.up.railway.app";

function Join({ activeTabIndex }) {
  const [matchList, setMatchList] = useState([]);
  const [hasError, setHasError] = useState(false);

  const fetch = async () => {
    const response = await fetch(`${API_BASE_URL}/fetch`);
    const result = await response.json();

    if (response.ok) {
      setMatchList(result);
    } else {
      setHasError(true);
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
              <Typography
                variant="h5"
                align="center"
                sx={{ fontWeight: "bold", mb: 3 }}
              >
                Matches
              </Typography>{" "}
            </Paper>
          </Container>
        </Box>
      </CustomTabPanel>
    </Box>
  );
}

export default Join;
