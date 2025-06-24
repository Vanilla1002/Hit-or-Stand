import { useState } from "react";
import { OpeningScreen, GameConfig } from "./OpeningScreen";
import MainTable from "./MainTable";
import { DeckProvider } from "./deckContext";
import { Suit, SuitContext } from "./SettingsModal"; // ייבוא הקונטקסט
import "./app.css";

export default function TableApp() {
  const [config, setConfig] = useState<GameConfig | null>(null);

  const [activeSuit, setActiveSuit] = useState<Suit>("hearts");

  return (
    <DeckProvider>
      <SuitContext.Provider value={{ activeSuit, setActiveSuit }}>
        {!config ? (
          <OpeningScreen onStart={setConfig} />
        ) : (
          <MainTable decks={config.decks} cardStyle={config.cardStyle} />
        )}
      </SuitContext.Provider>
    </DeckProvider>
  );
}
