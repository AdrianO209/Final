import { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Container,
  Divider,
} from "@mui/material";

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
              </Paper>
            </Container>
          </Box>
        </CustomTabPanel>
      </Paper>
    </>
  );
}

export default Dashboard;
