const fs = require('fs');
const fzstd = require('fzstd');
const { Chess } = require('chess.js');

// 1. Decompress prefix
const comp = new Uint8Array(fs.readFileSync(__dirname + '/puzzle_head.zst'));
let out = [];
try {
  const d = new fzstd.Decompress((chunk) => out.push(Buffer.from(chunk)));
  d.push(comp, false);
} catch (e) { /* truncated tail expected */ }
const text = Buffer.concat(out).toString('utf8');
const lines = text.split('\n');
lines.shift(); // header

// 2. Parse + validate
function parseLine(line) {
  // CSV simple: fields have no commas except Themes/Opening (space separated) -> safe split
  const p = line.split(',');
  if (p.length < 8) return null;
  const [id, fen, moves, rating] = p;
  const themes = (p[7] || '').trim().split(/\s+/).filter(Boolean);
  const mv = moves.trim().split(/\s+/).filter(Boolean);
  return { id, fen, moves: mv, rating: parseInt(rating, 10), themes };
}

function validate(pz) {
  // player solving moves = mv excluding first (opponent). want 1..3 player moves => total 2,4,6
  const total = pz.moves.length;
  if (total < 2 || total > 6) return false;
  let chess;
  try { chess = new Chess(pz.fen); } catch (e) { return false; }
  if (chess.fen() !== pz.fen) { /* chess.js may normalize; still ok */ }
  for (const uci of pz.moves) {
    const m = { from: uci.slice(0, 2), to: uci.slice(2, 4) };
    if (uci.length === 5) m.promotion = uci[4];
    const res = chess.move(m);
    if (!res) return false;
  }
  return true;
}

const buckets = { easy: [], medium: [], hard: [] };
const limits = { easy: 150, medium: 100, hard: 50 };
const seenId = new Set();
const themeCount = {}; // for variety throttling per bucket

function bucketOf(r) {
  if (r < 1200) return 'easy';
  if (r <= 1700) return 'medium';
  return 'hard';
}

// shuffle deterministically for variety but stable
for (const line of lines) {
  if (!line) continue;
  const pz = parseLine(line);
  if (!pz || !pz.rating || seenId.has(pz.id)) continue;
  const b = bucketOf(pz.rating);
  if (buckets[b].length >= limits[b]) continue;
  // skip very long opening tags / require some theme
  if (!pz.themes.length) continue;
  if (!validate(pz)) continue;
  // variety: limit dominance of a single primary theme per bucket
  const primary = pz.themes.find(t => !['short','long','oneMove','middlegame','endgame','opening','crushing','advantage','equality','master','masterVsMaster','superGM'].includes(t)) || pz.themes[0];
  const key = b + ':' + primary;
  themeCount[key] = (themeCount[key] || 0) || 0;
  const cap = Math.ceil(limits[b] * 0.22); // no theme > ~22% of a bucket
  if (themeCount[key] >= cap) continue;
  themeCount[key]++;
  seenId.add(pz.id);
  buckets[b].push({ id: pz.id, fen: pz.fen, moves: pz.moves, rating: pz.rating, themes: pz.themes });
  if (buckets.easy.length >= limits.easy && buckets.medium.length >= limits.medium && buckets.hard.length >= limits.hard) break;
}

// Report
for (const b of ['easy', 'medium', 'hard']) {
  console.log(b, buckets[b].length, '/', limits[b], '  ratings', buckets[b].length ? (Math.min(...buckets[b].map(x=>x.rating))+'-'+Math.max(...buckets[b].map(x=>x.rating))) : '-');
}

if (buckets.easy.length < limits.easy || buckets.medium.length < limits.medium || buckets.hard.length < limits.hard) {
  console.error('WARN: a bucket is short — relax theme cap or download more data');
}

const header = '// Auto-generated from Lichess open puzzle DB (CC0). Do not edit by hand.\n';
const body = 'window.PUZZLES = ' + JSON.stringify(buckets) + ';\n';
fs.writeFileSync(__dirname + '/../puzzles.js', header + body);
console.log('Wrote puzzles.js  total', buckets.easy.length + buckets.medium.length + buckets.hard.length);
