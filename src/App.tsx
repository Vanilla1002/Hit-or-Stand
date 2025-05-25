import React, { useState, useMemo } from "react";

// Card options
const CARD_VALUES = [
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

// Define types
type Results = { move: string; winProb: string; lossProb: string };

type CardInputProps = { value: string; onChange: (value: string) => void };

// Reusable card select component
function CardSelect({ value, onChange }: CardInputProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded-xl p-2 w-20 text-center"
    >
      <option value="">--</option>
      {CARD_VALUES.map((val) => (
        <option key={val} value={val}>
          {val}
        </option>
      ))}
    </select>
  );
}

export default function App() {
  const [playerCards, setPlayerCards] = useState<string[]>(["", ""]);
  const [dealerCard, setDealerCard] = useState<string>("");
  const [otherPlayers, setOtherPlayers] = useState<string[][]>([["", ""]]);
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Generic handlers
  const handleCardChange = (
    list: any[],
    setList: React.Dispatch<React.SetStateAction<any[]>>,
    index: number,
    value: any
  ) => {
    const updated = [...list];
    updated[index] = value;
    setList(updated);
  };

  const addCard = (
    list: any[],
    setList: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    setList([...list, ""]);
  };
  const removeCard = (
    list: any[],
    setList: React.Dispatch<React.SetStateAction<any[]>>,
    index: number
  ) => {
    setList(list.filter((_, i) => i !== index));
  };

  // Other players handlers
  const handleOtherChange = (pIdx: number, cIdx: number, value: string) => {
    setOtherPlayers(
      otherPlayers.map((hand, i) =>
        i !== pIdx ? hand : hand.map((c, j) => (j === cIdx ? value : c))
      )
    );
  };
  const addOtherPlayer = () => setOtherPlayers([...otherPlayers, ["", ""]]);
  const removeOtherPlayer = (pIdx: number) =>
    setOtherPlayers(otherPlayers.filter((_, i) => i !== pIdx));
  const addCardToOther = (pIdx: number) =>
    setOtherPlayers(
      otherPlayers.map((hand, i) => (i !== pIdx ? hand : [...hand, ""]))
    );
  const removeCardFromOther = (pIdx: number, cIdx: number) =>
    setOtherPlayers(
      otherPlayers.map((hand, i) =>
        i !== pIdx ? hand : hand.filter((_, j) => j !== cIdx)
      )
    );

  // Completeness
  const canCalculate = useMemo(() => {
    const flat = [...playerCards, dealerCard, ...otherPlayers.flat()];
    return flat.every((v) => v !== "");
  }, [playerCards, dealerCard, otherPlayers]);

  const calculate = () => {
    setLoading(true);
    setTimeout(() => {
      setResults({ move: "Stand", winProb: "—", lossProb: "—" });
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Blackjack Calculator
        </h1>

        {/* Player Cards */}
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Your Hand</h2>
          <div className="flex space-x-2">
            {playerCards.map((card, idx) => (
              <div key={idx} className="relative flex items-center">
                <CardSelect
                  value={card}
                  onChange={(val) =>
                    handleCardChange(playerCards, setPlayerCards, idx, val)
                  }
                />
                {idx >= 2 && (
                  <button
                    onClick={() => removeCard(playerCards, setPlayerCards, idx)}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 text-xs"
                    title="Remove this card"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addCard(playerCards, setPlayerCards)}
              className="px-3 rounded-xl border border-dashed border-gray-400 text-gray-500"
              title="Add a card"
            >
              +
            </button>
          </div>
        </div>

        {/* Dealer */}
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Dealer Upcard</h2>
          <div className="relative inline-block">
            <CardSelect value={dealerCard} onChange={setDealerCard} />
            {dealerCard && (
              <button
                onClick={() => setDealerCard("")}
                className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 text-xs"
                title="Remove dealer card"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Other Players */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Other Players</h2>
            <button
              onClick={addOtherPlayer}
              className="text-blue-500 hover:underline"
            >
              Add Hand
            </button>
          </div>
          <div className="space-y-4">
            {otherPlayers.map((hand, pIdx) => (
              <div key={pIdx} className="flex items-center space-x-2">
                {hand.map((card, cIdx) => (
                  <div key={cIdx} className="relative flex items-center">
                    <CardSelect
                      value={card}
                      onChange={(val) => handleOtherChange(pIdx, cIdx, val)}
                    />
                    {cIdx >= 2 && (
                      <button
                        onClick={() => removeCardFromOther(pIdx, cIdx)}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 text-xs"
                        title="Remove this card"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addCardToOther(pIdx)}
                  className="px-3 rounded-xl border border-dashed border-gray-400 text-gray-500"
                  title="Add card"
                >
                  +
                </button>
                <button
                  onClick={() => removeOtherPlayer(pIdx)}
                  className="px-3 rounded-xl border border-red-400 text-red-500"
                  title="Remove this player"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Calculate */}
        <div className="text-center">
          <button
            onClick={calculate}
            disabled={loading || !canCalculate}
            className="px-6 py-2 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Calculating..." : "Calculate"}
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="mt-6 bg-gray-50 p-4 rounded-xl">
            <h2 className="font-semibold mb-2">Recommended Move</h2>
            <p className="text-lg">
              Move: <strong>{results.move}</strong>
            </p>
            <p>
              Win: {results.winProb} | Loss: {results.lossProb}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
