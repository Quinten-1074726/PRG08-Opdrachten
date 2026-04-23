import { micromark } from "https://esm.sh/micromark@4?bundle";

const form = document.getElementById("chat-form");
const input = document.getElementById("prompt-input");
const messages = document.getElementById("messages");
const button = form.querySelector("button");


let userid = localStorage.getItem("userid");

if (!userid) {
    userid = `weatheruser-${crypto.randomUUID()}`;
    localStorage.setItem("userid", userid);
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const prompt = input.value.trim();
    if (!prompt) return;

    addUserMessage(prompt);
    input.value = "";

    button.disabled = true;
    button.textContent = "Loading...";

    try {
    const result = await fetch("/api/chat", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, userid }),
    });

    const data = await result.json();
    addAssistantMessage(data.message, data.usedTools);

    } catch (error) {
    addAssistantMessage("Er ging iets mis met de server.", []);
    } finally {
    button.disabled = false;
    button.textContent = "Send";
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
    textEl.innerHTML = micromark(text);
    bubble.appendChild(textEl);

    if (usedTools && usedTools.length > 0) {
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