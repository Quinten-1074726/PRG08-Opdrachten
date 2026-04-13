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
    const response = await callAssistant(message);
    res.json({ response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ response: "Something went wrong." });
  }
});

app.listen(3000, () => {
  console.log("Server on http://localhost:3000");
});