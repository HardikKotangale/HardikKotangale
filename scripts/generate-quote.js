// Generates assets/quote.svg — a custom, self-hosted "quote of the day" card
// styled to match the dark / glassmorphism aesthetic of hardikotangale.com.
// The quote itself is fetched live from a public API (ZenQuotes' "today"
// endpoint, which returns the same quote all day and rotates at midnight UTC)
// so it is never a hardcoded/predefined list. See .github/workflows/quote.yml
// for the daily schedule that reruns this script.

const fs = require("fs");
const path = require("path");

const QUOTE_API_URL = "https://zenquotes.io/api/today";

async function fetchQuote() {
  const res = await fetch(QUOTE_API_URL, {
    headers: { "User-Agent": "hardikotangale-readme-quote/1.0" },
  });
  if (!res.ok) {
    throw new Error(`Quote API responded with ${res.status}`);
  }
  const data = await res.json();
  const entry = Array.isArray(data) ? data[0] : null;
  if (!entry || !entry.q || !entry.a) {
    throw new Error("Quote API returned an unexpected payload");
  }
  return { quote: entry.q, author: entry.a };
}

function wrapText(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSvg(quote, author) {
  const width = 800;
  const lineHeight = 26;
  const lines = wrapText(quote, 60);
  const textBlockHeight = lines.length * lineHeight;
  const paddingY = 44;
  const height = Math.max(150, textBlockHeight + paddingY * 2 + 24);

  const textLines = lines
    .map(
      (line, i) =>
        `<tspan x="70" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
    )
    .join("");

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="border" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#22d3ee"/>
      <stop offset="0.5" stop-color="#a78bfa"/>
      <stop offset="1" stop-color="#f472b6"/>
    </linearGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0d1117"/>
      <stop offset="1" stop-color="#111827"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect x="1.5" y="1.5" width="${width - 3}" height="${height - 3}" rx="16" fill="url(#bg)" stroke="url(#border)" stroke-width="1.4"/>

  <circle cx="${width - 36}" cy="30" r="2.5" fill="#22d3ee" filter="url(#glow)"/>
  <circle cx="${width - 54}" cy="30" r="2.5" fill="#a78bfa" filter="url(#glow)"/>
  <circle cx="${width - 72}" cy="30" r="2.5" fill="#f472b6" filter="url(#glow)"/>

  <text x="30" y="46" font-family="Georgia, 'Times New Roman', serif" font-size="52" fill="url(#border)" opacity="0.55">&#8220;</text>

  <text x="70" y="52" font-family="'JetBrains Mono', 'Fira Code', Consolas, monospace" font-size="17" font-style="italic" fill="#e6edf3">${textLines}</text>

  <text x="70" y="${height - 26}" font-family="'JetBrains Mono', 'Fira Code', Consolas, monospace" font-size="14" fill="#a78bfa">&#8212; ${escapeXml(author)}</text>
</svg>`;
}

async function main() {
  const { quote, author } = await fetchQuote();
  const svg = buildSvg(quote, author);

  const outDir = path.join(__dirname, "..", "assets");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "quote.svg"), svg);
  console.log(`Wrote quote: "${quote}" — ${author}`);
}

main().catch((err) => {
  console.error("Failed to generate quote card:", err.message);
  process.exit(1);
});
