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
    addMessage(data.response, "assistant");
  } catch (error) {
    addMessage("Er ging iets mis met de server.", "assistant");
  } finally {
    button.disabled = false;
  }
});

function addMessage(text, role) {
  const messageEl = document.createElement("div");
  messageEl.classList.add("message", role);

  if (role === "assistant") {
    messageEl.innerHTML = micromark(text);
  } else {
    messageEl.textContent = text;
  }

  messagesDiv.appendChild(messageEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}