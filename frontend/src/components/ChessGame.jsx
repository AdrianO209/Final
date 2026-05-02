import { useState, useRef, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Box, Typography, Paper } from "@mui/material";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const API_URL = "https://backend-production-5b92.up.railway.app";
const socket = io(API_URL, { autoConnect: false });

function ChessGame() {
  const game = useRef(new Chess());
  const [fen, setFen] = useState(new Chess().fen());
  const [moveFrom, setMoveFrom] = useState("");
  const [optionSquares, setOptionSquares] = useState({});
  const [status, setStatus] = useState("White to move");
  const { matchId } = useParams();
  const [myColor, setMyColor] = useState(null);
  const myColorRef = useRef(null);
  const [gameReady, setGameReady] = useState(false);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join_game", { room: matchId });

    socket.on("assign_color", (color) => {
      setMyColor(color);
      myColorRef.current = color;
      setStatus(color === "w" ? "Your turn (White)" : "Waiting for White...");
    });

    socket.on("move_update", (newFen) => {
      game.current.load(newFen);
      setFen(newFen);
      setOptionSquares({});

      if (game.current.isGameOver()) {
        setStatus(
          game.current.isCheckmate()
            ? "Checkmate! Game Over."
            : "Game Over (Draw)",
        );
      } else {
        const isMyTurn = game.current.turn() === myColorRef.current;
        const turnLabel = game.current.turn() === "w" ? "White" : "Black";
        setStatus(isMyTurn ? "Your turn" : `Waiting for ${turnLabel}...`);
      }
    });
    socket.on("game_ready", (data) => {
      setGameReady(data.ready);
    });

    socket.on("player_status", (data) => {
      setGameReady(data.ready);
    });

    socket.on("error", (msg) => {
      console.error("Server Error:", msg);
    });

    return () => {
      socket.off("assign_color");
      socket.off("move_update");
      socket.off("error");
      socket.off("game_ready");
      socket.off("player_status");
      socket.disconnect();
    };
  }, [matchId]);

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
    if (!gameReady) return;

    if (!myColor || game.current.turn() !== myColor) return;

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
