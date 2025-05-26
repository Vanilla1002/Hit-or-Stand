import React, { useState, useMemo, createContext } from "react";
import { FaCog, FaTrash } from "react-icons/fa";
import { SettingsModal } from "./SettingsModal";
import { TrashModal } from "./TrashModal";
import "./app.css";

const RANKS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];
export const SuitContext = createContext<{ activeSuit: string }>({
  activeSuit: "hearts",
});

type Results = { move: string; winProb: string; lossProb: string };

type HandProps = {
  label: string;
  cards: string[];
  onChange: (idx: number, val: string) => void;
  onAdd?: () => void;
  onRemove?: (idx: number) => void;
  className?: string;
  style?: React.CSSProperties;
};

function Hand({
  label,
  cards,
  onChange,
  onAdd,
  onRemove,
  className,
  style,
}: HandProps) {
  const [pickerIdx, setPickerIdx] = useState<number | null>(null);
  const { activeSuit } = React.useContext(SuitContext);

  return (
    <div className={className || ""} style={style}>
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
                    <img
                      key={name}
                      src={`/cards/${activeSuit}_${name}.png`}
                      alt={name}
                      className="card-image picker-card"
                      onClick={() => {
                        onChange(i, name);
                        setPickerIdx(null);
                      }}
                    />
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

            {onRemove && c && (
              <button className="remove-card-btn" onClick={() => onRemove(i)}>
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

export default function TableApp() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [trash, setTrash] = useState<Array<{ suit: string; rank: string }>>([]);
  

  const [activeSuit, setActiveSuit] = useState<
    "hearts" | "diamonds" | "clubs" | "spades"
  >("hearts");

  const [dealer, setDealer] = useState<string[]>([""]);
  const [player, setPlayer] = useState<string[]>(["", ""]);

  const [pickerIdx, setPickerIdx] = useState<number | "trash" | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);

  const updateHand = (
    list: string[],
    setList: any,
    idx: number,
    val: string
  ) => {
    const clone = [...list];
    clone[idx] = val;
    setList(clone);
  };

  const canCalc = useMemo(
    () => [...dealer, ...player].every((v) => v),
    [dealer, player]
  );
  const calculate = () => {
    setLoading(true);
    setTimeout(() => {
      setResults({ move: "Stand", winProb: "—", lossProb: "—" });
      setLoading(false);
    }, 500);
  };

  const addTrash = (card: string) => {
    setTrash((prev) => [...prev, card]);
    setPickerIdx(null);
  };
  const removeTrash = (idx: number) =>
    setTrash((prev) => prev.filter((_, i) => i !== idx));

  return (
    <SuitContext.Provider value={{ activeSuit }}>
      <div className={trashOpen ? 'table blurred' : 'table'}>
        <button
          className="settings-btn"
          onClick={() => setSettingsOpen((p) => !p)}
          aria-label="Settings"
        >
          <FaCog size={20} />
        </button>
        <SettingsModal
          isOpen={settingsOpen}
          active={activeSuit}
          onClose={() => setSettingsOpen(false)}
          onSelect={(s) => setActiveSuit(s)}
        />

        <Hand
          label="Dealer"
          cards={dealer.slice(0, 1)}
          onChange={(i, v) => updateHand(dealer, setDealer, i, v)}
          className="area dealer-area"
        />

        <div className="center-panel">
          <button
            className="calculate-btn"
            disabled={!canCalc || loading}
            onClick={calculate}
          >
            {loading ? "Calculating..." : "Calculate"}
          </button>
          {results && (
            <div className="results">
              <div>
                <strong>Move:</strong> {results.move}
              </div>
              <div>
                <strong>Win:</strong> {results.winProb}
              </div>
              <div>
                <strong>Loss:</strong> {results.lossProb}
              </div>
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
        />

        {/* Trash Tab */}
        <button className="trash-tab" onClick={() => setTrashOpen(true)} aria-label="Open Seen Cards">
          <FaTrash size={20} />
        </button>

        <TrashModal
          isOpen={trashOpen}
          trash={trash}
          activeSuit={activeSuit}
          onAdd={addTrash}
          onRemove={removeTrash}
          onClose={() => setTrashOpen(false)}
        />

      </div>
    </SuitContext.Provider>
  );
}
