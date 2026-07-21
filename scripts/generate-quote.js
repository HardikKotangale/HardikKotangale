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

function buildSvg(quote, author, mode) {
  const width = 800;
  const lineHeight = 20;
  const lines = wrapText(quote, 92);
  const textColor = mode === "light" ? "#1f2328" : "#e6edf3";

  const firstLineY = 26;
  const lastLineY = firstLineY + (lines.length - 1) * lineHeight;
  const authorY = lastLineY + 30;
  const height = authorY + 16;

  const textLines = lines
    .map(
      (line, i) =>
        `<tspan x="38" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
    )
    .join("");

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="${width}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#22d3ee"/>
      <stop offset="0.5" stop-color="#a78bfa"/>
      <stop offset="1" stop-color="#f472b6"/>
    </linearGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#22d3ee"/>
      <stop offset="1" stop-color="#a78bfa"/>
    </linearGradient>
  </defs>

  <text x="0" y="${firstLineY + 4}" font-family="Georgia, 'Times New Roman', serif" font-size="32" fill="url(#mark)" opacity="0.7">&#8220;</text>

  <text x="38" y="${firstLineY}" font-family="'JetBrains Mono', 'Fira Code', Consolas, monospace" font-size="14" font-style="italic" fill="${textColor}">${textLines}</text>

  <text x="38" y="${authorY}" font-family="'JetBrains Mono', 'Fira Code', Consolas, monospace" font-size="14" fill="url(#accent)">&#8212; ${escapeXml(author)}</text>
</svg>`;
}

async function main() {
  const { quote, author } = await fetchQuote();

  const outDir = path.join(__dirname, "..", "assets");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "quote.svg"), buildSvg(quote, author, "dark"));
  fs.writeFileSync(path.join(outDir, "quote-light.svg"), buildSvg(quote, author, "light"));
  console.log(`Wrote quote: "${quote}" — ${author}`);
}

main().catch((err) => {
  console.error("Failed to generate quote card:", err.message);
  process.exit(1);
});
