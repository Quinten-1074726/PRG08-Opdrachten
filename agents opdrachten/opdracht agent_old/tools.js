import { tool } from "@langchain/core/tools";
import Replicate from "replicate";

export const generateImage = tool(
  async ({ subject }) => {
    console.log(` generating image for: ${subject}`);

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    try {
      const input = {
        prompt: subject,
        aspect_ratio: "1:1",
      };

      const output = await replicate.run(
        "black-forest-labs/flux-schnell",
        { input }
      );

      const imageUrl = Array.isArray(output) ? output[0] : output;
      console.log("Generated image URL:", imageUrl);

      return imageUrl;
    } catch (error) {
      console.error("Replicate error:", error);
      return "";
    }
  },
  {
    name: "generate_image",
    description: "Generate an image based on a scene or subject",
    schema: {
      type: "object",
      properties: {
        subject: { type: "string" },
      },
      required: ["subject"],
    },
  }
);