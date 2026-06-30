# Scout Life Balance v2 ⛺⚖️

A game about finding life balance, created for scouts (and not only). Make decisions, manage resources, and try not to go crazy!

Inspired by the swipe-based decision game **Reigns**.

**Play online (PL):** [https://harcbalans.web.app/](https://harcbalans.web.app/)

**Play online (EN):** [https://scout-life-balance-en.web.app/](https://scout-life-balance-en.web.app/)

**Instructor documentation:** [https://jfpio.github.io/scout-life-balance/gra.html](https://jfpio.github.io/scout-life-balance/gra.html)

Local documentation files are in [`docs/`](docs/).

Quick passwords for facilitators:
* Custom game creator password: `instruktor`
* Secret password to continue after game over: `wsparcie`

## 📂 Project Structure

The most important file for you is:

👉 **`src/data/cards.json`** - **POLISH CARDS ARE HERE!**

👉 **`src/data/cards.harcerze.json`** - **POLISH BOYS COURSE CARDS ARE HERE!**

👉 **`src/data/cards.harcerki.json`** - **POLISH GIRLS COURSE CARDS ARE HERE!**

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

The app can create a temporary custom game from either a ready question set or a public Google Sheets template:

1. Choose one of the ready course variants or open the template spreadsheet:
   * [Boys course sheet](https://docs.google.com/spreadsheets/d/1aI7WEgOZ0dnfR3WPvrVtAvLyVwikq63_/edit?usp=sharing&ouid=111660113462133971852&rtpof=true&sd=true)
   * [Girls course sheet](https://docs.google.com/spreadsheets/d/1dM7HSjjbkL3jkGLCx7ckOhlwDQmlOKAx/edit?usp=sharing&ouid=111660113462133971852&rtpof=true&sd=true)
   * [PL template](https://docs.google.com/spreadsheets/d/1HOdjQs9DVRU6BJK8fW6NjXFFlCd_DobqSSSkRBK-P80/edit?usp=sharing)
   * [EN template](https://docs.google.com/spreadsheets/d/1xA7D_a3DXaPOpN9gzTvTHZUsZ4Km6JerFQtpn5vEAeU/edit?usp=sharing)
2. Open `/create`, unlock it with the simple creator password `instruktor`, choose a ready variant or paste a custom spreadsheet link.
3. For custom questions, create your own copy of the template and edit the `Cards` tab.
4. Share the custom spreadsheet as **anyone with the link can view**.
5. Share the generated `/custom/<slug>` link or QR code.

The default `/game` route asks the player to choose **Wersja dla harcerzy** or **Wersja dla harcerek**. These built-in decks are static JSON snapshots, so updating the public sheets requires regenerating the JSON files and deploying again.

Custom games are stored in Firestore with a 14-day expiration. This Spark-compatible version does not use Cloud Functions, Secret Manager, Cloud Build, or Artifact Registry. The creator password is a lightweight client-side gate, not a secure backend secret.

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

### GitHub Pages instructor docs

Static documentation for course facilitators lives in `docs/`:

* `docs/gra.html` - game idea and basic rules
* `docs/stworz-wlasna-gre.html` - custom game workflow, template link, and screenshots
* `docs/scenariusz.html` - placeholder for a sample course session scenario

To publish it with GitHub Pages, set the Pages source to this branch and the `/docs` folder in repository settings.

---

## ⚖️ Game Balancing (Simulation)

If you want to check fair win rates, run the Monte Carlo simulation:

```bash
npx tsx scripts/simulate-balance.ts
```

This script runs thousands of test games and reports win rates.
