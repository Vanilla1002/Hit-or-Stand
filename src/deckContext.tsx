
import React, { createContext, useState, useEffect, useContext } from "react";
import { listen } from "@tauri-apps/api/event";


export type DeckShape = {
  counts: Record<string, number>;
};

const DeckContext = createContext<DeckShape | null>(null);

export const useDeck = () => useContext(DeckContext);

export const DeckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deck, setDeck] = useState<DeckShape | null>(null);

  useEffect(() => {
    const unlisten = listen<DeckShape>("deck-updated", (event) => {
      console.log("🎴 Deck updated:", event.payload);
      setDeck(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return <DeckContext.Provider value={deck}>{children}</DeckContext.Provider>;
};
