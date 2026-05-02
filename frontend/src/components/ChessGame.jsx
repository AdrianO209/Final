import { useState, useRef, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";
import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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

    // 2. FIRST CLICK: Selecting a piece to move
    if (!moveFrom) {
      const pieceDetails = game.current.get(square);
      // Only allow selecting pieces that belong to the player
      if (pieceDetails && pieceDetails.color === myColor) {
        const hasOptions = getMoveOptions(square);
        if (hasOptions) setMoveFrom(square);
      }
      return;
    }

    // 3. CHANGING YOUR MIND: Clicking a different one of your own pieces
    const targetPiece = game.current.get(square);
    if (targetPiece && targetPiece.color === myColor) {
      const hasOptions = getMoveOptions(square);
      if (hasOptions) {
        setMoveFrom(square);
      } else {
        setMoveFrom("");
        setOptionSquares({});
      }
      return;
    }

    // 4. THE FIX: Executing the move over WebSockets

    // Quick check for Pawn Promotion (auto-queen)
    const movingPiece = game.current.get(moveFrom);
    const isPromotion =
      movingPiece.type === "p" &&
      ((movingPiece.color === "w" && square[1] === "8") ||
        (movingPiece.color === "b" && square[1] === "1"));

    const moveString = `${moveFrom}${square}${isPromotion ? "q" : ""}`;

    // Emit the move to Flask. Notice we DO NOT use setFen() here!
    socket.emit("make_move", {
      room: matchId,
      move: moveString,
    });

    // Clear the yellow/grey UI highlights
    setMoveFrom("");
    setOptionSquares({});
  }

  const handleLeaveGame = () => {
    navigate("/dashboard");
  };

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
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          backgroundColor: "#312e2b",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: { xs: "90vw", sm: 500, md: 600 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {!gameReady && <CircularProgress size={24} sx={{ color: "#aaa" }} />}
          <Box>
            <Typography variant="h6" sx={{ margin: 0 }}>
              {!gameReady ? "Waiting for opponent..." : status}
            </Typography>
            {myColor && (
              <Typography
                variant="caption"
                sx={{ display: "block", color: "#aaa" }}
              >
                Playing as: {myColor === "w" ? "White" : "Black"}
              </Typography>
            )}
          </Box>
        </Box>

        <Button variant="outlined" color="error" onClick={handleLeaveGame}>
          Leave Match
        </Button>
      </Paper>
      <Box sx={{ width: { xs: "90vw", sm: 500, md: 600 } }}>
        <Chessboard options={chessboardOptions} />
      </Box>
    </Box>
  );
}

export default ChessGame;
