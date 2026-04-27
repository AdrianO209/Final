import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",

    primary: {
      main: "#E07A5F",
      contrastText: "#151E24",
    },

    background: {
      default: "#151E24",
      paper: "#1E2B34",
    },

    text: {
      primary: "#DEE3E6",
      secondary: "#8CA2AD",
    },
    squares: {
      lightSquare: "#DEE3E6",
      darkSquare: "#8CA2AD",
      activeHighlight: "rgba(0, 168, 255, 0.4)",
      lastMoveHighlight: "rgba(0, 168, 255, 0.2)",
    },
  },
});

export default theme;
