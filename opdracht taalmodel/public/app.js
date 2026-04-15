import { micromark } from "https://esm.sh/micromark@4?bundle";

const form = document.getElementById("chat-form");
const input = document.getElementById("input");
const messagesDiv = document.getElementById("messages");
const button = form.querySelector("button");

let userId = localStorage.getItem("userId");

if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem("userId", userId);
}

loadHistory();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = input.value.trim();
  if (!message) return;

  addUserMessage(message);
  input.value = "";
  button.disabled = true;
  input.disabled = true;

  try {
    const response = await fetch("/api/game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, message }),
    });

    const data = await response.json();

    if (!response.ok) {
      addAssistantMessage(data.message || "Er ging iets mis.");
      return;
    }

    addStructuredMessage(data);
  } catch (error) {
    addAssistantMessage("Er ging iets mis met de server.");
  } finally {
    button.disabled = false;
    input.disabled = false;
    input.focus();
  }
});

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
        addAssistantMessage(item.message);
      }
    }
  } catch (error) {
    addAssistantMessage("Could not load previous chat history.");
  }
}

function addUserMessage(text) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message", "user");

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  messagesDiv.appendChild(wrapper);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addAssistantMessage(text) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message", "assistant");

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.innerHTML = micromark(text);

  wrapper.appendChild(bubble);
  messagesDiv.appendChild(wrapper);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addStructuredMessage(data) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message", "assistant");

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");

  let html = micromark(data.message || "");

  if (Array.isArray(data.suspects) && data.suspects.length > 0) {
    html += `
      <p><strong>Verdachten:</strong></p>
      <ul>
        ${data.suspects.map((suspect) => `<li>${suspect}</li>`).join("")}
      </ul>
    `;
  }

  if (Array.isArray(data.clues) && data.clues.length > 0) {
    html += `
      <p><strong>Aanwijzingen:</strong></p>
      <ul>
        ${data.clues.map((clue) => `<li>${clue}</li>`).join("")}
      </ul>
    `;
  }

  if (data.progress) {
    html += `<p><strong>Voortgang:</strong> ${data.progress}</p>`;
  }

  if (typeof data.tokens === "number" && data.tokens > 0) {
    html += `<div class="tokens">Tokens: ${data.tokens}</div>`;
  }

  bubble.innerHTML = html;
  wrapper.appendChild(bubble);
  messagesDiv.appendChild(wrapper);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}