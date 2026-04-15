import express from "express";
import { callAssistant } from "./chat.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("public/index.html", { root: "." });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        response: "Please enter a message.",
      });
    }

    const response = await callAssistant(message);
    res.json(response);

  } catch (error) {
    console.error(error);

    if (error?.code === "content_filter" || error?.error?.code === "content_filter") {
      return res.status(400).json({
        response:
          "That question cannot be answered in this form. Try asking it as part of the investigation in a safe, fictional way.",
      });
    }

    res.status(500).json({
      response: "Something went wrong on the server.",
    });
  }
});

app.listen(3000, () => {
  console.log("Server on http://localhost:3000");
});