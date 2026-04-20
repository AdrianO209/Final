import LoginForm from "./LoginForm.jsx";
import { Box } from "@mui/material";

function LoginPage() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <LoginForm />
    </Box>
  );
}

export default LoginPage;
