// import { useState, useEffect } from "react";
import { Box, Grow, AppBar, Toolbar, Container, Button } from "@mui/material";
import { GiChessQueen } from "react-icons/gi";

function Header({ isLoggedIn }) {
  // const [anchorNav, setAnchorNav] = useState(null);

  // const handleOpenNavMenu = (event) => setAnchorNav(event.currentTarget);
  // const handleClose = () => setAnchorNav(null);

  return (
    <Grow in={true} timeout={1000}>
      <AppBar
        position="static"
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          minHeight: "10%",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ display: "flex", alignItems: "center" }}>
            <GiChessQueen size={50} />
            {isLoggedIn ? (
              <Box
                sx={{
                  ml: "auto",
                  color: "primary.contrastText",
                  bgcolor: "primary.main",
                }}
              >
                <Button color="inherit">Sign Out</Button>
              </Box>
            ) : null}
          </Toolbar>
        </Container>
      </AppBar>
    </Grow>
  );
}

export default Header;
