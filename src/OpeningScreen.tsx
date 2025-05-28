import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ImHeart, ImDiamonds, ImSpades, ImClubs } from "react-icons/im";
import "./app.css";

export type GameConfig = {
  decks: number;
  cardStyle: Suit;
};

type Suit = "hearts" | "diamonds" | "clubs" | "spades";

type Props = {
  onStart: (config: GameConfig) => void;
};

export function OpeningScreen({ onStart }: Props) {
  const [decks, setDecks] = useState<number>(1);
  const [selectedSuit, setSelectedSuit] = useState<Suit>("hearts");

  const suits: { key: Suit; icon: JSX.Element }[] = [
    { key: "hearts", icon: <ImHeart size={32} /> },
    { key: "diamonds", icon: <ImDiamonds size={32} /> },
    { key: "clubs", icon: <ImClubs size={32} /> },
    { key: "spades", icon: <ImSpades size={32} /> },
  ];

  const startGame = async () => {
    try {
      // Tell Rust to build the deck with `decks` copies
      await invoke("create_deck", { numDecks: decks });
      // Then notify the rest of your React app
      onStart({ decks, cardStyle: selectedSuit });
    } catch (err) {
      console.error("failed to create deck:", err);
    }
  };

  return (
    <div className="opening-screen">
      <h2>Configure Game</h2>

      <div className="setting-item">
        <label htmlFor="num-decks">Number of Decks</label>
        <input
          id="num-decks"
          type="number"
          min={1}
          max={20}
          value={decks}
          onChange={(e) => setDecks(Number(e.target.value))}
        />
      </div>

      <hr />
      <h4>Select Card Style</h4>
      <div className="suit-grid">
        {suits.map(({ key, icon }) => (
          <div
            key={key}
            className={`suit-item ${selectedSuit === key ? "active" : ""}`}
            onClick={() => setSelectedSuit(key)}
          >
            {icon}
          </div>
        ))}
      </div>

      <button className="start-btn" onClick={startGame}>
        Start
      </button>
    </div>
  );
}
