import express from "express";
import { callAssistant } from "./chat.js";

const app = express();
app.use(express.json());



app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile("public/index.html", { root: "." });
});

app.get("/api/test", async (req, res) => {
  const response = await callAssistant("why do parrots talk?");
  res.json({ response });
});

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    const response = await callAssistant(message);

    res.json({ response });
});


app.listen(3000, () => console.log("Server on http://localhost:3000"));