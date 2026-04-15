import express from "express";
import { callGame, getHistory } from "./chat.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("public/index.html", { root: "." });
});

app.post("/api/game", async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "Missing userId.",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a message.",
      });
    }

    const response = await callGame(userId, message);
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong in the detective game.",
    });
  }
});

app.post("/api/gethistory", (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json([]);
    }

    const history = getHistory(userId);
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
});

app.listen(3000, () => {
  console.log("Server on http://localhost:3000");
});