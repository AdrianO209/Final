import LoginForm from "./LoginForm.jsx";
import Header from "./Header.jsx";
import { Box } from "@mui/material";

function LoginPage() {
  return (
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
  );
}

export default LoginPage;
