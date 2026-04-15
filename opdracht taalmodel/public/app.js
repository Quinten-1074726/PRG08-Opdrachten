import { micromark } from "https://esm.sh/micromark@4?bundle";

const form = document.getElementById("chat-form");
const input = document.getElementById("input");
const messagesDiv = document.getElementById("messages");
const button = form.querySelector("button");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";
  button.disabled = true;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    addMessage(data.message, "assistant", data.tokens);
  } catch (error) {
    addMessage("Er ging iets mis met de server.", "assistant");
  } finally {
    button.disabled = false;
  }
});

function addMessage(text, role, tokens = null) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message", role);

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");

  if (role === "assistant") {
    bubble.innerHTML = micromark(text);
  } else {
    bubble.textContent = text;
  }

  if (tokens !== null) {
    const tokenInfo = document.createElement("div");
    tokenInfo.classList.add("tokens");
    tokenInfo.textContent = `Tokens: ${tokens}`;
    bubble.appendChild(tokenInfo);
  }

  wrapper.appendChild(bubble);
  messagesDiv.appendChild(wrapper);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}