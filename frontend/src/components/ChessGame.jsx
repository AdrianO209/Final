import { useState, useRef, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Box, Typography, Paper } from "@mui/material";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

function ChessGame() {
  const game = useRef(new Chess());
  const [fen, setFen] = useState(new Chess().fen());
  const [moveFrom, setMoveFrom] = useState("");
  const [optionSquares, setOptionSquares] = useState({});
  const [status, setStatus] = useState("White to move");

  function getMoveOptions(square) {
    const moves = game.current.moves({ square, verbose: true });

    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares = {};
    moves.forEach((move) => {
      newSquares[move.to] = {
        background:
          game.current.get(move.to) &&
          game.current.get(move.to)?.color !== game.current.get(square)?.color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
    });

    newSquares[square] = { background: "rgba(255, 255, 0, 0.4)" };
    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick({ square, piece }) {
    if (!moveFrom && piece) {
      const hasOptions = getMoveOptions(square);
      if (hasOptions) setMoveFrom(square);
      return;
    }

    try {
      game.current.move({
        from: moveFrom,
        to: square,
        promotion: "q",
      });

      setFen(game.current.fen());
      setMoveFrom("");
      setOptionSquares({});

      const nextTurn = game.current.turn() === "w" ? "White" : "Black";
      setStatus(
        game.current.isGameOver() ? "Game Over!" : `${nextTurn} to move`,
      );
    } catch {
      const hasOptions = getMoveOptions(square);
      if (hasOptions) {
        setMoveFrom(square);
      } else {
        setMoveFrom("");
        setOptionSquares({});
      }
    }
  }

  const chessboardOptions = {
    id: "ClickToMoveBoard",
    position: fen,
    onSquareClick: onSquareClick,
    squareStyles: optionSquares,
    allowDragging: false,
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 4,
      }}
    >
      <Paper elevation={3} sx={{ p: 2, mb: 2, backgroundColor: "#312e2b" }}>
        <Typography variant="h6" sx={{ color: "#fff", textAlign: "center" }}>
          {status}
        </Typography>
      </Paper>
      <Box sx={{ width: { xs: "90vw", sm: 500, md: 600 } }}>
        <Chessboard options={chessboardOptions} />
      </Box>
    </Box>
  );
}

export default ChessGame;
