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

    const response = await callAgent(prompt, userid || "default-user");
    res.json(response);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      message: "Er ging iets mis met de server.",
      usedTools: [],
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});