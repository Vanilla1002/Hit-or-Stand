use std::collections::HashMap;
use std::fmt;
use crate::models::{DealerState , PlayerState};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Rank {
    Ace,
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Jack,
    Queen,
    King,
}
impl Rank{
    pub const ALL: [Rank; 13] = [
        Rank::Ace, Rank::Two, Rank::Three, Rank::Four, Rank::Five, Rank::Six,
        Rank::Seven, Rank::Eight, Rank::Nine, Rank::Ten,
        Rank::Jack, Rank::Queen, Rank::King 
    ];
    pub fn base_value(&self) -> u32 {
        match self {
            Rank::Ace => 1, 
            Rank::Two => 2,
            Rank::Three => 3,
            Rank::Four => 4,
            Rank::Five => 5,
            Rank::Six => 6,
            Rank::Seven => 7,
            Rank::Eight => 8,
            Rank::Nine => 9,
            Rank::Ten | Rank::Jack | Rank::Queen | Rank::King => 10,
        }
    }
}

impl fmt::Display for Rank{
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Rank::Ace   => "A",
            Rank::Two   => "2",
            Rank::Three => "3",
            Rank::Four  => "4",
            Rank::Five  => "5",
            Rank::Six   => "6",
            Rank::Seven => "7",
            Rank::Eight => "8",
            Rank::Nine  => "9",
            Rank::Ten   => "10",
            Rank::Jack  => "J",
            Rank::Queen => "Q",
            Rank::King  => "K",
        };
        write!(f, "{s}")
    }
}

#[derive(Clone, PartialEq, Eq)]
pub struct Deck {
    pub counts: HashMap<Rank, u32>
}

impl Deck {
    pub fn new(num_decks: u32) -> Self {
        let mut counts = HashMap::with_capacity(13);
        let per_rank = 4 * num_decks;
        for &r in &Rank::ALL {
            counts.insert(r, per_rank);
        }
        Deck {counts}
    }

    pub fn draw_specific(&mut self, rank: Rank) -> bool {
        if let Some(cnt) = self.counts.get_mut(&rank) {
            if *cnt > 0 {
                *cnt -= 1;
                return true;
            }
        }
        false
    }

    pub fn remove_dealt(&mut self, dealt: &[Rank]){
        for &r in dealt {
            let _ = self.draw_specific(r);
        }
        
    }

    pub fn sum(&self) -> u32 {  //sum of card's values in deck
        let mut sum = 0;
        for (r, cnt) in &self.counts {
            sum += cnt * r.base_value();
        }
        sum
    }   

    pub fn total(&self) -> u32 { //number of cards
        let mut count = 0;
        for (_, cnt) in &self.counts {
            count += cnt;
        }
        count
    }
}



//testing just for now
#[cfg(test)]
mod tests {
    use crate::{hand::Hand, probs::{ decide,}};

    use super::*;

    #[test]
    fn draw_ace_reduces_count() {
        let mut deck = Deck::new(1);
        
        print!("{:?}", deck.counts);
        let mut dealer_cache: HashMap<DealerState, [f64; 6]> = HashMap::new();
        let mut hit_cache:    HashMap<PlayerState, f64>    = HashMap::new();

        let  user_hand = Hand::with_cards(vec![Rank::Eight, Rank::Ace]);
        let  dealer_hand = Hand::with_cards(vec![Rank::Seven, Rank::Ten]);
        let decide = decide(&user_hand, &dealer_hand, &deck, &mut dealer_cache, &mut hit_cache);
        print!("{:?}", decide);
        

    }
}
