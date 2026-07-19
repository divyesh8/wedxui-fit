// Original WEDXUI coach-voice principles — one is shown per page load / login.
// (Replaced the former anime quotes as part of the premium rebrand; the export
// names and shape are unchanged so consumers didn't need edits.)
export const quotes = [
  { text: 'The plan only works on the days you show up. Show up.', author: 'WEDXUI Coach', category: 'consistency' },
  { text: 'You don\'t need motivation. You need the next set.', author: 'WEDXUI Coach', category: 'resolve' },
  { text: 'Strength is built in the reps nobody sees.', author: 'WEDXUI Coach', category: 'effort' },
  { text: 'Progress hides in boring weeks. Stack them.', author: 'WEDXUI Coach', category: 'consistency' },
  { text: 'Train the movement, not the mirror. The mirror catches up.', author: 'WEDXUI Coach', category: 'growth' },
  { text: 'A missed session is data, not failure. Adjust and go again.', author: 'WEDXUI Coach', category: 'mental' },
  { text: 'Heavy is relative. Effort is absolute.', author: 'WEDXUI Coach', category: 'strength' },
  { text: 'Your future physique is voting on what you do today.', author: 'WEDXUI Coach', category: 'motivation' },
  { text: 'Recovery is training. Sleep like it counts, because it does.', author: 'WEDXUI Coach', category: 'recovery' },
  { text: 'The last two reps are the ones that change you.', author: 'WEDXUI Coach', category: 'effort' },
  { text: 'Discipline is remembering why you started when the novelty is gone.', author: 'WEDXUI Coach', category: 'mental' },
  { text: 'Small plates add up. So do small sessions.', author: 'WEDXUI Coach', category: 'consistency' },
  { text: 'Protein at every meal. Water before you\'re thirsty. Basics win.', author: 'WEDXUI Coach', category: 'nutrition' },
  { text: 'Comparison burns energy you could spend on your next set.', author: 'WEDXUI Coach', category: 'mental' },
  { text: 'You are one consistent month away from believing in yourself.', author: 'WEDXUI Coach', category: 'motivation' },
  { text: 'Perfect programs don\'t exist. Executed programs do.', author: 'WEDXUI Coach', category: 'resolve' },
  { text: 'Earn the harder variation. Progression is the reward.', author: 'WEDXUI Coach', category: 'growth' },
  { text: 'The streak isn\'t about the number. It\'s about who keeps it.', author: 'WEDXUI Coach', category: 'consistency' },
  { text: 'Leave one rep in the tank today so you can come back tomorrow.', author: 'WEDXUI Coach', category: 'recovery' },
  { text: 'Nobody is coming to lift it for you. Good. It\'s yours.', author: 'WEDXUI Coach', category: 'resolve' },
];

export type AnimeQuote = (typeof quotes)[number];

/** Random quote — different on every page load / login. */
export function getRandomQuote(): AnimeQuote {
  return quotes[Math.floor(Math.random() * quotes.length)];
}
