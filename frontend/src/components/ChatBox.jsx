import { useState, useEffect, useRef } from "react";
import { Box, Typography, TextField, IconButton, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

function ChatBox({ socket, matchID, username }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("send_message", {
      room: String(matchID),
      message: input.trim(),
      username: username || "Anonymous",
    });
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        display: "flex",
        flexDirection: "column",
        width: { xs: "90vw", sm: 500, md: 600 },
        height: 300,
        mt: 2,
        backgroundColor: "#312e2b",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Typography variant="subtitle2" sx={{ color: "#aaa", fontWeight: "bold" }}>
          Match Chat
        </Typography>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          px: 2,
          py: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "4px" },
        }}
      >
        {messages.length === 0 && (
          <Typography variant="caption" sx={{ color: "#555", mt: 1 }}>
            No messages yet. Say something!
          </Typography>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.username === username;
          return (
            <Box
              key={i}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: isMe ? "flex-end" : "flex-start",
              }}
            >
              <Typography variant="caption" sx={{ color: "#777", mb: 0.2 }}>
                {msg.username}
              </Typography>
              <Box
                sx={{
                  backgroundColor: isMe ? "#00A8FF22" : "rgba(255,255,255,0.07)",
                  border: isMe ? "1px solid #00A8FF44" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                  px: 1.5,
                  py: 0.75,
                  maxWidth: "80%",
                }}
              >
                <Typography variant="body2" sx={{ color: "#DEE3E6", wordBreak: "break-word" }}>
                  {msg.message}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={bottomRef} />
      </Box>

      {/* Input */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1.5,
          py: 1,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(255,255,255,0.05)",
              color: "#DEE3E6",
              fontSize: "0.875rem",
              "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
              "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
              "&.Mui-focused fieldset": { borderColor: "#00A8FF" },
            },
            "& input::placeholder": { color: "#555" },
          }}
        />
        <IconButton
          onClick={sendMessage}
          size="small"
          sx={{
            color: input.trim() ? "#00A8FF" : "#444",
            transition: "color 0.2s",
            "&:hover": { color: "#00A8FF", bgcolor: "rgba(0,168,255,0.1)" },
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
}

export default ChatBox;
