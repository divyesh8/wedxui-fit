export const quotes = [
  { text: 'Discipline beats motivation every single time.', author: 'WEDXUI Creed', category: 'discipline' },
  { text: 'The only bad workout is the one that didn\'t happen.', author: 'WEDXUI Creed', category: 'consistency' },
  { text: 'Your body can stand almost anything. It\'s your mind you have to convince.', author: 'WEDXUI Creed', category: 'mental' },
  { text: 'Sweat is just fat crying.', author: 'WEDXUI Creed', category: 'motivation' },
  { text: 'Every champion was once a contender who refused to give up.', author: 'Rocky Balboa', category: 'motivation' },
  { text: 'The pain you feel today will be the strength you feel tomorrow.', author: 'Arnold Schwarzenegger', category: 'strength' },
  { text: 'You don\'t have to be extreme, just consistent.', author: 'WEDXUI Creed', category: 'consistency' },
  { text: 'Success is usually the culmination of controlling failure.', author: 'Sylvester Stallone', category: 'discipline' },
  { text: 'The only place where success comes before work is in the dictionary.', author: 'Vidal Sassoon', category: 'discipline' },
  { text: 'Don\'t stop when you\'re tired. Stop when you\'re done.', author: 'David Goggins', category: 'mental' },
  { text: 'Strength does not come from physical capacity. It comes from an indomitable will.', author: 'Mahatma Gandhi', category: 'strength' },
  { text: 'It\'s not about having time. It\'s about making time.', author: 'WEDXUI Creed', category: 'consistency' },
  { text: 'Your future is created by what you do today, not tomorrow.', author: 'Robert Kiyosaki', category: 'discipline' },
  { text: 'The last three or four reps is what makes the muscle grow.', author: 'Arnold Schwarzenegger', category: 'strength' },
  { text: 'A one-hour workout is 4% of your day. No excuses.', author: 'WEDXUI Creed', category: 'motivation' },
  { text: 'Fitness is not about being better than someone else. It\'s about being better than you were yesterday.', author: 'WEDXUI Creed', category: 'growth' },
  { text: 'The only way to define your limits is by going beyond them.', author: 'Arthur C. Clarke', category: 'mental' },
  { text: 'You don\'t get what you wish for. You get what you work for.', author: 'WEDXUI Creed', category: 'discipline' },
  { text: 'If it doesn\'t challenge you, it doesn\'t change you.', author: 'Fred DeVito', category: 'growth' },
  { text: 'The difference between who you are and who you want to be is what you do.', author: 'WEDXUI Creed', category: 'discipline' },
  { text: 'Train insane or remain the same.', author: 'WEDXUI Creed', category: 'motivation' },
  { text: 'Be stronger than your excuses.', author: 'WEDXUI Creed', category: 'mental' },
  { text: 'Your health is an investment, not an expense.', author: 'WEDXUI Creed', category: 'motivation' },
  { text: 'The hardest lift of all is lifting your butt off the couch.', author: 'WEDXUI Creed', category: 'motivation' },
  { text: 'Fall in love with taking care of yourself.', author: 'WEDXUI Creed', category: 'growth' },
  { text: 'Sore today, strong tomorrow.', author: 'WEDXUI Creed', category: 'recovery' },
  { text: 'Small daily improvements create stunning results.', author: 'WEDXUI Creed', category: 'consistency' },
  { text: 'Push yourself because no one else is going to do it for you.', author: 'WEDXUI Creed', category: 'mental' },
  { text: 'Great things come to those who sweat.', author: 'WEDXUI Creed', category: 'motivation' },
  { text: 'The body achieves what the mind believes.', author: 'WEDXUI Creed', category: 'mental' },
  { text: 'One day or day one. You decide.', author: 'WEDXUI Creed', category: 'discipline' },
];

export function getDailyQuote(): typeof quotes[0] {
  const dayOfMonth = new Date().getDate();
  return quotes[dayOfMonth % quotes.length];
}
