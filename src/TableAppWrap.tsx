import React, { useState } from "react";
import { OpeningScreen, GameConfig } from "./OpeningScreen";
import MainTable from "./MainTable";
import "./app.css";

export default function TableApp() {
  const [config, setConfig] = useState<GameConfig | null>(null);

  // Available card styles (match your /cards assets folder names)
  const styles: string[] = ["hearts", "spades", "clubs", "diamonds"];

  // Until the user selects decks & style, show the opening screen
  if (!config) {
    return <OpeningScreen onStart={setConfig} />;
  }
  

  // Once configured, render the main table with props
  return <MainTable decks={config.decks} cardStyle={config.cardStyle} />;
}
