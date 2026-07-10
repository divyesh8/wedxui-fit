// Famous anime quotes, attributed to character and series.
// A random one is shown on every page load / login (see getRandomQuote).
export const quotes = [
  { text: 'If you don\'t take risks, you can\'t create a future!', author: 'Monkey D. Luffy — One Piece', category: 'courage' },
  { text: 'When the world shoves you around, you just gotta stand up and shove back.', author: 'Roronoa Zoro — One Piece', category: 'resolve' },
  { text: 'Only I can call my dream stupid.', author: 'Roronoa Zoro — One Piece', category: 'resolve' },
  { text: 'If you don\'t like your destiny, don\'t accept it. Instead, have the courage to change it the way you want it to be.', author: 'Naruto Uzumaki — Naruto', category: 'courage' },
  { text: 'Hard work is worthless for those that don\'t believe in themselves.', author: 'Naruto Uzumaki — Naruto', category: 'effort' },
  { text: 'A dropout will beat a genius through hard work.', author: 'Rock Lee — Naruto', category: 'effort' },
  { text: 'Those who forgive themselves, and are able to accept their true nature... they are the strong ones.', author: 'Itachi Uchiha — Naruto', category: 'mental' },
  { text: 'Human beings are strong because we can change ourselves.', author: 'Saitama — One Punch Man', category: 'growth' },
  { text: 'If the heroes run and hide, who will stay and fight?', author: 'Saitama — One Punch Man', category: 'courage' },
  { text: 'Go beyond! Plus Ultra!', author: 'All Might — My Hero Academia', category: 'limits' },
  { text: 'It\'s fine now. Why? Because I am here!', author: 'All Might — My Hero Academia', category: 'courage' },
  { text: 'Sometimes I do feel like I\'m a failure. Like there\'s no hope for me. But even so, I\'m not gonna give up.', author: 'Izuku Midoriya — My Hero Academia', category: 'resolve' },
  { text: 'There\'s only one certainty in life. A strong man stands above and conquers all!', author: 'Vegeta — Dragon Ball Z', category: 'strength' },
  { text: 'Power comes in response to a need, not a desire. You have to create that need.', author: 'Goku — Dragon Ball Z', category: 'strength' },
  { text: 'If you win, you live. If you lose, you die. If you don\'t fight, you can\'t win!', author: 'Eren Yeager — Attack on Titan', category: 'resolve' },
  { text: 'If you begin to regret, you\'ll dull your future decisions and let others make your choices for you.', author: 'Erwin Smith — Attack on Titan', category: 'mental' },
  { text: 'The only thing we\'re allowed to do is believe that we won\'t regret the choice we made.', author: 'Levi Ackerman — Attack on Titan', category: 'mental' },
  { text: 'No matter how many people you may lose, you have no choice but to go on living.', author: 'Tanjiro Kamado — Demon Slayer', category: 'resolve' },
  { text: 'Set your heart ablaze.', author: 'Kyojuro Rengoku — Demon Slayer', category: 'motivation' },
  { text: 'Throughout Heaven and Earth, I alone am the honored one.', author: 'Satoru Gojo — Jujutsu Kaisen', category: 'confidence' },
  { text: 'I don\'t know how I\'ll feel when I\'m dead, but I don\'t want to regret the way I lived.', author: 'Yuji Itadori — Jujutsu Kaisen', category: 'resolve' },
  { text: 'Don\'t believe in yourself. Believe in me! Believe in the Kamina who believes in you!', author: 'Kamina — Gurren Lagann', category: 'courage' },
  { text: 'A lesson without pain is meaningless. For you cannot gain something without sacrificing something else in return.', author: 'Edward Elric — Fullmetal Alchemist', category: 'growth' },
  { text: 'Surpass your limits. Right here, right now.', author: 'Yami Sukehiro — Black Clover', category: 'limits' },
  { text: 'Not giving up is my magic!', author: 'Asta — Black Clover', category: 'resolve' },
  { text: 'Talent is something you make bloom, instinct is something you polish.', author: 'Tooru Oikawa — Haikyuu!!', category: 'effort' },
  { text: 'If you have time to think of a beautiful end, then live beautifully till the end.', author: 'Gintoki Sakata — Gintama', category: 'mental' },
  { text: 'You should enjoy the little detours to the fullest. Because that\'s where you\'ll find the things more important than what you want.', author: 'Ging Freecss — Hunter x Hunter', category: 'growth' },
  { text: 'I\'ve never expected a miracle. I will get things done myself.', author: 'Guts — Berserk', category: 'resolve' },
  { text: 'Whether you win or lose, looking back and learning from your experience is a part of life.', author: 'Izuku Midoriya — My Hero Academia', category: 'growth' },
];

export type AnimeQuote = (typeof quotes)[number];

/** Random quote — different on every page load / login. */
export function getRandomQuote(): AnimeQuote {
  return quotes[Math.floor(Math.random() * quotes.length)];
}
