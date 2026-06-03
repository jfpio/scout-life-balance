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

## ⚖️ Game Balancing (Simulation)

If you want to check fair win rates, run the Monte Carlo simulation:

```bash
npx tsx scripts/simulate-balance.ts
```

This script runs thousands of test games and reports win rates.
