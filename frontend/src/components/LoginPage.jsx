import LoginForm from "./LoginForm.jsx";
import Header from "./Header.jsx";
import { Box } from "@mui/material";

function LoginPage() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <Header />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "background.default",
        }}
      >
        <LoginForm />
      </Box>
    </Box>
  );
}

export default LoginPage;
