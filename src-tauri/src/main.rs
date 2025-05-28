use serde::{Deserialize, Serialize};
use std::{collections::HashMap, str::FromStr};
use tauri::{Builder, generate_handler, State, Manager};
use std::sync::{Arc, Mutex};
use tauri::Emitter;

mod probs;
mod models;
mod hand;
mod deck;

use models::{DealerState, PlayerState};
use hand::Hand;
use deck::{Deck, Rank};
use probs::decide;


type SharedDeck = Arc<Mutex<Deck>>;
#[tauri::command]
fn create_deck(num_decks: u32, state: State<'_, SharedDeck>, app_handle: tauri::AppHandle) -> Result<(), String> {
    
    let new_deck = Deck::new(num_decks);

    
    println!(
        "✅ Created a shoe of {} deck(s): {} cards total",
        num_decks,
        new_deck.total()
    );

    
    let mut deck_lock = state
        .lock()
        .map_err(|e| format!("failed to lock deck mutex: {}", e))?;
    *deck_lock = new_deck.clone();
    
    app_handle.emit("deck-updated", new_deck)
    .map_err(|e| e.to_string())?;


    Ok(())
}
/// Helper to convert incoming "A", "2", …, "K" into your `Rank` enum.
impl FromStr for Rank {
    type Err = String;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "A"  => Ok(Rank::Ace),
            "2"  => Ok(Rank::Two),
            "3"  => Ok(Rank::Three),
            "4"  => Ok(Rank::Four),
            "5"  => Ok(Rank::Five),
            "6"  => Ok(Rank::Six),
            "7"  => Ok(Rank::Seven),
            "8"  => Ok(Rank::Eight),
            "9"  => Ok(Rank::Nine),
            "10" => Ok(Rank::Ten),
            "J"  => Ok(Rank::Jack),
            "Q"  => Ok(Rank::Queen),
            "K"  => Ok(Rank::King),
            other => Err(format!("invalid rank string: {}", other)),
        }
    }
}


#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct NextTurnRequest {
    player: Vec<String>,
    dealer: Vec<String>,
    others: Vec<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct DecideRequest {
    player: Vec<String>,
    dealer: String,
    others: Vec<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DecideResponse {
    hit_ev: f64,
    stand_ev: f64,
}



#[tauri::command]
fn decide_hand(req: DecideRequest,state: State<'_, SharedDeck>) -> Result<DecideResponse, String> {
    // parse all String ranks into your Rank enum
    print!("{:?}","deciding");
    let player_cards: Vec<Rank> = req
        .player
        .iter()
        .map(|s| Rank::from_str(s).map_err(|e| e.to_string()))
        .collect::<Result<_,_>>()?;
    let dealer_card: Rank = Rank::from_str(&req.dealer).map_err(|e| e.to_string())?;
    let other_cards: Vec<Rank> = req
        .others
        .iter()
        .map(|s| Rank::from_str(s).map_err(|e| e.to_string()))
        .collect::<Result<_,_>>()?;

    // build Hand instances
    let player_hand = Hand::with_cards(player_cards.clone());
    let dealer_hand = Hand::with_cards(vec![dealer_card]);

    
    let deck_clone = {
        let guard = state.lock()
            .map_err(|e| format!("deck lock error: {}", e))?;
        guard.clone()
    };
    // remove all seen cards from counts
    let mut working_deck = deck_clone;
    working_deck.remove_dealt(&player_cards);
    working_deck.remove_dealt(&[dealer_card]);
    working_deck.remove_dealt(&other_cards);
    // fresh caches
    let mut dealer_cache: HashMap<DealerState, [f64; 6]> = HashMap::new();
    let mut hit_cache:   HashMap<PlayerState, f64>    = HashMap::new();

    // call your existing logic
    let (hit_ev, stand_ev) =
        decide(&player_hand, &dealer_hand, &working_deck, &mut dealer_cache, &mut hit_cache);

    Ok(DecideResponse { hit_ev, stand_ev })
}

#[tauri::command]
fn next_turn(
    req: NextTurnRequest,
    state: State<'_, SharedDeck>,
    app_handle: tauri::AppHandle
) -> Result<(), String> {
    // parse all strings into Rank
    let parse_vec = |v: Vec<String>| -> Result<Vec<Rank>, String> {
        v.into_iter()
            .map(|s| Rank::from_str(&s).map_err(|e| e.to_string()))
            .collect()
    };
    let player_cards = parse_vec(req.player)?;
    let dealer_cards = parse_vec(req.dealer)?;
    let other_cards  = parse_vec(req.others)?;

    // grab & clone the deck
    let mut guard = state.lock().map_err(|e| e.to_string())?;
    let mut deck = guard.clone();

    // remove seen cards
    deck.remove_dealt(&player_cards);
    deck.remove_dealt(&dealer_cards);
    deck.remove_dealt(&other_cards);

    // store updated deck back into shared state
    *guard = deck.clone();

    // emit the exact same DeckShape payload your JS is expecting
    app_handle
        .emit("deck-updated", deck)
        .map_err(|e| e.to_string())?;

    Ok(())
}



fn main() {
    let initial_deck = Arc::new(Mutex::new(Deck::new(1)));

    println!("Starting Tauri app...");
    Builder::default()
    .manage(initial_deck)
        .invoke_handler(generate_handler![create_deck, decide_hand, next_turn])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    
}