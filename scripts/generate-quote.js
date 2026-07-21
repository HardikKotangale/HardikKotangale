// Generates assets/quote.svg — a custom, self-hosted "quote of the day" card
// styled to match the dark / glassmorphism aesthetic of hardikotangale.com.
// Picks deterministically by day-of-year so it stays stable for 24h, then
// rotates on the next scheduled run (see .github/workflows/quote.yml).

const fs = require("fs");
const path = require("path");

const QUOTES = [
  ["Simplicity is prerequisite for reliability.", "Edsger W. Dijkstra"],
  ["Premature optimization is the root of all evil.", "Donald Knuth"],
  ["Programs must be written for people to read, and only incidentally for machines to execute.", "Harold Abelson"],
  ["The best way to predict the future is to invent it.", "Alan Kay"],
  ["Make it work, make it right, make it fast.", "Kent Beck"],
  ["Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", "Martin Fowler"],
  ["There are two ways to write error-free programs; only the third one works.", "Alan J. Perlis"],
  ["The most disastrous thing that you can ever learn is your first programming language.", "Alan Kay"],
  ["Controlling complexity is the essence of computer programming.", "Brian Kernighan"],
  ["Debugging is twice as hard as writing the code in the first place.", "Brian Kernighan"],
  ["First, solve the problem. Then, write the code.", "John Johnson"],
  ["Talk is cheap. Show me the code.", "Linus Torvalds"],
  ["Good code is its own best documentation.", "Steve McConnell"],
  ["It's not a bug, it's an undocumented feature.", "Anonymous"],
  ["Deleted code is debugged code.", "Jeff Sickel"],
  ["Fix the cause, not the symptom.", "Steve Maguire"],
  ["The only way to go fast is to go well.", "Robert C. Martin"],
  ["Code never lies, comments sometimes do.", "Ron Jeffries"],
  ["Testing shows the presence, not the absence of bugs.", "Edsger W. Dijkstra"],
  ["Simplicity is the soul of efficiency.", "Austin Freeman"],
  ["Given enough eyeballs, all bugs are shallow.", "Linus Torvalds"],
  ["The function of good software is to make the complex appear simple.", "Grady Booch"],
  ["Walking on water and developing software from a specification are easy if both are frozen.", "Edward V. Berard"],
  ["Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.", "Antoine de Saint-Exupery"],
  ["Measuring programming progress by lines of code is like measuring aircraft building progress by weight.", "Bill Gates"],
  ["Software is a great combination of artistry and engineering.", "Bill Gates"],
  ["A ship in port is safe, but that's not what ships are built for.", "Grace Hopper"],
  ["One of the best programming skills you can have is knowing when to walk away for a bit.", "Oyinda Wongi"],
  ["Learning never exhausts the mind.", "Leonardo da Vinci"],
  ["Move fast with stable infrastructure.", "Mark Zuckerberg"],
];

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / 86400000);
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
  const lines = wrapText(quote, 78);
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

function main() {
  const index = dayOfYear(new Date()) % QUOTES.length;
  const [quote, author] = QUOTES[index];
  const svg = buildSvg(quote, author);

  const outDir = path.join(__dirname, "..", "assets");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "quote.svg"), svg);
  console.log(`Wrote quote #${index}: "${quote}" — ${author}`);
}

main();
