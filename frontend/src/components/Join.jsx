import { useState } from "react";
import { Box, Typography, Paper, Container } from "@mui/material";
import CustomTabPanel from "./CustomTabPanel.jsx";

function Join({ activeTabIndex }) {
  const allMatches = [];

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
