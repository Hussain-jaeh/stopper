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

/**
 * Public community name for a user: the one they picked, falling back to the
 * generated handle for anyone who hasn't chosen yet. Memoised per request so a
 * feed of 50 posts by 5 people costs 5 lookups, not 50.
 */
export function handleResolver(ctx: { db: any }) {
  const cache = new Map<string, Promise<string>>();
  return (userId: string): Promise<string> => {
    const hit = cache.get(userId);
    if (hit) return hit;
    const p: Promise<string> = ctx.db
        .query("userProfiles")
        .withIndex("by_userId", (q: any) => q.eq("userId", userId))
        .unique()
        .then((up: any) => up?.communityName ?? makeHandle(userId));
    cache.set(userId, p);
    return p;
  };
}

export const COMMUNITY_NAME_RE = /^[A-Za-z0-9_]{3,20}$/;
