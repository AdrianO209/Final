import { useState, useEffect } from "react";
import {
  Box,
  Grow,
  AppBar,
  Toolbar,
  Container,
  Button,
  Typography,
} from "@mui/material";
import { GiChessQueen } from "react-icons/gi";
import { useNavigate, useLocation } from "react-router-dom";

function Header({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = "https://backend-production-5b92.up.railway.app";
  const [userName, setUserName] = useState("");

  const isMatchPage = location.pathname.startsWith("/game");

  const handleSignOut = () => {
    sessionStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    navigate("/login");
  };
  // const [anchorNav, setAnchorNav] = useState(null);

  // const handleOpenNavMenu = (event) => setAnchorNav(event.currentTarget);
  // const handleClose = () => setAnchorNav(null);

  useEffect(() => {
    const fetchUserName = async () => {
      const token = localStorage.getItem("chess_token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        setUserName(result.username);
      }
    };

    fetchUserName();
  }, [isLoggedIn]);

  return (
    <Grow in={true} timeout={1000}>
      <AppBar
        position="static"
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          minHeight: "10%",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ display: "flex", alignItems: "center" }}>
            <GiChessQueen size={50} color="white" />
            {isLoggedIn ? (
              <>
                {!isMatchPage && (
                  <Typography
                    variant="h4"
                    sx={{
                      color: "white",
                      fontWeight: 500,
                      opacity: 0.9,
                      ml: 2,
                      mt: 2,
                      textTransform: "capitalize",
                    }}
                  >
                    Welcome Back, {userName}
                  </Typography>
                )}

                <Box sx={{ ml: "auto" }}>
                  <Button
                    onClick={handleSignOut}
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      mt: 2,
                      "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                    }}
                  >
                    Sign Out
                  </Button>
                </Box>
              </>
            ) : null}
          </Toolbar>
        </Container>
      </AppBar>
    </Grow>
  );
}

export default Header;
