import  { useState } from "react";
import { OpeningScreen, GameConfig } from "./OpeningScreen";
import MainTable from "./MainTable";
import { DeckProvider } from "./deckContext";
import "./app.css";

export default function TableApp() {
  const [config, setConfig] = useState<GameConfig | null>(null);
  const styles: string[] = ["hearts", "spades", "clubs", "diamonds"];

  return (
    <DeckProvider>
      {!config ? (
        <OpeningScreen onStart={setConfig} />
      ) : (
        <MainTable decks={config.decks} cardStyle={config.cardStyle} />
      )}
    </DeckProvider>
  );
}
