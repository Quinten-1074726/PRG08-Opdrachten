# 🎬 CineMatch - Film Advies Agent

## 📌 Beschrijving / Use case
CineMatch is een AI-agent die gebruikers helpt bij het kiezen van een film.

Veel mensen weten niet wat voor film ze willen kijken en moeten lang zoeken.  
Deze applicatie helpt daarbij door gericht advies te geven en concrete filminformatie te tonen.

In tegenstelling tot een normaal taalmodel kan deze agent:
- informatie ophalen uit een document (filmgenres)
- echte filmdata ophalen via een API
- tools gebruiken om acties uit te voeren

Het doel is om de gebruiker sneller en interactiever tot een goede filmkeuze te laten komen.

---

## ⚙️ Installatie

### 1. Clone de repository
git clone git@github.com:Quinten-1074726/PRG08-Opdrachten.git
cd opdracht-agent

---

### 2. Installeer dependencies
npm install

---

### 3. Maak een `.env` bestand aan
Maak in de root van het project een `.env` bestand en voeg hier je API gegevens toe:

AZURE_OPENAI_API_KEY=your_key_here  
AZURE_OPENAI_ENDPOINT=your_endpoint_here  
AZURE_OPENAI_API_DEPLOYMENT_NAME=your_deployment_name  
AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME=your_embeddings_name  

OMDB_API_KEY=your_omdb_key  

⚠️ Dit bestand wordt niet mee gepusht naar GitHub.

👉 De OMDb API key kun je aanvragen via:  
<http://www.omdbapi.com/apikey.aspx>

---

### 4. Maak de vectorstore (eenmalig)
Voer dit commando uit om de document data om te zetten naar embeddings:

npm run create

---

### 5. (Optioneel) Test de vectorstore
npm run load

---

### 6. Start de applicatie
npm run start

---

### 7. Open de applicatie
Ga naar:  
http://localhost:3000

---

## 🔧 Gebruikte tools
- retrieve → haalt informatie uit het document (filmgenres)
- search_movie → haalt filmdata op via de OMDb API


