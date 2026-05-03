import { micromark } from "https://esm.sh/micromark@4?bundle";

const form = document.getElementById("chat-form");
const input = document.getElementById("prompt-input");
const messages = document.getElementById("messages");
const button = form.querySelector("button");

let userId = localStorage.getItem("userId");

if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem("userId", userId);
}

loadHistory();

async function loadHistory() {
  try {
    const response = await fetch("/api/gethistory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    const history = await response.json();

    for (const item of history) {
      if (item.role === "user") {
        addUserMessage(item.message);
      } else {
        addAssistantMessage(item.message, item.usedTools || []);
      }
    }
  } catch (error) {
    addAssistantMessage("Could not load previous chat history.", []);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const prompt = input.value.trim();
  if (!prompt) return;

  addUserMessage(prompt);
  input.value = "";

  button.disabled = true;
  input.disabled = true;
  button.textContent = "Loading...";

  try {
    const result = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, message: prompt }),
    });

    const data = await result.json();

    if (!result.ok) {
      addAssistantMessage(data.message || "Er ging iets mis.", []);
      return;
    }

    addAssistantMessage(data.message, data.usedTools || []);
  } catch (error) {
    console.error(error);
    addAssistantMessage("Er ging iets mis met de server.", []);
  } finally {
    button.disabled = false;
    input.disabled = false;
    button.textContent = "Send";
    input.focus();
  }
});

function addUserMessage(text) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message-row", "user-row");

  const bubble = document.createElement("div");
  bubble.classList.add("bubble", "user-bubble");
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

function addAssistantMessage(text, usedTools = []) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message-row", "assistant-row");

  const bubble = document.createElement("div");
  bubble.classList.add("bubble", "assistant-bubble");

  const textEl = document.createElement("div");
  textEl.innerHTML = micromark(text || "");
  bubble.appendChild(textEl);

  if (Array.isArray(usedTools) && usedTools.length > 0) {
    const toolsWrap = document.createElement("div");
    toolsWrap.classList.add("tools-wrap");

    usedTools.forEach((tool) => {
      const tag = document.createElement("span");
      tag.classList.add("tool-tag");
      tag.textContent = `🔧 ${tool}`;
      toolsWrap.appendChild(tag);
    });

    bubble.appendChild(toolsWrap);
  }

  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}