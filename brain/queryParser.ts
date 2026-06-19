export function parseQuery(query: string) {
  const q = query.toLowerCase();

  // detect explicit country/city mentions
  const LOCATIONS: Record<string, string> = {
    "united states": "United States",
    "usa": "United States",
    "texas": "United States",
    "california": "United States",
    "new york": "United States",
    "uk": "United Kingdom",
    "united kingdom": "United Kingdom",
    "england": "United Kingdom",
    "india": "India",
    "china": "China",
    "pakistan": "Pakistan",
    "germany": "Germany",
    "france": "France",
    "australia": "Australia",
    "japan": "Japan",
    "brazil": "Brazil",
    "canada": "Canada",
    "uae": "UAE",
    "dubai": "UAE",
    "nigeria": "Nigeria",
    "kenya": "Kenya",
    "south africa": "South Africa",
  };

  let detectedLocation: string | null = null;

  for (const [key, value] of Object.entries(LOCATIONS)) {
    if (q.includes(key)) {
      detectedLocation = value;
      break;
    }
  }

  // extract product — first 3-4 meaningful words
  const stopWords = new Set([
    "we","are","a","an","the","in","to","of","and","or","is","be",
    "our","us","for","from","that","this","with","want","wanting",
    "anywhere","where","there","less","more","fewer","world","global",
    "company","business","expand","making","manufacturers","manufacturer",
    "looking","trying","anywhere","have","has","had","i","my","they"
  ]);

  const product = query
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))
    .slice(0, 3)
    .join(" ");

  return {
    product: product || query.trim(),
    location: detectedLocation,
  };
}
