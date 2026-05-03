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

    const token = localStorage.getItem("chess_token");
    socket.emit("join_game", { room: matchId, token: token });

    socket.on("assign_color", (color) => {
      setMyColor(color);
      myColorRef.current = color;
      setStatus(color === "w" ? "Your turn (White)" : "Waiting for White...");
    });

    socket.on("move_update", (data) => {
      const newFen = typeof data === "string" ? data : data.fen;

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

    socket.on("player_left", (data) => {
      setStatus("Opponent left the game.");
      setGameReady(false);

      alert(data.msg);
    });

    return () => {
      socket.off("join_game");
      socket.off("assign_color");
      socket.off("move_update");
      socket.off("game_ready");
      socket.off("player_status");
      socket.off("error");
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

    if (!moveFrom) {
      const pieceDetails = game.current.get(square);
      if (pieceDetails && pieceDetails.color === myColor) {
        const hasOptions = getMoveOptions(square);
        if (hasOptions) setMoveFrom(square);
      }
      return;
    }

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

    const movingPiece = game.current.get(moveFrom);
    const isPromotion =
      movingPiece.type === "p" &&
      ((movingPiece.color === "w" && square[1] === "8") ||
        (movingPiece.color === "b" && square[1] === "1"));

    const moveString = `${moveFrom}${square}${isPromotion ? "q" : ""}`;

    socket.emit("make_move", {
      room: matchId,
      move: moveString,
    });

    setMoveFrom("");
    setOptionSquares({});
  }

  const handleLeaveGame = async () => {
    const token = localStorage.getItem("chess_token");
    await fetch(`${API_URL}/leave/${matchId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    navigate("/dashboard");
  };

  const chessboardOptions = {
    id: "ClickToMoveBoard",
    position: fen,
    onSquareClick: onSquareClick,
    squareStyles: optionSquares,
    boardOrientation: myColor === "b" ? "black" : "white",
    arePiecesDraggable: false,
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
            {myColor ? (
              <Typography
                variant="caption"
                sx={{ display: "block", color: "#aaa" }}
              >
                Playing as: {myColor === "w" ? "White" : "Black"}
              </Typography>
            ) : (
              <Typography
                variant="caption"
                sx={{ display: "block", color: "#4caf50" }}
              >
                Spectating Match{" "}
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
