import { useState } from "react";
import { Box, Typography, Tabs, Tab, Paper, Divider } from "@mui/material";
import GameConfig from "./GameConfig.jsx";

function Dashboard() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const handleChange = (event, newValue) => {
    setActiveTabIndex(newValue);
  };
  const sharedTabStyles = {
    fontSize: "1.1rem",
    fontWeight: "bold",
    padding: "20px 30px",
  };
  return (
    <>
      <Paper
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
        }}
      >
        <Tabs
          value={activeTabIndex}
          onChange={handleChange}
          textColor="inherit"
          indicatorColor="primary"
          variant="fullWidth"
        >
          <Tab label="Create Game!" sx={sharedTabStyles} />
          <Tab label="Join a Game!" sx={sharedTabStyles} />
        </Tabs>

        <Divider />
      </Paper>
      <GameConfig activeTabIndex={activeTabIndex} />
    </>
  );
}

export default Dashboard;
