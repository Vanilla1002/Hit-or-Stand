
# Hit or Stand
![449631098-dff15f59-4680-4b17-a26a-59583bbdf59a](https://github.com/user-attachments/assets/af547ec3-628e-4123-8799-40bfbf254fc5)


Hit or Stand is a powerful and intuitive cross-platform application designed to help BlackJack players make optimal decisions based on real-time probabilities. By inputting the cards dealt to yourself, the dealer, and other players, the app leverages a custom-built statistical engine to calculate your best chances of winning, guiding you on whether to "Hit" or "Stand."




## About The Project
"Hit or Stand" aims to provide a data-driven edge to BlackJack enthusiasts. Traditional basic strategy charts are useful, but they don't account for the specific cards already out of the deck. This application does just that. By tracking all revealed cards, it dynamically updates the remaining deck composition, allowing its custom algorithm to deliver highly accurate "Hit" or "Stand" recommendations.

Whether you're a casual player looking to improve or a serious enthusiast seeking every possible advantage, "Hit or Stand" offers a unique and reliable tool for making informed decisions at the table.


### How It Works

At its core, "Hit or Stand" operates on a sophisticated, custom-designed statistical algorithm. You input the cards that have been dealt to yourself, the dealer, and any other players at the table. The application then uses this information to:

1. **Model the Remaining Deck:** The Rust backend dynamically adjusts the virtual deck, removing all known cards to accurately reflect the true composition of undealt cards. This shared deck state is efficiently managed using a `std::sync::Arc<std::sync::Mutex<Deck>>` in Rust, ensuring safe concurrent access and updates.

2. **Calculate Dealer Probabilities:** It predicts the probabilities of the dealer achieving various final scores (17-21) or busting, taking into account the current deck.

3. **Evaluate Player Outcomes:** For both "Hit" and "Stand" scenarios, the algorithm calculates your win probability against the dealer's potential outcomes.

4. **Recommend Best Action:** Based on these probabilities, the app advises you on the optimal action ("Hit" or "Stand") and quantifies your winning chances for each.

The custom `probs.rs` algorithm, using dynamic programming with caching (`HashMap`) for efficiency, computes probabilities for both the dealer's final hand and the player's potential outcomes after hitting. This ensures that the recommendations are not just based on generic rules, but on the precise statistical reality of the current game state.

The Tauri framework facilitates seamless communication between the React/TypeScript frontend and the Rust backend. Frontend actions trigger Tauri commands (e.g., `decide_hand`, `next_turn`), which execute the Rust logic, and the backend then emits events (e.g., deck-updated) to keep the UI synchronized.
## Key features
**Advanced Decision Algorithm:** Powered by a custom-built statistical engine in Rust, this feature precisely calculates "Hit" or "Stand" probabilities based on cards already dealt. This isn't just basic strategy; it's dynamic, real-time statistical analysis.

**Dynamic Deck & Card Management:** The application intelligently manages the deck by tracking dealt cards. This functionality is robustly implemented using Rust's enum types for cards (Rank) and a HashMap for efficient deck tracking (Deck). The frontend stays updated via backend events, reflecting the accurate deck state.

**Responsive and Adaptable UI:** Built with React and TypeScript, the user interface automatically adjusts and looks great on any platform, whether you're using it on a desktop, tablet, or mobile phone.

**Customizable Card Suits:** Personalize your experience! You can select different card suit designs in the settings to match your preference, enhancing the visual appeal.


## Algorithm Deep Dive

The core intelligence of "Hit or Stand" resides in its highly optimized Rust-based probability engine, found primarily in `src-tauri/src/probs.rs`. This engine uses a recursive, dynamic programming approach to calculate precise win probabilities, accounting for every card in the shoe.

### Deck Representation (`deck.rs`)
The foundation of the algorithm is an accurate representation of the BlackJack shoe.

- The `Rank` enum defines the 13 possible card ranks (Ace, Two, ..., King). It also provides `base_value()` for numerical representation and `Display` implementation for string conversion.

- The `Deck` struct, using a `HashMap<Rank, u32>`, stores the count of each `Rank` currently remaining in the shoe. This allows for efficient tracking of cards as they are dealt.

- Methods like `new()` to initialize a shoe, `draw_specific()` to remove a card, `remove_dealt()` to remove multiple cards, and `total()` to get the remaining card count ensure accurate deck state management.

### Probability Calculation (`probs.rs`)
The probs.rs file contains the functions that drive the decision-making:

1. ** `dealer_final_probs(soft: bool, dealer: &Hand, deck: &Deck, cache: &mut HashMap<DealerState, [f64; 6]>) -> [f64; 6]` **


- This is the most critical function for the dealer's side. It recursively calculates the probabilities of the dealer achieving a final hand total between 17 and 21, or busting (represented as 22).

- soft indicates if the dealer's hand is currently "soft" (contains an Ace that can be 1 or 11).

- It simulates drawing each possible card from the deck, recursively calling itself with the new hand and reduced deck.

- A HashMap<DealerState, [f64; 6]> is used as a memoization cache to store results for previously calculated dealer states. This dramatically improves performance by avoiding redundant computations in the recursive calls. The DealerState key uniquely identifies a dealer's hand state (total, soft status, and remaining deck composition).

2. **`stand_win_probability(player_total: u8, dealer: &Hand, deck: &Deck, cache: &mut HashMap<DealerState, [f64; 6]>) -> f64`**

- Given the player's current player_total, this function determines the probability of winning if the player chooses to "Stand".

- It utilizes dealer_final_probs to get the distribution of the dealer's possible final hands.

- It then sums up the probabilities where the player's total is greater than the dealer's final score, and adds half the probability for pushes (ties). Dealer busts (score 22) count as a win for the player.

3. **`hit_win_probability(soft_player: bool, player: &Hand, dealer: &Hand, deck: &Deck, dealer_cache: &mut HashMap<DealerState, [f64;6]>, hit_cache: &mut HashMap<PlayerState, f64>) -> f64`**

- This function calculates the probability of winning if the player chooses to "Hit".

- It iterates through every possible card the player could draw next from the current deck.

- For each potential drawn card, it recursively calls stand_win_probability (if the player doesn't bust) or itself (if the player needs to hit again, e.g., on a soft hand after drawing a small card).

- A HashMap<PlayerState, f64> serves as a memoization cache for player hit probabilities, similarly optimizing recursive calls. PlayerState captures the player's hand state (total, soft status, and remaining deck).

4. **`decide(player: &Hand, dealer: &Hand, deck: &Deck, dealer_cache: &mut HashMap<DealerState, [f64;6]>, hit_cache: &mut HashMap<PlayerState, f64>) -> (f64, f64)`**

- This is the top-level decision function called by the frontend.

- It calculates both the stand_ev (expected value/win probability for standing) and hit_ev (expected value/win probability for hitting) for the current player's hand against the dealer's visible card, given the current deck state.

- It intelligently initializes and passes the shared dealer_cache and hit_cache to optimize computations.

By combining careful deck state management with highly optimized recursive probability calculations and robust caching, "Hit or Stand" delivers real-time, statistically sound advice for optimal BlackJack play.


# Getting Started

To get a local copy of **Hit or Stand** up and running, follow these steps.

## Prerequisites

Make sure you have the following installed:

- **Node.js and npm (or yarn)**
  ```bash
  # Check if installed
  node -v
  npm -v
  ```

- **Rust and Cargo**
  ```bash
  # Install Rust (if not already installed)
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

  # Verify installation
  rustc --version
  cargo --version
  ```

- **Tauri CLI**
  ```bash
  # Install via Cargo
  cargo install tauri-cli --force

  # Or using npm
  npm install -g @tauri-apps/cli
  ```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vanilla1002/Hit-or-Stand.git
   ```

2. **Navigate into the project directory**
   ```bash
   cd hit-or-stand
   ```

3. **Install frontend dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

## Development

Run the application in development mode:
```bash
npm run tauri dev
# or
yarn tauri dev
```
This will open the application in a development window.

## Build (Production)

Build the application for production:
```bash
npm run tauri build
# or
yarn tauri build
```
The compiled executable will be located in `src-tauri/target/release/`.  


## Usage

Once the application is running, you can start inputting cards:

- **Initialize Deck:**  
  Upon starting, the app creates a new deck (or shoe, depending on settings).

- **Enter Dealt Cards:**  
  Use the intuitive UI to input the cards that have been revealed:
  - Your own cards (your hand).  
  - The dealer’s face-up card.  
  - Cards dealt to any other players at the table (by clicking the `Seen Cards` tab).

- **Get Recommendations:**  
  Click the `Calculate` button. The app will immediately process the input and display:
  - Your current hand value.  
  - The dealer’s visible hand value.  
  - The calculated probability of winning if you **Hit**.  
  - The calculated probability of winning if you **Stand**.  
  - A clear recommendation on the best action (“Hit” or “Stand”) based on these probabilities.

- **Proceed to Next Turn:**  
  After a decision is made or a hand is concluded, click `Next Turn`. You’ll be prompted to enter any additional cards the dealer revealed, and all previously entered cards will be removed from the active deck for the next round.

- **Customize UI:**  
  Go to **Settings** to change the visual style of the cards.

- **Shuffle/Reset:**  
  In **Settings**, you can also shuffle the deck, which effectively creates a brand-new deck and clears all entered cards.

