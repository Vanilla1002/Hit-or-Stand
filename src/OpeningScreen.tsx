import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ImHeart, ImDiamonds, ImSpades, ImClubs, ImInfo } from "react-icons/im";
import { HowToUse } from "./HowToUse";
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
  const [decks, setDecks] = useState<number>(2); // Default to 2 (first even number)
  const [selectedSuit, setSelectedSuit] = useState<Suit>("hearts");
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);

  const suits: { key: Suit; icon: JSX.Element }[] = [
    { key: "hearts", icon: <ImHeart size={32} /> },
    { key: "diamonds", icon: <ImDiamonds size={32} /> },
    { key: "clubs", icon: <ImClubs size={32} /> },
    { key: "spades", icon: <ImSpades size={32} /> },
  ];

  const evenNumbers: number[] = [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--text)",
          }}
        >
          Hit or Stand
        </h1>
        <button
          style={{
            background: "var(--btn-bg)",
            border: "1px solid var(--border-light)",
            borderRadius: "0.25rem",
            padding: "0.5rem",
            cursor: "pointer",
            color: "var(--text)",
            display: "flex",
            alignItems: "center",
          }}
          onClick={() => setIsHowToUseOpen(true)}
          title="How to Use"
          aria-label="How to Use"
        >
          <ImInfo size={24} />
        </button>
      </div>

      <h4>Select Number of Decks</h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.25rem",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        {evenNumbers.map((num) => (
          <button
            key={num}
            style={{
              width: "2rem",
              height: "2rem",
              borderRadius: "50%",
              background:
                decks === num
                  ? "linear-gradient(135deg, #0e5c03 0%, #2a2a2a 100%)"
                  : "linear-gradient(135deg, #0b3d02 0%, #1a1a1a 100%)",
              border: "1px solid var(--border-light)",
              color: "var(--text)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: window.innerWidth <= 480 ? "0.8rem" : "0.9rem",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
              transition: "transform 0.2s ease, background 0.2s ease",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(135deg, #0e5c03 0%, #2a2a2a 100%)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background =
                decks === num
                  ? "linear-gradient(135deg, #0e5c03 0%, #2a2a2a 100%)"
                  : "linear-gradient(135deg, #0b3d02 0%, #1a1a1a 100%)")
            }
            onClick={() => setDecks(num)}
            aria-label={`Select ${num} decks`}
          >
            {num}
          </button>
        ))}
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

      <button
        className="start-btn"
        style={{
          width: "19.75rem",
          height: "2rem",
          padding: "0.5rem 1rem",
          fontSize: window.innerWidth <= 480 ? "0.9rem" : "1rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          background: "linear-gradient(135deg, #0b3d02 0%, #1a1a1a 100%)",
          border: "1px solid var(--border-light)",
          borderRadius: "0.5rem",
          color: "var(--text)",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          transition: "transform 0.2s ease, background 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(135deg, #0e5c03 0%, #2a2a2a 100%)";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(135deg, #0b3d02 0%, #1a1a1a 100%)";
          e.currentTarget.style.transform = "scale(1)";
        }}
        onClick={startGame}
        aria-label="Start the game"
      >
        Start
      </button>

      <HowToUse
        isOpen={isHowToUseOpen}
        onClose={() => setIsHowToUseOpen(false)}
      />
    </div>
  );
}
