import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import Header from "../../components/Header";

const autoResponses = [
  {
    keywords: ["régime", "maigrir", "perdre du poids"],
    response: "Voici quelques conseils : mangez équilibré, évitez le sucre raffiné, et faites du cardio 3 fois par semaine.",
  },
  {
    keywords: ["musculation", "prise de masse", "muscle"],
    response: "Pour prendre du muscle : mangez plus de protéines, dormez bien, et faites des entraînements de force.",
  },
  {
    keywords: ["santé", "bien-être", "fatigue"],
    response: "Pensez à bien vous hydrater, manger sainement, et dormir au moins 7h par nuit.",
  },
  {
    keywords: ["bonjour", "salut", "coucou"],
    response: "Bonjour ! Comment puis-je vous aider sur votre santé ou programme sportif ?",
  },
];

const getAutoResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  for (let entry of autoResponses) {
    if (entry.keywords.some((keyword) => lowerMessage.includes(keyword))) {
      return entry.response;
    }
  }
  return "Je suis désolé, je n'ai pas compris. Pouvez-vous reformuler ?";
};

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?" },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const botMessage = { from: "bot", text: getAutoResponse(input) };
      setMessages((prev) => [...prev, botMessage]);
    }, 2000);

    setInput("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box m="20px">
      <Header title="Assistant virtuel" />

      <Paper
        elevation={3}
        sx={{
          p: 2,
          height: "400px",
          overflowY: "hidden",
          mb: 2,
          bgcolor: "rgba(245, 245, 245, 0.75) ",
          borderRadius: 3,
          border: "1px solid #ccc",
        }}
      >
        {messages.map((msg, idx) => (
          <Box
            key={idx}
            display="flex"
            justifyContent={msg.from === "user" ? "flex-end" : "flex-start"}
            mb={1}
          >
            <Box
              sx={{
                bgcolor: msg.from === "user" ? "#1976d2" : "#e0e0e0",
                color: msg.from === "user" ? "white" : "black",
                px: 2,
                py: 1,
                borderRadius: "16px",
                maxWidth: "75%",
                boxShadow: 1,
              }}
            >
              <Typography variant="body2">{msg.text}</Typography>
            </Box>
          </Box>
        ))}
        <div ref={chatEndRef} />
      </Paper>

      <Box display="flex" gap={2} alignItems="center">
        <TextField
        fullWidth
        variant="outlined"
        placeholder="Écrivez votre message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
        }}
        sx={{
            "& .MuiOutlinedInput-root": {
            borderRadius: "20px",
            overflowY: "hidden",
            backgroundColor: " rgba(245, 245, 245, 0.75)  ",
            color: "black",
            },
            input: {
            color: "black", 
            },
        }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          sx={{
            px: 3,
            py: 1,
            borderRadius: "20px",
            textTransform: "none",
            fontWeight: "bold",
          }}
        >
          Envoyer
        </Button>
      </Box>
    </Box>
  );
};

export default ChatBot;
