import React, { useState } from "react";
import { FaCog, FaTrash } from "react-icons/fa";
import { ImInfo } from "react-icons/im";
import { SettingsModal } from "./SettingsModal";
import { TrashModal } from "./TrashModal";
import { HowToUse } from "./howToUse";
import { invoke } from "@tauri-apps/api/core";
import { SuitContext, Suit } from "./SettingsModal";
import "./app.css";

const RANKS = [
  "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K",
];

type Results = { move: string; winProb: string; lossProb: string };
type DecideRequest = { player: string[]; dealer: string; others: string[] };
type DecideResponse = { hitEv: number; standEv: number };

type HandProps = {
  label: string;
  cards: string[];
  onChange: (idx: number, val: string) => void;
  onAdd?: () => void;
  onRemove?: (idx: number) => void;
  className?: string;
  style?: React.CSSProperties;
  remainingCounts: Record<string, number>;
};

function Hand({ label, cards, onChange, onAdd, onRemove, className, style, remainingCounts }: HandProps) {
  const [pickerIdx, setPickerIdx] = useState<number | null>(null);
  const { activeSuit } = React.useContext(SuitContext);

  return (
    <div className={className} style={style}>
      <div className="hand-header">
        <div className="role-label">{label}</div>
      </div>
      <div className="hand">
        {cards.map((c, i) => (
          <div key={i} className="hand-slot">
            {c ? (
              <img
                src={`/cards/${activeSuit}_${c}.png`}
                alt={c}
                className="card-image"
                onClick={() => setPickerIdx(i)}
              />
            ) : (
              <div className="pick-slot" onClick={() => setPickerIdx(i)}>
                +
              </div>
            )}

            {pickerIdx === i && (
              <div className="card-picker-popup">
                <div className="picker-grid">
                  {RANKS.map((name) => (
                    <div key={name} className="picker-card-wrapper">
                      <img
                        src={`/cards/${activeSuit}_${name}.png`}
                        alt={name}
                        className={`picker-card ${remainingCounts[name] <= 0 ? 'exhausted' : ''}`}
                        onClick={() => {
                          if (remainingCounts[name] > 0) {
                            onChange(i, name);
                            setPickerIdx(null);
                          }
                        }}
                      />
                      {remainingCounts[name] <= 0 && <div className="exhausted-overlay">X</div>}
                    </div>
                  ))}
                  <div
                    className="picker-close-slot"
                    onClick={() => setPickerIdx(null)}
                  >
                    ×
                  </div>
                </div>
              </div>
            )}

            {onRemove && (
              <button
                className="remove-card-btn"
                onClick={() => onRemove(i)}
                aria-label="Remove card"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {onAdd && (
          <div className="add-slot" onClick={onAdd}>
            +
          </div>
        )}
      </div>
    </div>
  );
}

type MainTableProps = { decks: number; cardStyle: string };

export default function MainTable({ decks, cardStyle }: MainTableProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [howToUseOpen, setHowToUseOpen] = useState(false);
  const [trash, setTrash] = useState<string[]>([]);
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSuit, setActiveSuit] = useState<Suit>(cardStyle as Suit);
  const [dealer, setDealer] = useState<string[]>([""]);
  const [player, setPlayer] = useState<string[]>(["", ""]);

  // Calculate remaining counts for each rank
  const initialCount = 4 * decks;
  const allUsedCards = [...player, ...dealer, ...trash].filter(c => c !== "");
  const usedCounts: Record<string, number> = {};
  allUsedCards.forEach(card => {
    usedCounts[card] = (usedCounts[card] || 0) + 1;
  });
  const remainingCounts = RANKS.reduce((acc, rank) => {
    acc[rank] = initialCount - (usedCounts[rank] || 0);
    return acc;
  }, {} as Record<string, number>);

  const filledPlayerCards = player.filter((c) => c !== "").length;
  const canCalculate = !loading && filledPlayerCards >= 2 && dealer[0] !== "";

  const updateHand = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    idx: number,
    val: string
  ) => {
    const clone = [...list];
    clone[idx] = val;
    setList(clone);
  };

  const calculate = async () => {
    setLoading(true);
    setResults(null);
    try {
      const args: DecideRequest = { player, dealer: dealer[0], others: trash };
      const res = await invoke<DecideResponse>("decide_hand", { req: args });
      const move = res.hitEv > res.standEv ? "Hit" : "Stand";
      const bestEv = Math.max(res.hitEv, res.standEv);
      setResults({
        move,
        winProb: `${(bestEv * 100).toFixed(2)}%`,
        lossProb: `${((1 - bestEv) * 100).toFixed(2)}%`,
      });
    } catch (e: any) {
      console.error("calculate() error:", e);
      alert(`Calculation error: ${JSON.stringify(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SuitContext.Provider value={{ activeSuit, setActiveSuit }}>
      <div className={trashOpen ? "table blurred" : "table"}>
        <button
          className="settings-btn"
          onClick={() => setSettingsOpen((p) => !p)}
          aria-label="Settings"
        >
          <FaCog size={20} />
        </button>
        <button
          className="how-to-use-btn"
          onClick={() => setHowToUseOpen(true)}
          title="How to Use"
          aria-label="How to Use"
        >
          <ImInfo size={20} />
        </button>
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
        <HowToUse
          isOpen={howToUseOpen}
          onClose={() => setHowToUseOpen(false)}
        />

        <Hand
          label="Dealer"
          cards={dealer}
          onChange={(i, v) => updateHand(dealer, setDealer, i, v)}
          className="area dealer-area"
          remainingCounts={remainingCounts}
        />

        <div className="center-panel">
          <button
            className="calculate-btn"
            onClick={calculate}
            disabled={!canCalculate}
            aria-disabled={!canCalculate}
          >
            {loading ? "Calculating..." : "Calculate"}
          </button>
          {!canCalculate && !loading && (
            <div className="hint">
              You need at least two cards and a dealer card to calculate.
            </div>
          )}
          {results && (
            <div className="results">
              <div><strong>Move:</strong> {results.move}</div>
              <div><strong>Win:</strong> {results.winProb}</div>
              <div><strong>Loss:</strong> {results.lossProb}</div>
            </div>
          )}
        </div>

        <Hand
          label="You"
          cards={player}
          onChange={(i, v) => updateHand(player, setPlayer, i, v)}
          onAdd={() => setPlayer((p) => [...p, ""])}
          onRemove={(i) => setPlayer((p) => p.filter((_, j) => j !== i))}
          className="area player-area"
          remainingCounts={remainingCounts}
        />

        <button
          className="trash-tab"
          onClick={() => setTrashOpen(true)}
          aria-label="Open Seen Cards"
        >
          <FaTrash size={20} />
        </button>
        <TrashModal
          isOpen={trashOpen}
          trash={trash}
          activeSuit={activeSuit}
          onAdd={(r) => setTrash((prev) => [...prev, r])}
          onRemove={(i) => setTrash((prev) => prev.filter((_, j) => j !== i))}
          onClose={() => setTrashOpen(false)}
          remainingCounts={remainingCounts}
        />
      </div>
    </SuitContext.Provider>
  );
}