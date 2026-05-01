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
import LoadingButton from "@mui/lab/LoadingButton";
import { useNavigate } from "react-router-dom";

function LoginForm({ setIsLoggedIn }) {
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  const navigate = useNavigate();
  const API_BASE_URL = "https://backend-production-5b92.up.railway.app";

  useEffect(() => {
    sessionStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  }, [setIsLoggedIn]);

  const fetchLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error);
        setHasError(true);
        setIsLoggedIn(false);
      } else {
        setUsernameInput("");
        setPasswordInput("");
        setErrorMessage("");
        setHasError(false);

        setIsLoggedIn(true);
        sessionStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("chess_token", result.token);
        navigate("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegister = async () => {
    setIsRegisterLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error);
        setHasError(true);
        setIsLoggedIn(false);
      } else {
        setUsernameInput("");
        setPasswordInput("");
        setErrorMessage("");
        setHasError(false);

        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 10000);
        setIsRegisterLoading(false);
      }
    } finally {
      setIsRegisterLoading(false);
    }
  };

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
          <TextField
            label="Username"
            fullWidth
            size="medium"
            value={usernameInput}
            onChange={(e) => {
              setUsernameInput(e.target.value);
              setHasError(false);
            }}
            error={hasError}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            size="medium"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setHasError(false);
            }}
            error={hasError}
            helperText={hasError ? errorMessage : ""}
          />

          <LoadingButton
            loading={isLoading}
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
            onClick={fetchLogin}
          >
            Sign In
          </LoadingButton>

          <LoadingButton
            loading={isRegisterLoading}
            variant="text"
            size="small"
            sx={{
              fontWeight: "bold",
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.02)" },
            }}
            onClick={fetchRegister}
            color={isSuccess ? "success" : "primary"}
          >
            Register
          </LoadingButton>
        </Stack>
      </Paper>
    </Grow>
  );
}

export default LoginForm;
