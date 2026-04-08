const form = document.getElementById("chat-form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = input.value;
  if (!message) return;

  // toon user bericht
  const userMsg = document.createElement("div");
  userMsg.textContent = "You: " + message;
  messages.appendChild(userMsg);

  // knop disablen
  const button = form.querySelector("button");
  button.disabled = true;

  // API call
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();

  // toon AI antwoord
  const botMsg = document.createElement("div");
  botMsg.textContent = "AI: " + data.response;
  messages.appendChild(botMsg);

  // reset
  input.value = "";
  button.disabled = false;
});