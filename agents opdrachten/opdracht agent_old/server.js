import express from "express";
import { agent } from "./agent.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  const { prompt, userid } = req.body;

  try {
    const result = await agent.invoke(
      {
        messages: [{ role: "user", content: prompt }],
      },
      {
        configurable: { thread_id: userid },
      }
    );

  const final = result.structuredResponse;
  console.log("Structured response:", final);

  res.json({
    message: final.message,
    image: final.image,
    usedTools: result.intermediateSteps?.map((step) => step.tool) || [],
  });
  } catch (err) {
    console.error(err);
    res.json({
      message: "Er ging iets mis.",
      image: "",
      usedTools: [],
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});