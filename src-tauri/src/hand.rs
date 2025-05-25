use crate::deck::Rank;


#[derive(Debug, Clone)]
pub struct Hand {
    pub cards: Vec<Rank>,
    
    
}
impl Hand {
    pub fn new() -> Self {
        Hand {
            cards: Vec::new()
        }
    }
    pub fn with_cards(initial_cards: Vec<Rank>) -> Self {
        Hand {
            cards: initial_cards
        }
    }



    pub fn add_card(&mut self, card: Rank) {
        self.cards.push(card);
    }
    pub fn ace_count(&self) -> u32 {
        let mut count = 0;
        for card in &self.cards {
            if *card == Rank::Ace {
                count += 1;
            }
        }
        count
    }
        
    pub fn has_ace(&self) -> bool {
        if self.ace_count() > 0 {
            true
        } else {
            false
        }
    }

    
    pub fn sum_of_cards(&self) -> u32 {
        let mut sum = 0;
        for card in &self.cards {
            sum += card.base_value();
        }
        sum
        }
    
}

