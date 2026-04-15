/* ═══════════════════════════════════════
   data.js — Openings data & localStorage
   ChessOpener · Meryem Benfarah
═══════════════════════════════════════ */

const OPENINGS = [
  {
    id: "sicilian", name: "Sicilian Defense", eco: "B20–B99", color: "Black",
    fm: ["e4","c5","Nf3","d6","d4","cxd4","Nxd4","Nf6","Nc3"],
    yt: "qM4e7g2RukI", ytTitle: "Sicilian Defense | 10-Minute Chess Openings",
    desc: "The most popular response to 1.e4. Black fights for the center from the flank, creating sharp asymmetrical battles.",
    ideas: ["Control d4 without allowing e5","Queenside counterplay with b5 and a5","Sharp middlegame tactics on both wings","Sub-variations: Najdorf, Dragon, Scheveningen"],
    alts: ["Najdorf (5…a6)","Dragon (5…g6)","Classical (5…Nc6)"]
  },
  {
    id: "french", name: "French Defense", eco: "C00–C19", color: "Black",
    fm: ["e4","e6","d4","d5","Nc3","Nf6","Bg5"],
    yt: "V3OhmZUfC-0", ytTitle: "French Defense | 10-Minute Chess Openings",
    desc: "Solid pawn chain e6–d5. Black concedes space but builds a resilient structure and counterattacks the queenside.",
    ideas: ["Establish pawn chain e6–d5","Counterattack d4 with …c5","Activate the light-squared bishop","Queenside counterplay"],
    alts: ["Winawer (3…Bb4)","Classical (3…Nf6)","Tarrasch (3…c5)"]
  },
  {
    id: "italian", name: "Italian Game", eco: "C50–C59", color: "White",
    fm: ["e4","e5","Nf3","Nc6","Bc4","Bc5","c3","Nf6","d4"],
    yt: "fEAOp3XO_4A", ytTitle: "Italian Game | Chess Openings",
    desc: "One of the oldest openings. White aims the bishop at f7 and builds a strong center with c3 and d4.",
    ideas: ["Aim bishop at the weak f7 pawn","Build center with c3 and d4","Control the e5 square","Giuoco Piano: solid and positional"],
    alts: ["Evans Gambit (4.b4)","Two Knights (4…Nf6)","Giuoco Pianissimo (d3)"]
  },
  {
    id: "ruy-lopez", name: "Ruy López", eco: "C60–C99", color: "White",
    fm: ["e4","e5","Nf3","Nc6","Bb5","a6","Ba4","Nf6","O-O"],
    yt: "_Bs7UtQR58Y", ytTitle: "Chess Openings: Ruy Lopez",
    desc: "The 'Spanish Torture' — pressures Black's e5 pawn indirectly via the pin on Nc6. One of the deepest openings in theory.",
    ideas: ["Pressure e5 via the pin on Nc6","Play d4 to contest the center","Open lines for rooks","Long strategic battles reward patience"],
    alts: ["Marshall Attack (…d5)","Breyer (…Nb8)","Chigorin (…Na5)"]
  },
  {
    id: "queens-gambit", name: "Queen's Gambit", eco: "D06–D69", color: "White",
    fm: ["d4","d5","c4","e6","Nc3","Nf6","Bg5","Be7","e3"],
    yt: "YPGMnZyQEn8", ytTitle: "How To Play The Queen's Gambit",
    desc: "Offers a pawn to gain central control. If accepted White recaptures and dominates; if declined, positional battles ensue.",
    ideas: ["Control center with d4 and c4","Develop pieces to active squares","Open the c-file for queenside pressure","Target the isolated d-pawn"],
    alts: ["QGA (2…dxc4)","QGD (2…e6)","Slav (2…c6)","Tarrasch (2…c5)"]
  },
  {
    id: "kings-indian", name: "King's Indian Defense", eco: "E60–E99", color: "Black",
    fm: ["d4","Nf6","c4","g6","Nc3","Bg7","e4","d6","Nf3","O-O"],
    yt: "J3fOI5QFmVs", ytTitle: "King's Indian Defense | Chess Openings",
    desc: "Hyper-modern — Black lets White build a large center, then attacks it. The fianchettoed g7 bishop becomes devastating.",
    ideas: ["Let White build center, then counterattack with …e5 or …c5","g7 bishop is a long-term weapon","Kingside attack with …f5–f4","Sharp imbalanced positions"],
    alts: ["Classical (6.Be2)","Sämisch (5.f3)","Four Pawns Attack (5.f4)"]
  },
  {
    id: "caro-kann", name: "Caro-Kann Defense", eco: "B10–B19", color: "Black",
    fm: ["e4","c6","d4","d5","Nc3","dxe4","Nxe4","Bf5"],
    yt: "hzlLGr9MVBY", ytTitle: "Caro-Kann Defense | 10-Minute Chess Openings",
    desc: "Solid response to 1.e4 — supports the d5 push with c6, avoiding the doubled pawns of the French Defense.",
    ideas: ["Support …d5 with …c6 for solid structure","Develop the light bishop before closing it in","Less committal than the French","Good endgame pawn structure"],
    alts: ["Classical (4…Bf5)","Advance (3.e5)","Exchange (3.exd5)"]
  },
  {
    id: "london", name: "London System", eco: "D02", color: "White",
    fm: ["d4","d5","Bf4","Nf6","e3","e6","Nf3","c5","c3"],
    yt: "Y3C5hOcKS80", ytTitle: "Learn the London System",
    desc: "A solid system-based opening. Easy to learn, hard to refute, leads to comfortable middlegames at all levels.",
    ideas: ["Develop bishop to f4 before closing it with e3","Build solid structure: e3, c3, Nf3","No long theory lines to memorize","Trade off the light-squared bishop"],
    alts: ["Colle System","Torre Attack","Barry Attack"]
  }
];

/* ── localStorage progress helpers ── */
const PROGRESS_KEY = "chessopener_v4";

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; }
  catch { return {}; }
}

function saveProgress(data) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

function recordMove(openingId, correct) {
  const p = loadProgress();
  if (!p[openingId]) p[openingId] = { a: 0, c: 0 };
  p[openingId].a++;
  if (correct) p[openingId].c++;
  saveProgress(p);
}
