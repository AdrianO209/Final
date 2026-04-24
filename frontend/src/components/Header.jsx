import { useState, useEffect } from "react";
import { Box, Grow, AppBar, Toolbar, Container } from "@mui/material";
import { GiChessQueen } from "react-icons/gi";

function Header() {
  const [anchorNav, setAnchorNav] = useState(null);

  const handleOpenNavMenu = (event) => setAnchorNav(event.currentTarget);
  const handleClose = () => setAnchorNav(null);

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
          </Toolbar>
        </Container>
      </AppBar>
    </Grow>
  );
}

export default Header;
