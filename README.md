# Scout Life Balance v2 ⛺⚖️

A game about finding life balance, created for scouts (and not only). Make decisions, manage resources, and try not to go crazy!

Inspired by the swipe-based decision game **Reigns**.

**Play online (PL):** [https://scout-life-balance.web.app/](https://scout-life-balance.web.app/)

**Play online (EN):** [https://scout-life-balance-en.web.app/](https://scout-life-balance-en.web.app/)

## 📂 Project Structure

The most important file for you is:

👉 **`src/data/cards.json`** - **POLISH CARDS ARE HERE!**

👉 **`src/data/cards.en.json`** - **ENGLISH CARDS ARE HERE!**

All situations, dilemmas, and their consequences are defined in these files. You can edit them to change the game content.

Other important files:
*   `src/store/gameSlice.ts` - Game logic (rules, score calculation).
*   `src/pages/Game.tsx` - Main game screen layout.
*   `scripts/simulate-balance.ts` - Tool to check if the game is too hard/too easy.

---

## 🛠️ How to edit cards?

Open `src/data/cards.json` or `src/data/cards.en.json`. Each card looks like this:

```json
{
  "id": 101,
  "image": "🌧️",  // Emoji or image URL
  "description": "Situation description...",
  "leftChoice": {
    "text": "Swipe Left Decision",
    "effects": {
      "family": -2,   // Lose 2 Family points (Scale -3 to 3)
      "energy": -2,
      "scouting": 2,  // Gain 2 Scouting points
      "school": 0
    }
  },
  "rightChoice": {
    "text": "Swipe Right Decision",
    "effects": { ... }
  }
}
```

**Resources:**
*   `family`
*   `scouting`
*   `school`
*   `energy`

**Effect Scale:**
We use a **-3 to 3** scale, where:
*   1 / -1 : Small impact
*   2 / -2 : Medium impact
*   3 / -3 : Large impact (Crisis)

---

## 🚀 How to run?

1.  **Install dependencies** (first time only):
    ```bash
    npm install
    ```

2.  **Run game** (dev mode):
    ```bash
    npm run dev
    ```
    Click the link shown in terminal (usually `http://localhost:5173`).

---

## 🧩 Custom Google Sheets games

The app can create a temporary custom game from a public Google Sheets template:

1. Import/use the workbook template and edit the `Cards` tab.
2. Share the spreadsheet as **anyone with the link can view**.
3. Open `/create` and paste the spreadsheet link.
4. Share the generated `/custom/<slug>` link or QR code.

Custom games are stored in Firestore with a 14-day expiration. This Spark-compatible version does not use Cloud Functions, Secret Manager, Cloud Build, or Artifact Registry.

### Frontend Firebase env vars

Create local/deploy environment variables for the Firebase web app:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=scout-life-balance
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Deploy Firestore rules and hosting:

```bash
firebase deploy --only firestore,hosting
```

Expired games are rejected by Firestore rules and by the app. Automatic background cleanup is not available without a backend; expired documents can remain stored until manually deleted or visited by tooling you add later.

---

## ⚖️ Game Balancing (Simulation)

If you want to check fair win rates, run the Monte Carlo simulation:

```bash
npx tsx scripts/simulate-balance.ts
```

This script runs thousands of test games and reports win rates.
