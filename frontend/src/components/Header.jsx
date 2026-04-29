// import { useState, useEffect } from "react";
import { Box, Grow, AppBar, Toolbar, Container, Button } from "@mui/material";
import { GiChessQueen } from "react-icons/gi";
import { useNavigate } from "react-router-dom";

function Header({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    sessionStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    navigate("/login");
  };
  // const [anchorNav, setAnchorNav] = useState(null);

  // const handleOpenNavMenu = (event) => setAnchorNav(event.currentTarget);
  // const handleClose = () => setAnchorNav(null);

  return (
    <Grow in={true} timeout={1000}>
      <AppBar
        position="static"
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          minHeight: "10%",
          borderBottom: "1px solid #00A8FF",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ display: "flex", alignItems: "center" }}>
            <GiChessQueen size={50} color="white" />
            {isLoggedIn ? (
              <Box
                sx={{
                  ml: "auto",
                }}
              >
                <Button
                  onClick={handleSignOut}
                  sx={{
                    color: "white",
                    fontweight: "bold",
                    bgcolor: "transparent",
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  Sign Out
                </Button>
              </Box>
            ) : null}
          </Toolbar>
        </Container>
      </AppBar>
    </Grow>
  );
}

export default Header;
