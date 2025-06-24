import { useState, useEffect } from "react";
import "./app.css";

type HowToUseProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function HowToUse({ isOpen, onClose }: HowToUseProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 480px)");
    setIsMobile(mediaQuery.matches);

    const handleResize = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{
          width: isMobile ? "95vw" : "90vw",
          maxWidth: isMobile ? "none" : "320px",
          padding: isMobile ? "1rem" : "1.5rem",
          maxHeight: isMobile ? "80vh" : "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          style={{
            position: "absolute",
            top: isMobile ? "0.3rem" : "0.4rem",
            right: isMobile ? "0.3rem" : "0.4rem",
            width: isMobile ? "2.5rem" : "2rem",
            height: isMobile ? "2.5rem" : "2rem",
            background: "rgba(0, 0, 0, 0.8)",
            border: "1px solid var(--border-light)",
            borderRadius: "50%",
            color: "var(--text)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isMobile ? "1.5rem" : "1.25rem",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(0, 0, 0, 0.6)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)")}
          onClick={onClose}
          title="Close"
          aria-label="Close How to Use modal"
        >
          X
        </button>
        <h3
          style={{
            fontSize: isMobile ? "1.25rem" : "1.5rem",
            marginTop: "2rem",
            marginBottom: "0.5rem",
          }}
        >
          How to Use
        </h3>
        <p
          style={{
            fontSize: isMobile ? "0.9rem" : "1rem",
            lineHeight: "1.4",
          }}
        >
          Welcome to Hit-Or-Stand: Your Ultimate Blackjack Advantage!<br /><br />
          Get ready to elevate your blackjack game with precise calculations and strategic insights. To kick things off, customize your game settings:<br /><br />
          - Tell us the number of decks the dealer is playing with.<br />
          - Pick the card style that suits your visual preference.<br /><br />
          After these quick selections, simply click "Start."<br /><br />
          During each turn, you'll input your current hand and the dealer's face-up card. To supercharge the calculator's accuracy, you can also input any "trashed" cards from other players' hands.<br /><br />
          With a quick click of "Calculate," you'll receive the optimal move to make, plus the exact probability of winning or losing. Once you've made your move, you have two choices: either proceed to the "Next Turn" for a fresh start, or if you took a card, enter the new card to recalculate and refine your strategy mid-turn.
          <br /><br />
          disclaimer: this app is not intended for gambling.
        </p>
      </div>
    </div>
  );
}