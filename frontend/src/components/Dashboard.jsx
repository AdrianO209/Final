import { useState } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

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
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Tabs value={activeTabIndex} onChange={handleChange}>
          <Tab label="Create Game!" sx={sharedTabStyles} />
          <Tab label="Join a Game!" sx={sharedTabStyles} />
        </Tabs>
      </Box>
      <CustomTabPanel value={activeTabIndex} index={0}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: "10px" }}>
          <Typography>Test</Typography>
        </Box>
      </CustomTabPanel>
    </>
  );
}

export default Dashboard;
