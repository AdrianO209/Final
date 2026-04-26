import { useState, useCallback } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Box, Typography } from "@mui/material";

const chess = new Chess();

function ChessGame() {
  const [game, setGame] = useState(chess);
  const [fen, setFen] = useState(chess.fen());
  const [status, setStatus] = useState("White's turn");

  const updateStatus = (currentGame) => {
    if (currentGame.isCheckmate()) {
      const winner = currentGame.turn() === "w" ? "Black" : "White";
      setStatus(`Checkmate! ${winner} wins!`);
    } else if (currentGame.isDraw()) {
      setStatus("Draw!");
    } else if (currentGame.inCheck()) {
      const turn = currentGame.turn() === "w" ? "White" : "Black";
      setStatus(`${turn} is in check!`);
    } else {
      const turn = currentGame.turn() === "w" ? "White" : "Black";
      setStatus(`${turn}'s turn`);
    }
  };

  const onDrop = useCallback((sourceSquare, targetSquare) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // auto-promote to queen for now
      });

      if (!move) return false; // illegal move

      setFen(game.fen());
      updateStatus(game);
      return true;
    } catch {
      return false; // illegal move
    }
  }, [game]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 4 }}>
      <Typography variant="h6" color="text.primary">{status}</Typography>
      <Box sx={{ width: 500 }}>
        <Chessboard
          position={fen}
          onPieceDrop={onDrop}
          customDarkSquareStyle={{ backgroundColor: "#8CA2AD" }}
          customLightSquareStyle={{ backgroundColor: "#DEE3E6" }}
        />
      </Box>
    </Box>
  );
}

export default ChessGame;