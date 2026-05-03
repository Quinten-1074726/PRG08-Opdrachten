import express from "express";
import { callAgent, getHistory } from "./agent.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "Missing userId",
        usedTools: [],
      });
    }

    const response = await callAgent(message, userId);
    res.json(response);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      message: "Er ging iets mis met de server.",
      usedTools: [],
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
  console.log("Server running on http://localhost:3000");
});