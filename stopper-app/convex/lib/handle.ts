const ADJS  = ['Swift','Brave','Phoenix','Strong','Clear','Dawn','Storm','Noble','True','Calm','Bold','Free','Bright','Steady','Quiet'];
const NOUNS = ['Eagle','River','Stone','Light','Wind','Path','Star','Wave','Oak','Rain','Hawk','Cliff','Tide','Grove','Spark'];

export function makeHandle(userId: string): string {
  let h = 5381;
  for (let i = 0; i < userId.length; i++) {
    h = ((h << 5) + h) ^ userId.charCodeAt(i);
    h |= 0;
  }
  const n = Math.abs(h);
  return `${ADJS[n % ADJS.length]}${NOUNS[Math.floor(n / ADJS.length) % NOUNS.length]}_${(n % 90) + 10}`;
}
