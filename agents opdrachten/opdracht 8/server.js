import express from "express";
import { callAgent } from "./agent.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt, userid } = req.body;

    if (!prompt) {
      return res.status(400).json({
        message: "Missing prompt",
        usedTools: [],
      });
    }

    if (!userid) {
      return res.status(400).json({
        message: "Missing userid",
        usedTools: [],
      });
    }

    const response = await callAgent(prompt, userid);
    res.json(response);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      message: "Sorry, the assistant is currently unavailable.",
      usedTools: [],
    });
  }
});

app.listen(3000, () => console.log("started on localhost:3000"));