import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import "./App.css";
import LoginPage from "./components/LoginPage.jsx";
import Header from "./components/Header.jsx";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
        }}
      >
        <Header isLoggedIn={isLoggedIn} />

        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
              path="/login"
              element={<LoginPage setIsLoggedIn={setIsLoggedIn} />}
            />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;
