import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Divider,
  Grow,
  Stack,
} from "@mui/material";

function LoginForm() {
  return (
    <Grow in={true} timeout={1000}>
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: "450px",
          p: 4,
          backgroundColor: "background.paper",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Stack alignItems="center" sx={{ width: "100%", mb: 1 }}>
          {" "}
          <Typography
            variant="h4"
            sx={{
              background: "linear-gradient(45deg, #00A8FF 30%, #DEE3E6 90%)",
              display: "inline-block",
              color: "transparent",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
              letterSpacing: "0.1rem",
              textTransform: "uppercase",
              width: "fit-content",
            }}
          >
            Log In
          </Typography>
          <Divider
            sx={{ width: "35%", borderColor: "divider", opacity: 0.6, mt: 1 }}
          />
        </Stack>

        <Stack spacing={3} sx={{ width: "100%", mt: 3 }}>
          <TextField label="Username" fullWidth size="medium" />
          <TextField label="Password" type="password" fullWidth size="medium" />

          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{
              mt: 2,
              fontWeight: "bold",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.02)",
              },
            }}
          >
            Sign In
          </Button>
        </Stack>
      </Paper>
    </Grow>
  );
}

export default LoginForm;
