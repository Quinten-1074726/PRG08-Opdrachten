# 🕵️ Detective Chatbot Game

## 📌 Beschrijving / Use case
Dit project is een interactieve chatbot game waarin de gebruiker samenwerkt met een AI-detective om een mysterie op te lossen.

In plaats van een standaard chatbot die alleen antwoorden geeft, moet de gebruiker actief vragen stellen, aanwijzingen verzamelen en verdachten onderzoeken.  
De chatbot reageert in karakter als detective, geeft hints en stuurt het gesprek zodat de gebruiker zelf tot de oplossing komt.

Het doel van deze applicatie is om een meer interactieve en betrokken AI-ervaring te bieden.

---

## ⚙️ Installatie

### 1. Clone de repository
git clone git@github.com:Quinten-1074726/PRG08-Opdrachten.git
cd opdracht-taalmodel

### 2. Installeer dependencies
npm install

### 3. Maak een `.env` bestand aan
Maak in de root van het project een `.env` bestand en voeg hier je Azure OpenAI gegevens toe:

AZURE_OPENAI_API_KEY=your_key_here  
AZURE_OPENAI_ENDPOINT=your_endpoint_here  
AZURE_OPENAI_API_DEPLOYMENT_NAME=your_deployment_name  

⚠️ Dit bestand wordt niet mee gepusht naar GitHub.

---

### 4. Voeg start script toe (indien nodig)
Zorg dat je in `package.json` het volgende script hebt staan:

"scripts": {
  "start": "node --watch --env-file=.env server.js"
}

---

### 5. Start de applicatie
npm run start

---

### 6. Open de applicatie
Ga naar:  
http://localhost:3000