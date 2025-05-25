use std::hash::Hasher;
use std::hash::Hash;
use crate::deck::{Deck, Rank};


#[derive(Debug, Clone)]
pub enum Action {
    Hit,
    Stand,
}

// this is a struct that makes deck available for fingerprinting
#[derive(Clone, PartialEq, Eq)]
pub struct DeckCounts(pub Deck);

impl Hash for DeckCounts {
    fn hash<H: Hasher>(&self, state: &mut H) {
        for &r in Rank::ALL.iter() {
            let cnt = self.0.counts.get(&r).unwrap_or(&0);
            cnt.hash(state);
        }
    }
}

#[derive(Clone, PartialEq, Eq, Hash)]
pub struct DealerState {
    pub(crate) total: u32,
    pub(crate) soft: bool,
    pub(crate) deck: DeckCounts,
}
#[derive(Clone, PartialEq, Eq, Hash)]
pub struct PlayerState {
    pub(crate) total: u8,
    pub(crate) soft: bool,
    pub(crate) deck: DeckCounts,
}


#[derive(Debug)]
pub struct SimulationResult {
    pub win_prob: f64,
    pub lose_prob: f64,
    pub draw_prob: f64,
    pub recommended_action: Action,
}