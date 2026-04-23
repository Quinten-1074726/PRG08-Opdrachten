import { tool } from "langchain";

export const getWeather = tool(
  async ({ city }) => {
    console.log("Weathertool wordt uitgevoerd");

    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;

      if (!apiKey) {
        return `I could not get the weather for ${city}, because the API key is missing.`;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
      );

      const data = await response.json();

      if (!response.ok || !data.main || !data.weather?.[0]) {
        return `I could not find the weather for ${city}.`;
      }

      const temp = data.main.temp;
      const description = data.weather[0].description;

      return `The weather in ${city} is ${description} with a temperature of ${temp}°C.`;
    } catch (error) {
      console.error("Weather tool error:", error);
      return `Something went wrong while getting the weather for ${city}.`;
    }
  },
  {
    name: "get_weather",
    description: "Get the current weather for a given city",
    schema: {
      type: "object",
      properties: {
        city: { type: "string" },
      },
      required: ["city"],
    },
  }
);

export const rollDice = tool(
  ({ sides }) => {
    console.log("Dice tool wordt uitgevoerd");

    const result = Math.floor(Math.random() * sides) + 1;
    return `You rolled a ${result} on a ${sides}-sided dice.`;
  },
  {
    name: "roll_dice",
    description: "Roll a dice with a given number of sides",
    schema: {
      type: "object",
      properties: {
        sides: { type: "number" },
      },
      required: ["sides"],
    },
  }
);

export const getDate = tool(
  () => {
    console.log("Date tool wordt uitgevoerd");

    const today = new Date();
    const readableDate = today.toLocaleDateString("nl-NL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `Vandaag is het ${readableDate}.`;
  },
  {
    name: "get_date",
    description: "Get today's current date",
    schema: {
      type: "object",
      properties: {},
      required: [],
    },
  }
);