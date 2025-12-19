
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Card, Resources, Choice } from '../src/types/game';

// Helper to handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load cards
const cardsPath = path.join(__dirname, '../src/data/cards.json');
const cardsData: Card[] = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));

// Simulation Configuration
const FIXED_SCALE = 8;
const SIMULATION_RUNS = 5000;

type ResourceKey = keyof Resources;

// Game State
interface SimState {
    resources: Resources;
    alive: boolean;
    deathResource: ResourceKey | null;
}

function clamp(val: number, min: number, max: number) {
    return Math.min(Math.max(val, min), max);
}

// Bot Policy: Risk Averse
function decide(card: Card, currentResources: Resources, scale: number): 'left' | 'right' {
    const evalOption = (choice: Choice) => {
        const nextRes = { ...currentResources };
        let minVal = 100;
        let sumVal = 0;
        let dead = false;

        // Apply effects
        for (const [key, val] of Object.entries(choice.effects)) {
            const rKey = key as ResourceKey;
            if (nextRes[rKey] !== undefined && typeof val === 'number') {
                const scaledVal = Math.round(val * scale);
                nextRes[rKey] = clamp(nextRes[rKey] + scaledVal, 0, 100);
            }
        }

        // Calculate stats
        for (const val of Object.values(nextRes)) {
            if (val <= 0) dead = true;
            if (val < minVal) minVal = val;
            sumVal += val;
        }

        if (dead) return -Infinity;
        return 5 * minVal + 0.1 * sumVal;
    };

    const leftScore = evalOption(card.leftChoice);
    const rightScore = evalOption(card.rightChoice);

    if (leftScore === rightScore) {
        return Math.random() < 0.5 ? 'left' : 'right';
    }
    return leftScore > rightScore ? 'left' : 'right';
}

function simulateGame(deck: Card[], scale: number): { turns: number, deathResource: ResourceKey | null, won: boolean } {
    const state: SimState = {
        resources: { family: 50, scouting: 50, school: 50, energy: 50 },
        alive: true,
        deathResource: null
    };

    let turns = 0;
    const gameDeck = [...deck].sort(() => Math.random() - 0.5);

    for (const card of gameDeck) {
        turns++;
        const decision = decide(card, state.resources, scale);
        const choice = decision === 'left' ? card.leftChoice : card.rightChoice;

        // Apply chosen effect
        for (const [key, val] of Object.entries(choice.effects)) {
             const rKey = key as ResourceKey;
             if (state.resources[rKey] !== undefined && typeof val === 'number') {
                 const scaledVal = Math.round(val * scale);
                 state.resources[rKey] = clamp(state.resources[rKey] + scaledVal, 0, 100);
             }
        }

        // Check death
        for (const [key, val] of Object.entries(state.resources)) {
            if (val <= 0) {
                state.alive = false;
                state.deathResource = key as ResourceKey;
                return { turns, deathResource: state.deathResource, won: false };
            }
        }
    }

    return { turns: gameDeck.length, deathResource: null, won: true };
}

function createBadCard(id: number): Card {
    // Generate a card with negative effects
    // e.g. Left: -2 on two resources, Right: -2 on other two resources
    // Or just generically difficult choices
    
    // We want effects like -2 (Medium Negative) or -3 (High Negative)
    // Let's use -2 (Medium) for now, as -20 (scaled) is significant.
    
    return {
        id: id,
        description: `Generated Bad Card ${id}`,
        leftChoice: {
            text: "Difficult Choice A",
            effects: {
                energy: -2,
                family: -1
            } as Partial<Resources>
        },
        rightChoice: {
            text: "Difficult Choice B",
            effects: {
                scouting: -2,
                school: -1
            } as Partial<Resources>
        }
    };
}

function runSimulation(deck: Card[], n: number, scale: number) {
    const results = [];
    let wins = 0;

    for (let i = 0; i < n; i++) {
        const res = simulateGame(deck, scale);
        results.push(res);
        if (res.won) wins++;
    }

    results.sort((a, b) => a.turns - b.turns);
    const median = results[Math.floor(n * 0.50)].turns;

    return { median, winRate: (wins / n) * 100 };
}

async function analyzeDeckBalance() {
    console.log(`Running analysis with Scale = ${FIXED_SCALE}...`);
    
    // Scenario 1: Base Deck
    const stats1 = runSimulation(cardsData, SIMULATION_RUNS, FIXED_SCALE);
    console.log(`Base Deck (${cardsData.length} cards): Win Rate ${stats1.winRate.toFixed(1)}%, Median Turns ${stats1.median}`);

    // Scenario 2: Adding X Bad Cards
    for (const addedCount of [5, 10, 15, 20, 25]) {
         const extraCards: Card[] = [];
         for(let i=0; i<addedCount; i++) {
             extraCards.push(createBadCard(1000 + i));
         }
         const combinedDeck = [...cardsData, ...extraCards];
         
         const stats = runSimulation(combinedDeck, SIMULATION_RUNS, FIXED_SCALE);
         console.log(`+${addedCount} Bad Cards (Total ${combinedDeck.length}): Win Rate ${stats.winRate.toFixed(1)}%, Median Turns ${stats.median}`);
    }
}

analyzeDeckBalance();
