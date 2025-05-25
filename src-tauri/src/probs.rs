use crate::deck::{ Deck};
use crate::hand::Hand;
use std::collections::HashMap;

use crate::models::{ PlayerState, DealerState, DeckCounts};


//Stand Win Probability Lines: 10 - 155

pub fn dealer_bust_probability( // kinda useless when we have dealer_final_probs
    soft: bool, 
    dealer: &Hand, 
    deck: &Deck,cache : &mut HashMap<DealerState, f64>
) -> f64 { 
    let total= dealer.sum_of_cards();
    if total > 21 {
        return 1.0
    }
    if total >= 17 {
        return 0.0
    }  
    let state =    DealerState {
        total:total,
        soft: soft,
        deck: DeckCounts(deck.clone()),
    };
    if let Some(&v) = cache.get(&state) {
        return v;
    }
    

    let mut bust_prob = 0.0;
    let deck_sum = deck.total();
    for (r, &count) in deck.counts.iter() {
        if count == 0 {
            continue;
        }
        let prob_of_rank = count as f64 / deck_sum as f64;
        
        let mut new_dealer_hand = dealer.clone();
        new_dealer_hand.add_card(*r);
        let mut deck2 = deck.clone();
        deck2.draw_specific(*r);

        let mut t = new_dealer_hand.sum_of_cards();
        let mut is_soft = new_dealer_hand.ace_count() > 0 && t + 10 <= 21;
        if is_soft { 
            t += 10; 
        }
        if t > 21 && is_soft {
            // t -= 10;
            is_soft = false;
        }
        
        let sub: f64 = dealer_bust_probability(is_soft, &new_dealer_hand, &deck2, cache);
        bust_prob += prob_of_rank * sub;
    }


    cache.insert(state, bust_prob);
    bust_prob
}

pub fn dealer_final_probs( // better function, returns probabilities of 17 - 21, and dealer_bust
    soft: bool,
    dealer: &Hand,
    deck: &Deck,
    cache: &mut HashMap<DealerState, [f64; 6]>
) -> [f64; 6] { 
    let total = dealer.sum_of_cards();
    if total > 21 {
        
        return [0., 0., 0., 0., 0., 1.];
    }
    if total >= 17 {
        
        let mut out = [0.; 6];
        out[(total as usize) - 17] = 1.0;
        return out;
    }

    let state = DealerState {
        total,
        soft,
        deck: DeckCounts(deck.clone()),
    };

    if let Some(&v) = cache.get(&state) {
        return v;
    }
    let mut result = [0.; 6];
    let deck_total = deck.total() as f64;

    for (r, &count) in deck.counts.iter() {
        if count == 0 {
            continue;
        }
        let prob_of_rank = count as f64 / deck_total;

        let mut new_dealer_hand = dealer.clone();
        new_dealer_hand.add_card(*r);
        let mut deck2 = deck.clone();
        deck2.draw_specific(*r);


        let mut t = new_dealer_hand.sum_of_cards();
        let mut is_soft = new_dealer_hand.ace_count() > 0 && t + 10 <= 21;
        if is_soft { 
            t += 10; 
        }
        if t > 21 && is_soft {
            // t -= 10;
            is_soft = false;
        }
        
        let sub_probs =  dealer_final_probs(is_soft, &new_dealer_hand, &deck2, cache);
        for i in 0..6 {
            result[i] += prob_of_rank * sub_probs[i];
        }
    }
    cache.insert(state, result);
    result
 }

 pub fn stand_win_probability( //by giving hand total, returns the chance you win if the dealer plays out their hand
    player_total: u8,
    dealer: &Hand,
    deck: &Deck,
    cache: &mut HashMap<DealerState, [f64; 6]>,
) -> f64 {
    let soft = dealer.has_ace() && dealer.sum_of_cards() + 10 <= 21;
    let dealer_probs = dealer_final_probs(soft, dealer, deck, cache);
    let mut win_prob = 0.0;
    for (i, &p) in dealer_probs.iter().enumerate() {
        let dealer_score = match i {
            0 => 17,
            1 => 18,
            2 => 19,
            3 => 20,
            4 => 21,
            5 => 22,
            _ => unreachable!(), // not necessary i know
        };
        if dealer_score == 22{
            win_prob += p;
        }
        else if player_total > dealer_score {
            win_prob += p;
        }
        else if player_total == dealer_score {
            win_prob += p * 0.5;
        }
    }
    win_prob
}
    

//Hit Win Probability Lines: 160 - 215
#[allow(unused_assignments)] // for soft
pub fn hit_win_probability(
    soft_player: bool,
    player: &Hand,
    dealer: &Hand,
    deck: &Deck,
    dealer_cache: &mut HashMap<DealerState, [f64;6]>,
    hit_cache:   &mut HashMap<PlayerState, f64>
) -> f64 { 

    let mut total = player.sum_of_cards() as u8;
    if soft_player && (total + 10) <= 21 {
        total += 10;
    }
    if total > 21 {
        return 0.0;
    }

    let key = PlayerState {
        total,
        soft: soft_player,
        deck: DeckCounts(deck.clone()),
    };
    if let Some(&v) = hit_cache.get(&key) {
        return v;
    }
    let mut win_prob = 0.0;
    let deck_total = deck.total() as f64;
    for (&r, &count) in deck.counts.iter(){
        if count == 0 {
            continue;
        }
        let prob_of_rank = count as f64 / deck_total;
        let mut new_player_hand = player.clone();
        new_player_hand.add_card(r);
        let mut deck2 = deck.clone();
        deck2.draw_specific(r);

        let mut t = new_player_hand.sum_of_cards() as u8;
        let mut is_soft = new_player_hand.ace_count() > 0 && (t + 10) <= 21;
        if is_soft { 
            t += 10; 
        }
        if t > 21 && is_soft {
            t -= 10;
            
            is_soft = false;
        }
        let w = if t > 21 {
            0.0
        }
        else{
            stand_win_probability(t, &dealer, &deck2, dealer_cache)
        };
        win_prob += prob_of_rank * w;
    }
    hit_cache.insert(key, win_prob);
    win_prob
}

pub fn decide(
    player: &Hand,
    dealer: &Hand,
    deck: &Deck,
    dealer_cache: &mut HashMap<DealerState, [f64;6]>,
    hit_cache:   &mut HashMap<PlayerState, f64>
) -> (f64, f64) {
    
    let mut t = player.sum_of_cards() as u8;
    let soft = player.ace_count() > 0 && (t + 10) <= 21;
    if soft { t += 10; }
    if t == 21 { return (0.0, 1.0); }
    let stand_ev = stand_win_probability(t, dealer, deck, dealer_cache);
    let hit_ev   = hit_win_probability(soft, player, dealer, deck, dealer_cache, hit_cache);
    (hit_ev, stand_ev)
}




