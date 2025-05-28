import { useState, useEffect, createContext, useContext } from "react";
import { ImHeart, ImDiamonds, ImSpades, ImClubs } from "react-icons/im";
import { invoke } from "@tauri-apps/api/core";
import { RiCloseFill } from "react-icons/ri";
import "./settingsModal.css";

// --- Suit Context Definition ---
export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export interface SuitContextProps {
  activeSuit: Suit;
  setActiveSuit: (s: Suit) => void;
}
export const SuitContext = createContext<SuitContextProps>({
  activeSuit: "hearts",
  setActiveSuit: () => {},
});
// --------------------------------

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function SettingsModal({ isOpen, onClose }: Props) {
  const { activeSuit, setActiveSuit } = useContext(SuitContext);
  const [decks, setDecks] = useState<number>(1);
  const [shuffled, setShuffled] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) setShuffled(false);
  }, [isOpen, decks]);

  if (!isOpen) return null;

  const handleShuffle = async () => {
    try {
      await invoke("create_deck", { numDecks: decks });
      setShuffled(true);
    } catch (err) {
      console.error("shuffle failed:", err);
    }
  };
  const suits: { key: Suit; icon: JSX.Element }[] = [
    { key: "hearts", icon: <ImHeart size={24} /> },
    { key: "diamonds", icon: <ImDiamonds size={24} /> },
    { key: "clubs", icon: <ImClubs size={24} /> },
    { key: "spades", icon: <ImSpades size={24} /> },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div
          className="modal-close-icon"
          onClick={onClose}
          aria-label="Close settings"
        >
          <RiCloseFill size={20} />
        </div>
        <h3 className="modal-title">Settings</h3>
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
        <div className="setting-item">
          <button
            className="shuffle-btn"
            onClick={() => setShuffled(true)}
            disabled={shuffled}
          >
            <button
              className="shuffle-btn"
              onClick={handleShuffle}
              disabled={shuffled}
            >
              Shuffle Deck
            </button>
          </button>
        </div>
        <hr />
        <h4 className="modal-subtitle">Choose Suit</h4>
        <div className="suit-grid">
          {suits.map(({ key, icon }) => (
            <div
              key={key}
              className={`suit-item ${activeSuit === key ? "active" : ""}`}
              onClick={() => setActiveSuit(key)}
            >
              {icon}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
