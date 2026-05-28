const { useState, useEffect, useRef, useMemo } = React;

// ─── DATA ────────────────────────────────────────────────────────────────────

const TILES = {
  bams: Array.from({length: 9}, (_, i) => ({
    id: `bam${i+1}`, suit: 'bam', face: String(i+1), label: 'Bam',
    name: `${i+1} Bam`, called: `"${i+1} Bam"`,
    note: 'Bams are the "bamboo" suit. Tiles 2–9 traditionally show bamboo sticks; the 1 Bam is a bird.',
    count: 4,
  })),
  dots: Array.from({length: 9}, (_, i) => ({
    id: `dot${i+1}`, suit: 'dot', face: String(i+1), label: 'Dot',
    name: `${i+1} Dot`, called: `"${i+1} Dot"`,
    note: 'Dots (or "circles") are clusters of round coins.',
    count: 4,
  })),
  craks: Array.from({length: 9}, (_, i) => ({
    id: `crak${i+1}`, suit: 'crak', face: String(i+1), label: 'Crak',
    name: `${i+1} Crak`, called: `"${i+1} Crak"`,
    note: 'Craks (Characters) show a Chinese numeral above the symbol "万" (ten thousand).',
    count: 4,
  })),
  winds: [
    { id: 'N', suit: 'wind', face: 'N', label: 'North', name: 'North Wind', called: '"North"', note: 'One of the four wind tiles — N, E, S, W.', count: 4 },
    { id: 'E', suit: 'wind', face: 'E', label: 'East',  name: 'East Wind',  called: '"East"',  note: "East is the dealer's wind and the starting seat.", count: 4 },
    { id: 'S', suit: 'wind', face: 'S', label: 'South', name: 'South Wind', called: '"South"', note: 'One of the four wind tiles — N, E, S, W.', count: 4 },
    { id: 'W', suit: 'wind', face: 'W', label: 'West',  name: 'West Wind',  called: '"West"',  note: 'One of the four wind tiles — N, E, S, W.', count: 4 },
  ],
  dragons: [
    { id: 'DR', suit: 'dragR', face: 'R', label: 'Drag', name: 'Red Dragon',   called: '"Red"',   note: 'Pairs with Craks in the NMJL card. Often shown as "中".', count: 4 },
    { id: 'DG', suit: 'dragG', face: 'G', label: 'Drag', name: 'Green Dragon', called: '"Green"', note: 'Pairs with Bams in the NMJL card. Often shown as "發".', count: 4 },
    { id: 'DW', suit: 'dragW', face: '0', label: 'Soap', name: 'White Dragon', called: '"Soap"',  note: 'Pairs with Dots in the NMJL card. Called "soap" — looks like a blank tile or shows "0".', count: 4 },
  ],
  flowers: [
    { id: 'F', suit: 'flower', face: '✿', label: 'Flwr', name: 'Flower', called: '"Flower"', note: 'All 8 flowers are interchangeable in American Mah Jongg. Used in many hands as a group.', count: 8 },
  ],
  jokers: [
    { id: 'J', suit: 'joker', face: '★', label: 'Joker', name: 'Joker', called: '"Joker"', note: 'A wild card — but ONLY for groups of 3 or more matching tiles (pungs, kongs, etc). Never for pairs or singles.', count: 8 },
  ],
};

const ALL_TILES = [
  ...TILES.bams, ...TILES.dots, ...TILES.craks,
  ...TILES.winds, ...TILES.dragons, ...TILES.flowers, ...TILES.jokers,
];

const CHARLESTON_STEPS = [
  { name: 'Right',    pass: 'right',  required: true,  caption: 'Pass 3 tiles right.' },
  { name: 'Across',   pass: 'across', required: true,  caption: 'Pass 3 tiles across.' },
  { name: 'Left',     pass: 'left',   required: true,  caption: 'Pass 3 tiles left.' },
  { name: 'Courtesy', pass: 'stop',   required: false, caption: 'STOP — table decides whether to continue.' },
  { name: 'Left',     pass: 'left',   required: false, caption: 'Second Charleston: left.' },
  { name: 'Across',   pass: 'across', required: false, caption: 'Second Charleston: across.' },
  { name: 'Right',    pass: 'right',  required: false, caption: 'Second Charleston: right.' },
];

const TURN_STEPS = [
  { title: 'Previous player discards.', body: 'The player to your right just discarded a tile face-up in the middle, calling out its name — say, "3 Bam."', action: 'discard', tile: { id: 'bam3', suit: 'bam', face: '3', label: 'Bam' } },
  { title: 'You have a choice — call or wait.', body: "If that tile completes a group you're collecting (a pair, pung, etc.), you can CALL it. Otherwise, wait for your turn.", action: 'call?' },
  { title: 'No call — you draw.', body: 'On your turn you pick the next tile from the wall (the row of face-down tiles). You now have 14 tiles, one more than you need.', action: 'draw' },
  { title: 'Look at your hand.', body: "Compare what you drew with the hand you're building toward on the NMJL card. Decide what to keep and what to discard.", action: 'think' },
  { title: 'Discard one tile, face-up.', body: "Place the tile in the middle of the table, face-up, and clearly name it aloud. You're back to 13 tiles. Play passes to your left.", action: 'discard', tile: { id: 'dot5', suit: 'dot', face: '5', label: 'Dot' } },
  { title: "That's a turn.", body: 'Every turn is the same loop: someone discards → optional call → draw → discard. Repeat until someone declares "Mah Jongg!"', action: 'done' },
];

const CARD_LINE = {
  category: '2025 — Like Numbers',
  number: 'Line 3',
  groups: [
    { type: 'kong', label: 'FFFF',  color: 'red',  explain: 'Kong of Flowers — any 4 Flower tiles. All Flowers are interchangeable.' },
    { type: 'pung', label: '222',   color: 'bam',  explain: 'Pung of 2 Bams — three identical 2 Bam tiles.' },
    { type: 'pung', label: '222',   color: 'dot',  explain: 'Pung of 2 Dots — three identical 2 Dot tiles, in a DIFFERENT suit from the bams.' },
    { type: 'kong', label: '2222',  color: 'crak', explain: 'Kong of 2 Craks — four identical 2 Crak tiles, in the THIRD suit.' },
  ],
  notes: 'The "Like Numbers" section means every numbered group uses the SAME number (here, all 2s). The suits must all be DIFFERENT — bams, dots, and craks. You can use jokers in the pungs and kong (groups of 3+) but never for flowers.',
  exposed: '25¢',
  concealed: '50¢',
};

const QUIZ = [
  { q: 'How many tiles does each player hold during play?', a: '13 tiles', detail: 'You draw a 14th tile on your turn, then discard one — back to 13.' },
  { q: 'How many players make a standard game?', a: 'Four', detail: 'Three is also playable, with one extra discard pile (the "Charleston" changes).' },
  { q: 'What is a "Pung"?', a: 'Three of the same tile', detail: 'E.g. three 5 Dots. Jokers may substitute.' },
  { q: 'What is a "Kong"?', a: 'Four of the same tile', detail: 'E.g. four East winds. Jokers may substitute.' },
  { q: 'What is a "Quint"?', a: 'Five of the same tile', detail: 'Only possible in American Mah Jongg, using jokers for the extras.' },
  { q: 'Can a Joker stand in for a single tile or a pair?', a: 'No — never', detail: 'Jokers ONLY work in groups of 3 or more matching tiles.' },
  { q: 'What does the White Dragon look like?', a: 'A blank tile or "0" — called "Soap"', detail: 'It pairs with Dots in the card.' },
  { q: 'How many Flower tiles are in the set?', a: 'Eight', detail: "All 8 are interchangeable — they're treated as identical." },
  { q: 'Who passes first in the Charleston?', a: 'Everyone, simultaneously — 3 tiles to the right', detail: 'Then across, then left.' },
  { q: 'What tile is colloquially called "Soap"?', a: 'The White Dragon', detail: 'Looks blank — or shows a "0" — because the original tiles depicted a stack of soap.' },
  { q: 'How do you win?', a: 'Match an exact hand on the current NMJL card', detail: 'You must declare "Mah Jongg" — and your tiles must match a single line exactly.' },
];

const GLOSSARY = [
  { term: 'Bettor',     def: 'A fifth player who sits out a hand and bets on who will win.' },
  { term: 'Charleston', def: 'The opening tile-passing ritual: right, across, left — and then maybe again.' },
  { term: 'Discard',    def: 'A tile thrown face-up in the middle of the table.' },
  { term: 'East',       def: 'The dealer; the player who starts each game.' },
  { term: 'Exposed',    def: 'A group of tiles shown face-up on your rack after a call.' },
  { term: 'Joker',      def: 'Wild tile — usable only in groups of 3+ matching tiles.' },
  { term: 'Kong',       def: 'A group of 4 matching tiles.' },
  { term: 'Pair',       def: 'Two identical tiles. Jokers NOT allowed.' },
  { term: 'Pung',       def: 'A group of 3 matching tiles.' },
  { term: 'Quint',      def: 'A group of 5 matching tiles (needs jokers).' },
  { term: 'Rack',       def: 'The tile holder in front of you. Has a public top edge and a hidden inside edge.' },
  { term: 'Soap',       def: 'Slang for the White Dragon.' },
  { term: 'Wall',       def: 'The face-down row of tiles you draw from.' },
];

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function suitName(s) {
  return ({ bam: 'Bams (Bamboo)', dot: 'Dots (Circles)', crak: 'Craks (Characters)', wind: 'Winds', dragR: 'Red Dragon', dragG: 'Green Dragon', dragW: 'White Dragon', flower: 'Flowers', joker: 'Jokers' })[s] || s;
}

function Tile({ tile, size, selected, dim, onClick, faceDown, ariaLabel }) {
  if (faceDown) return <div className={`tile face-down ${size || ''}`} aria-hidden="true" />;
  if (!tile) return null;
  const cls = `tile ${size || ''} ${selected ? 'selected' : ''} ${dim ? 'dim' : ''}`.trim();
  return (
    <div className={cls} data-suit={tile.suit} onClick={onClick}
      role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel || tile.name || tile.id}>
      <div className="num">{tile.face}</div>
      {tile.label ? <div className="label">{tile.label}</div> : null}
    </div>
  );
}

function Eyebrow({ children, noRule }) {
  return <div className={`eyebrow ${noRule ? 'no-rule' : ''}`}>{children}</div>;
}

function Callout({ tag, children }) {
  return (
    <div className="callout">
      {tag ? <span className="tag">{tag}</span> : null}
      {typeof children === 'string' ? <p>{children}</p> : children}
    </div>
  );
}

function Divider({ deco, children }) {
  if (deco) return <div className="divider deco">{children || '✦'}</div>;
  return <hr className="divider" />;
}

function TileSheet({ tile, onClose }) {
  useEffect(() => {
    function onEsc(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);
  if (!tile) return null;
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        <div className="sheet-tile-row">
          <Tile tile={tile} size="lg" />
          <div className="meta">
            <div className="name">{tile.name}</div>
            <div className="called">called {tile.called}</div>
            <p>{tile.note}</p>
          </div>
        </div>
        <div className="sheet-meta-row">
          <div><span>In the set</span><span className="v">{tile.count} tile{tile.count > 1 ? 's' : ''}</span></div>
          <div><span>Suit</span><span className="v">{suitName(tile.suit)}</span></div>
        </div>
      </div>
    </div>
  );
}

function TabIcon({ name }) {
  const s = 'currentColor';
  if (name === 'learn') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h7v14H4z" /><path d="M13 5h7v14h-7z" /><path d="M7 9h1M7 12h1M7 15h1" />
    </svg>
  );
  if (name === 'practice') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="7" height="12" rx="1.5" /><rect x="14" y="6" width="7" height="12" rx="1.5" />
      <path d="M6.5 9v6M17.5 9v6" />
    </svg>
  );
  if (name === 'cheat') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h11l3 3v13H5z" /><path d="M8 9h8M8 12h8M8 15h5" />
    </svg>
  );
  if (name === 'home') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-5h4v5" />
    </svg>
  );
  return null;
}

// ─── SCREENS ─────────────────────────────────────────────────────────────────

function Overview({ goLearn, goPractice }) {
  return (
    <div>
      <div className="hero">
        <Eyebrow>National Mah Jongg League · Est. 1937</Eyebrow>
        <h1 className="title"><span className="hand">American</span><br />Mah Jongg.</h1>
        <p className="lede">A complete, plain-English guide to the tiles, the Charleston, the card, and the loop of a turn — so you can sit down on Monday and play.</p>
        <div className="hero-tiles">
          <Tile tile={TILES.bams[2]} />
          <Tile tile={TILES.dots[4]} />
          <Tile tile={TILES.craks[6]} />
          <Tile tile={TILES.dragons[0]} />
          <Tile tile={TILES.jokers[0]} />
        </div>
      </div>

      <Divider deco>✦</Divider>

      <Eyebrow>01 — The Game in 30 Seconds</Eyebrow>
      <h2 className="section-title">What you're trying to do.</h2>
      <p>Four players take turns drawing a tile and discarding a tile. You're racing to be the first to collect a hand that matches one of the recipes on this year's <strong>NMJL card</strong>. When your tiles match a card line exactly, you say <em>"Mah Jongg!"</em> and you win the round.</p>

      <ul className="clean">
        <li><span className="num">01</span><div className="body"><strong>You have 13 tiles.</strong><p>Held behind a rack so only you can see them. On your turn you'll briefly hold 14, then discard one.</p></div></li>
        <li><span className="num">02</span><div className="body"><strong>The card tells you what to build.</strong><p>Every year the National Mah Jongg League prints a new card. Each line is one possible winning hand.</p></div></li>
        <li><span className="num">03</span><div className="body"><strong>Draw, decide, discard.</strong><p>That's the whole loop. Calling another player's discard speeds it up.</p></div></li>
        <li><span className="num">04</span><div className="body"><strong>First to match a card line wins.</strong><p>Declare "Mah Jongg," reveal your tiles, collect the payout.</p></div></li>
      </ul>

      <Callout tag="One thing to know">
        American Mah Jongg has its own rules — jokers, the Charleston, the annual card. If you've played the Chinese, Japanese, or app versions, expect surprises.
      </Callout>

      <Divider deco>✦</Divider>

      <Eyebrow>Where to next</Eyebrow>
      <h2 className="section-title">Pick a starting point.</h2>
      <div className="cheat-grid" style={{ marginBottom: 16 }}>
        <button className="cheat-card" onClick={() => goLearn('tiles')} style={{ textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit' }}>
          <span className="num">A</span><h5>Meet the tiles</h5><p>Tap any tile to learn what it is and how it's called.</p>
        </button>
        <button className="cheat-card" onClick={() => goLearn('charleston')} style={{ textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit' }}>
          <span className="num">B</span><h5>The Charleston</h5><p>The opening tile-passing ritual — animated.</p>
        </button>
        <button className="cheat-card" onClick={() => goLearn('turn')} style={{ textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit' }}>
          <span className="num">C</span><h5>Walk a turn</h5><p>Click through one full turn, step by step.</p>
        </button>
        <button className="cheat-card" onClick={() => goPractice()} style={{ textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit' }}>
          <span className="num">D</span><h5>Practice</h5><p>Flashcards and a tile-by-tile hand builder.</p>
        </button>
      </div>
    </div>
  );
}

function TilesScreen() {
  const [active, setActive] = useState(null);

  function Block({ title, count, kind, tiles }) {
    return (
      <div className="suit-block">
        <div className="suit-head"><h3>{title}</h3><div className="meta">{count}</div></div>
        <p style={{ fontSize: 14, marginTop: -4 }}>{kind}</p>
        <div className="tiles-grid">
          {tiles.map((t) => <Tile key={t.id} tile={t} onClick={() => setActive(t)} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Eyebrow>02 — The Tiles</Eyebrow>
      <h2 className="section-title">A standard set has 152 tiles.</h2>
      <p>Three numbered suits, four winds, three dragons, eight flowers, eight jokers. Tap any tile below to hear what it's called and how it's used.</p>
      <Callout tag="Try me">Every tile on this page is tappable. Don't memorize — just poke around.</Callout>
      <Divider />
      <Block title="Bams"    count="9 faces × 4 = 36" kind="The bamboo suit. 2–9 show stacks of bamboo; the 1 Bam is a bird." tiles={TILES.bams} />
      <Block title="Dots"    count="9 faces × 4 = 36" kind="The circles suit. Round coins, arranged by count." tiles={TILES.dots} />
      <Block title="Craks"   count="9 faces × 4 = 36" kind="The characters suit. A Chinese numeral above the symbol 万." tiles={TILES.craks} />
      <Block title="Winds"   count="4 faces × 4 = 16" kind="N, E, S, W. East is the dealer's seat and starts the game." tiles={TILES.winds} />
      <Block title="Dragons" count="3 × 4 = 12"       kind="Red pairs with Craks, Green pairs with Bams, White ('Soap') pairs with Dots." tiles={TILES.dragons} />
      <Block title="Flowers" count="8 total"           kind="All 8 are interchangeable — treated as identical. Cannot be substituted by jokers." tiles={Array.from({length: 8}, (_, i) => ({ ...TILES.flowers[0], id: `F${i}` }))} />
      <Block title="Jokers"  count="8 total"           kind="Wild — but only for groups of 3 or more. Never for pairs or singles." tiles={Array.from({length: 8}, (_, i) => ({ ...TILES.jokers[0], id: `J${i}` }))} />
      <Callout tag="Pro tip">Don't worry about memorizing the bamboo/coin artwork. The number and suit label on the tile are what matter.</Callout>
      {active ? <TileSheet tile={active} onClose={() => setActive(null)} /> : null}
    </div>
  );
}

function CharlestonScreen() {
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const cur = CHARLESTON_STEPS[step];
  const last = step === CHARLESTON_STEPS.length - 1;

  function advance() {
    setAnimating(true);
    setTimeout(() => { setAnimating(false); setStep((s) => (s + 1) % CHARLESTON_STEPS.length); }, 700);
  }

  function ArrowSvg({ pass }) {
    if (pass === 'stop') return (
      <div className="step-label">STOP<span className="meta">Courtesy — table votes</span></div>
    );
    const ax = (x1, y1, x2, y2, key) => (
      <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} markerEnd="url(#mh)" style={{ stroke: 'var(--cherry)', strokeWidth: 3, strokeLinecap: 'round' }} />
    );
    const arrows = [];
    if (pass === 'right') { arrows.push(ax(60,18,88,50,'a1'),ax(88,60,60,88,'a2'),ax(50,88,18,60,'a3'),ax(18,50,50,18,'a4')); }
    else if (pass === 'left') { arrows.push(ax(50,18,18,50,'a1'),ax(18,60,50,88,'a2'),ax(60,88,88,60,'a3'),ax(88,50,60,18,'a4')); }
    else if (pass === 'across') { arrows.push(ax(53,22,53,80,'a1'),ax(50,80,50,22,'a2'),ax(22,47,80,47,'a3'),ax(80,50,22,50,'a4')); }
    return (
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs><marker id="mh" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" fill="var(--cherry)" /></marker></defs>
        {arrows}
      </svg>
    );
  }

  const passingTiles = [TILES.bams[0], TILES.dots[7], TILES.craks[3]];

  return (
    <div>
      <Eyebrow>03 — Setup & The Charleston</Eyebrow>
      <h2 className="section-title">The opening pass.</h2>
      <p>Before the first turn, players trade tiles in a strict three-round ritual called the <strong>Charleston</strong>. It's how you turn a random starting hand into something you can actually build with.</p>

      <h3 className="sub-title">Before the Charleston</h3>
      <ul className="clean">
        <li><span className="num">a</span><div className="body"><strong>Build the wall.</strong><p>Each player makes a row of 19 tiles, 2 deep, in front of their rack. The four rows together are "the wall."</p></div></li>
        <li><span className="num">b</span><div className="body"><strong>Roll and deal.</strong><p>East rolls dice to determine where to break the wall. Players take 13 tiles each (East takes 14).</p></div></li>
        <li><span className="num">c</span><div className="body"><strong>Look at your card.</strong><p>Pick a target line — or two — that looks compatible with what you were dealt.</p></div></li>
      </ul>

      <Divider deco>✦</Divider>

      <h3 className="sub-title">The three-step pass</h3>
      <p>Tap <strong>Next pass</strong> to walk through the Charleston. Everyone passes <strong>at the same time</strong>, three tiles at a time, then picks up the three coming the other way.</p>

      <div className="cville">
        <div className="felt" />
        <div className="seat n">North<span className="you">Sandy →</span></div>
        <div className="seat e">East<span className="you">Deb</span></div>
        <div className="seat s">South<span className="you">You</span></div>
        <div className="seat w">West<span className="you">Jen</span></div>
        <ArrowSvg pass={cur.pass} />
        {animating && cur.pass !== 'stop' ? (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', display: 'flex', gap: 2, zIndex: 2 }}>
            {passingTiles.map((t, i) => <Tile key={i} tile={t} size="xs" />)}
          </div>
        ) : null}
      </div>

      <div className="step-dots">
        {CHARLESTON_STEPS.map((s, i) => (
          <button key={i} className={`dot ${i === step ? 'active' : i < step ? 'done' : ''}`} aria-label={`Step ${i + 1}`} onClick={() => setStep(i)} />
        ))}
      </div>

      <div className="sim-step" style={{ marginBottom: 10 }}>
        <span className="num">{String(step + 1).padStart(2, '0')}</span>
        <h5>{cur.required ? 'Required' : 'Optional'} · Pass {cur.name}</h5>
        <p>{cur.caption}</p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn ghost" onClick={() => setStep(0)} disabled={step === 0}>Reset</button>
        <button className="btn primary" onClick={advance} style={{ flex: 1 }}>{last ? 'Done — back to start' : 'Next pass →'}</button>
      </div>

      <Divider deco>✦</Divider>

      <Callout tag="Heads up">
        Jokers cannot be passed in the Charleston. Also: you can pass tiles you just received, but never tiles you received from the same player on the immediately preceding pass.
      </Callout>

      <h3 className="sub-title">What to pass</h3>
      <p>Pass tiles you don't want — usually singletons in suits you've decided not to pursue, or extras that don't fit your target line.</p>

      <div className="do-dont">
        <div className="col do">
          <h5>Do pass</h5>
          <ul>
            <li>Singletons in suits you're abandoning</li>
            <li>Numbers far from your card line</li>
            <li>Winds you don't need</li>
            <li>Duplicates above what your hand requires</li>
          </ul>
        </div>
        <div className="col dont">
          <h5>Don't pass</h5>
          <ul>
            <li>Flowers (you almost always want them)</li>
            <li>Jokers (you can't — rules!)</li>
            <li>Pairs you might extend to pungs</li>
            <li>Tiles in the middle of useful runs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function TurnScreen() {
  const [step, setStep] = useState(0);
  const [hand] = useState([
    TILES.bams[1], TILES.bams[1], TILES.bams[4],
    TILES.dots[2], TILES.dots[4], TILES.dots[7],
    TILES.craks[0], TILES.craks[5], TILES.craks[8],
    TILES.dragons[0], TILES.dragons[0],
    TILES.flowers[0], TILES.flowers[0],
  ]);
  const [drewTile, setDrewTile] = useState(null);
  const [discards, setDiscards] = useState([]);
  const cur = TURN_STEPS[step];

  function next() {
    const nxt = step + 1;
    if (nxt >= TURN_STEPS.length) { setStep(0); setDrewTile(null); setDiscards([]); return; }
    const ns = TURN_STEPS[nxt];
    if (ns.action === 'draw') setDrewTile(TILES.craks[6]);
    if (ns.action === 'discard' && nxt > 1) { setDiscards((d) => [...d, ns.tile]); setDrewTile(null); }
    setStep(nxt);
  }
  function reset() { setStep(0); setDrewTile(null); setDiscards([]); }

  return (
    <div>
      <Eyebrow>04 — A Turn, Step by Step</Eyebrow>
      <h2 className="section-title">The loop you'll repeat all night.</h2>
      <p>Every turn is the same five-beat rhythm: a tile is discarded → you decide whether to call it → you draw → you decide → you discard. Walk through one below.</p>

      <div className="sim-table">
        <div className="sim-rack-label">South · Your rack</div>
        <div className="sim-rack">
          {hand.map((t, i) => <Tile key={i} tile={t} size="xs" />)}
          {drewTile ? (
            <div style={{ marginLeft: 6, borderLeft: '1px dashed rgba(251,243,226,0.3)', paddingLeft: 6 }}>
              <Tile tile={drewTile} size="xs" />
            </div>
          ) : null}
        </div>
        <div className="sim-center">
          <div>
            <div className="label">Discards</div>
            <div className="discard-pile">
              {discards.length === 0 ? (
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, opacity: 0.7, letterSpacing: '0.14em', color: 'var(--cream-deep)' }}>(empty)</span>
              ) : discards.map((t, i) => <Tile key={i} tile={t} size="xs" />)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="label">Wall</div>
            <div style={{ display: 'flex', gap: 2 }}>
              <Tile faceDown size="xs" /><Tile faceDown size="xs" /><Tile faceDown size="xs" />
            </div>
          </div>
        </div>
        <div className="sim-rack-label">North · Sandy</div>
        <div className="sim-rack">
          {[...Array(13)].map((_, i) => <Tile key={i} faceDown size="xs" />)}
        </div>
      </div>

      <div className="step-dots">
        {TURN_STEPS.map((_, i) => (
          <button key={i} className={`dot ${i === step ? 'active' : i < step ? 'done' : ''}`} aria-label={`Step ${i+1}`} onClick={() => {
            reset();
            for (let k = 0; k <= i; k++) {
              const ns = TURN_STEPS[k];
              if (ns.action === 'draw') setDrewTile(TILES.craks[6]);
              if (ns.action === 'discard' && k > 1) { setDiscards((d) => [...d, ns.tile]); setDrewTile(null); }
            }
            setStep(i);
          }} />
        ))}
      </div>

      <div className="sim-step">
        <span className="num">{String(step + 1).padStart(2, '0')}</span>
        <h5>{cur.title}</h5>
        <p>{cur.body}</p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className="btn ghost" onClick={reset} disabled={step === 0}>Reset</button>
        <button className="btn primary" onClick={next} style={{ flex: 1 }}>{step === TURN_STEPS.length - 1 ? 'Start over' : 'Next step →'}</button>
      </div>

      <Divider deco>✦</Divider>

      <h3 className="sub-title">Calling a discard</h3>
      <p>You may "call" a discard if it would complete a group you can show face-up on your rack. Calling is a shortcut — but it forces you to <strong>expose</strong> those tiles.</p>
      <Callout tag="Watch out">Once you call and expose, you're committed: you can't quietly switch to a different hand later if the discards run dry.</Callout>

      <h3 className="sub-title">The end of a turn</h3>
      <p>Your turn ends the moment you discard. You should have 13 tiles. Play moves to the player on your left (counter-clockwise). The dealer (East) starts the very first turn.</p>
    </div>
  );
}

function CardScreen() {
  const [active, setActive] = useState(null);
  return (
    <div>
      <Eyebrow>05 — The Card</Eyebrow>
      <h2 className="section-title">Reading the NMJL card.</h2>
      <p>Every year the National Mah Jongg League prints a small foldout card listing every valid winning hand for that year. It looks like a wall of symbols at first. Here's how to read one line.</p>

      <h3 className="sub-title">How a line is written</h3>
      <ul className="clean">
        <li><span className="num">①</span><div className="body"><strong>Groups, left to right.</strong><p>Each block of repeating digits/letters is one group: pair (2), pung (3), kong (4), quint (5).</p></div></li>
        <li><span className="num">②</span><div className="body"><strong>Color = suit.</strong><p>Numbers are printed in 3 colors — Bam / Dot / Crak. Same color = same suit. Different colors = different suits required.</p></div></li>
        <li><span className="num">③</span><div className="body"><strong>Letters are special tiles.</strong><p>F = Flower · D = Dragon · N E S W = Winds. They keep their own coding.</p></div></li>
        <li><span className="num">④</span><div className="body"><strong>The payout is on the right.</strong><p>Two prices: one for hands made <em>concealed</em> (no calls) and one for hands with <em>exposed</em> groups.</p></div></li>
      </ul>

      <Divider deco>✦</Divider>

      <h3 className="sub-title">Tap a group to decode it</h3>
      <div className="cardline">
        <div className="head"><span>{CARD_LINE.category}</span><span>{CARD_LINE.number}</span></div>
        <div className="hand-line">
          {CARD_LINE.groups.map((g, i) => (
            <span key={i} className={`group ${active === i ? 'active' : ''}`} onClick={() => setActive(active === i ? null : i)}>
              <span className="glyph" data-color={g.color}>{g.label}</span>
            </span>
          ))}
        </div>
        <div className="cardline-help">
          {active === null ? (
            <><div className="h">Tap any group above</div><div>Each colored block is one group of tiles. Tap to see what tiles it stands for.</div></>
          ) : (
            <><div className="h">{CARD_LINE.groups[active].type.toUpperCase()} · {CARD_LINE.groups[active].label}</div><div>{CARD_LINE.groups[active].explain}</div></>
          )}
        </div>
        <div className="footer">
          <span>Exposed {CARD_LINE.exposed}</span>
          <span className="pay">Concealed {CARD_LINE.concealed}</span>
        </div>
      </div>

      <h3 className="sub-title">The actual tiles</h3>
      <p>Here's the hand from the line above, in real tiles.</p>
      <div style={{ background: 'var(--cream-card)', border: '1px solid var(--line)', borderRadius: 4, padding: 14, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          {[0,1,2,3].map((i) => <Tile key={`f${i}`} tile={TILES.flowers[0]} size="sm" />)}
          <div style={{ width: 6 }} />
          {[0,1,2].map((i) => <Tile key={`b${i}`} tile={TILES.bams[1]} size="sm" />)}
          <div style={{ width: 6 }} />
          {[0,1,2].map((i) => <Tile key={`d${i}`} tile={TILES.dots[1]} size="sm" />)}
          <div style={{ width: 6 }} />
          {[0,1,2,3].map((i) => <Tile key={`c${i}`} tile={TILES.craks[1]} size="sm" />)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
          <span>FFFF</span><span>2B 2B 2B</span><span>2D 2D 2D</span><span>2C 2C 2C 2C</span>
        </div>
      </div>

      <Callout tag="The gotcha">{CARD_LINE.notes}</Callout>

      <h3 className="sub-title">Card sections you'll see</h3>
      <ul className="clean">
        <li><span className="num">·</span><div className="body"><strong>Like Numbers</strong><p>Every group uses the same number.</p></div></li>
        <li><span className="num">·</span><div className="body"><strong>2025 / current-year</strong><p>Hands themed around the year's digits.</p></div></li>
        <li><span className="num">·</span><div className="body"><strong>Addition Hands</strong><p>The numbers in the groups literally add up — e.g. 1 + 2 = 3.</p></div></li>
        <li><span className="num">·</span><div className="body"><strong>Consecutive Runs</strong><p>Numbers go in order — e.g. 4, 5, 6.</p></div></li>
        <li><span className="num">·</span><div className="body"><strong>Singles &amp; Pairs</strong><p>No pungs or kongs allowed. Jokers forbidden. Higher payouts.</p></div></li>
        <li><span className="num">·</span><div className="body"><strong>Winds &amp; Dragons, 369, Quints</strong><p>Themed sections — colorful and constrained.</p></div></li>
      </ul>

      <Callout tag="Get the real card">Visit the National Mah Jongg League site to order this year's card ($14 standard / $15 large print). It's reissued every April.</Callout>
    </div>
  );
}

function StrategyScreen() {
  return (
    <div>
      <Eyebrow>06 — Strategy</Eyebrow>
      <h2 className="section-title">Beginner moves that win.</h2>
      <p>You don't need to play like a shark — just stop making the rookie mistakes. Six habits that put you above table average:</p>

      <ul className="clean">
        <li><span className="num">01</span><div className="body"><strong>Pick two target lines, not one.</strong><p>Pick a primary and a backup that share tiles. Lock in only when the Charleston ends.</p></div></li>
        <li><span className="num">02</span><div className="body"><strong>Count your jokers.</strong><p>Eight in the set. Track how many have been used. The more in play, the more aggressive everyone gets.</p></div></li>
        <li><span className="num">03</span><div className="body"><strong>Watch what's discarded.</strong><p>If 8 Dots have hit the table three times, no one's collecting them. Don't pursue a hand that needs them.</p></div></li>
        <li><span className="num">04</span><div className="body"><strong>Don't expose unless you have to.</strong><p>Calling discards is fast but tells the table what you're collecting. Concealed hands pay double.</p></div></li>
        <li><span className="num">05</span><div className="body"><strong>Defense matters late.</strong><p>If someone has exposed groups suggesting they're one tile away, don't discard tiles they might need.</p></div></li>
        <li><span className="num">06</span><div className="body"><strong>If your hand is dead, switch hard.</strong><p>If the card line you're chasing is now impossible, don't sink with it. Find a new line — even a worse-paying one.</p></div></li>
      </ul>

      <Divider deco>✦</Divider>

      <h3 className="sub-title">Joker rules at a glance</h3>
      <div className="do-dont">
        <div className="col do">
          <h5>Jokers can</h5>
          <ul>
            <li>Stand in for any tile in a pung, kong, or quint</li>
            <li>Be swapped for the real tile they represent (any player, any turn)</li>
            <li>Count toward winning a hand</li>
          </ul>
        </div>
        <div className="col dont">
          <h5>Jokers can't</h5>
          <ul>
            <li>Be used in a pair or for a single tile</li>
            <li>Be discarded except by accident (penalty)</li>
            <li>Be passed in the Charleston</li>
            <li>Be used in "Singles &amp; Pairs" hands</li>
          </ul>
        </div>
      </div>

      <Callout tag="Memorize this one">A joker IS the tile it stands for. If someone redeems it, you replace it with the matching real tile and put the joker on your rack.</Callout>

      <h3 className="sub-title">Mental checklist before discarding</h3>
      <ul className="clean">
        <li><span className="num">a</span><div className="body"><strong>Did I draw what I needed?</strong><p>If yes, keep it and discard a useless tile from your hand instead.</p></div></li>
        <li><span className="num">b</span><div className="body"><strong>Is anyone exposed?</strong><p>Look at their face-up groups. Avoid discarding what they might call.</p></div></li>
        <li><span className="num">c</span><div className="body"><strong>Am I still on target?</strong><p>Glance at your card line. Are you closer than last turn?</p></div></li>
      </ul>
    </div>
  );
}

function EtiquetteScreen() {
  return (
    <div>
      <Eyebrow>07 — Etiquette</Eyebrow>
      <h2 className="section-title">Table manners.</h2>
      <p>Mah Jongg is fast and very social. These conventions are universal — knowing them prevents 90% of beginner friction.</p>

      <h3 className="sub-title">At the table</h3>
      <div className="do-dont">
        <div className="col do">
          <h5>Do</h5>
          <ul>
            <li>Say your discard out loud, clearly</li>
            <li>Wait until the discard is fully released before calling</li>
            <li>Keep your tiles behind your rack</li>
            <li>Use the joker swap any time it's your turn</li>
            <li>Compliment a well-built hand</li>
          </ul>
        </div>
        <div className="col dont">
          <h5>Don't</h5>
          <ul>
            <li>Touch your tiles before the Charleston ends if you can help it</li>
            <li>Comment on other people's exposed tiles mid-hand</li>
            <li>Discard without naming the tile</li>
            <li>Hover-pick over a discard pretending to think</li>
            <li>Reveal your hand if you've made an error</li>
          </ul>
        </div>
      </div>

      <Divider deco>✦</Divider>

      <h3 className="sub-title">Calling — the timing</h3>
      <p>If you want to call a discarded tile, you must do so <strong>before the next player picks from the wall</strong>. After that, the discard is "dead" — gone forever.</p>
      <Callout tag="The pause">Most tables observe a polite half-second pause after each discard to give callers time. If you're slow, ask for a moment — don't grab tiles mid-deal.</Callout>

      <h3 className="sub-title">Mistakes happen</h3>
      <ul className="clean">
        <li><span className="num">a</span><div className="body"><strong>Wrong call.</strong><p>If you call a tile but can't actually use it, expose your hand and you're typically declared "dead" for the rest of that hand.</p></div></li>
        <li><span className="num">b</span><div className="body"><strong>13-tile error.</strong><p>If you discover mid-hand that you have 12 or 14 tiles, you're dead. Keep playing — just stop discarding aggressively.</p></div></li>
        <li><span className="num">c</span><div className="body"><strong>False Mah Jongg.</strong><p>If you declare and you're wrong: dead for the rest of the hand, and at most tables you pay each player the value of the hand.</p></div></li>
      </ul>

      <h3 className="sub-title">House rules to settle in advance</h3>
      <ul className="clean">
        <li><span className="num">·</span><div className="body"><strong>Stakes.</strong><p>Quarters? Dollars? Nothing? Decide before you sit down.</p></div></li>
        <li><span className="num">·</span><div className="body"><strong>Courtesy pass.</strong><p>Skip it, do it once, do it every game?</p></div></li>
        <li><span className="num">·</span><div className="body"><strong>Blind passes.</strong><p>Whether you may pass tiles received the previous pass without looking.</p></div></li>
        <li><span className="num">·</span><div className="body"><strong>Wall game.</strong><p>What happens if the wall runs out before anyone wins. Usually: nobody pays anyone.</p></div></li>
      </ul>
    </div>
  );
}

function Flashcards() {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [marked, setMarked] = useState({ right: 0, wrong: 0 });
  const card = QUIZ[i];

  function next(judged) {
    if (judged) setMarked((m) => ({ ...m, [judged]: m[judged] + 1 }));
    setFlipped(false);
    setTimeout(() => setI((j) => (j + 1) % QUIZ.length), 220);
  }
  function reset() { setI(0); setFlipped(false); setMarked({ right: 0, wrong: 0 }); }

  return (
    <div>
      <div className="builder-meta">
        <span>Card {String(i + 1).padStart(2, '0')} of {QUIZ.length}</span>
        <span className="count"><strong>{marked.right}</strong> / {marked.right + marked.wrong || 0}</span>
      </div>
      <div className="flash-wrap">
        <div className="flashcard" onClick={() => setFlipped((f) => !f)}>
          {flipped ? (
            <div className="flash-face back" key={`b-${i}`}>
              <div className="q-eyebrow">Answer</div>
              <p className="q-answer">{card.a}</p>
              <p className="q-detail">{card.detail}</p>
              <div className="flip-hint">tap to flip back</div>
            </div>
          ) : (
            <div className="flash-face front" key={`f-${i}`}>
              <div className="q-eyebrow">Question</div>
              <p className="q-prompt">{card.q}</p>
              <div className="flip-hint">tap to flip</div>
            </div>
          )}
        </div>
      </div>
      <div className="flash-controls" style={{ marginBottom: 10 }}>
        <button className="btn ghost" onClick={() => next('wrong')} disabled={!flipped}>Got it wrong</button>
        <button className="btn primary" onClick={() => next('right')} disabled={!flipped}>Got it right</button>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn ghost small" style={{ flex: 1 }} onClick={reset}>Restart</button>
        <button className="btn ghost small" style={{ flex: 1 }} onClick={() => { setFlipped(false); setTimeout(() => setI((j) => (j + 1) % QUIZ.length), 200); }}>Skip</button>
      </div>
      <Callout tag="Tip">Quiz yourself out loud — saying the answer is closer to how it'll feel at the table than reading it silently.</Callout>
    </div>
  );
}

function HandBuilder() {
  const [tray, setTray] = useState([]);
  const [filter, setFilter] = useState('all');

  function add(t) { if (tray.length >= 14) return; setTray((arr) => [...arr, { ...t, _k: Math.random() }]); }
  function remove(k) { setTray((arr) => arr.filter((x) => x._k !== k)); }
  function clear() { setTray([]); }

  const filters = [
    { id: 'all', label: 'All' }, { id: 'bam', label: 'Bams' },
    { id: 'dot', label: 'Dots' }, { id: 'crak', label: 'Craks' }, { id: 'honor', label: 'W/D/F/J' },
  ];

  const visibleTiles = useMemo(() => {
    if (filter === 'all') return ALL_TILES;
    if (filter === 'honor') return [...TILES.winds, ...TILES.dragons, ...TILES.flowers, ...TILES.jokers];
    return ALL_TILES.filter((t) => t.suit === filter);
  }, [filter]);

  return (
    <div>
      <div className="builder-meta">
        <span>Your hand</span>
        <span className="count"><strong>{tray.length}</strong> / 13 (+1 draw)</span>
      </div>
      <div className="builder-tray">
        {tray.length === 0 ? (
          <div className="empty">Tap tiles below to add them to your hand</div>
        ) : (
          <div className="tile-rack">{tray.map((t) => <Tile key={t._k} tile={t} size="sm" onClick={() => remove(t._k)} />)}</div>
        )}
      </div>
      <div className="builder-palette">
        <div className="pal-label">Tile palette</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {filters.map((f) => <button key={f.id} className={`chip ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>{f.label}</button>)}
        </div>
        <div className="scroll">{visibleTiles.map((t) => <Tile key={t.id} tile={t} size="sm" onClick={() => add(t)} />)}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className="btn ghost" onClick={clear} disabled={!tray.length}>Clear</button>
        <button className="btn ghost" style={{ flex: 1 }} onClick={() => {
          const pool = [...ALL_TILES];
          const out = [];
          for (let i = 0; i < 13; i++) out.push({ ...pool[Math.floor(Math.random() * pool.length)], _k: Math.random() });
          setTray(out);
        }}>Deal me 13 random</button>
      </div>
      <Callout tag="Try this">Try building a "Like Numbers" hand: pick a single number (say, 5) and assemble FFFF + three pungs of 5s in three different suits. That's a real winning shape.</Callout>
    </div>
  );
}

function PracticeScreen() {
  const [mode, setMode] = useState('flash');
  return (
    <div>
      <Eyebrow>Practice</Eyebrow>
      <h2 className="section-title">Two ways to stay sharp.</h2>
      <p>A drill for facts, a sandbox for tile-shape. Use both before Monday.</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`chip ${mode === 'flash' ? 'active' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMode('flash')}>Flashcards</button>
        <button className={`chip ${mode === 'build' ? 'active' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMode('build')}>Hand Builder</button>
      </div>
      {mode === 'flash' ? <Flashcards /> : <HandBuilder />}
    </div>
  );
}

function CheatSheet() {
  return (
    <div>
      <Eyebrow>Cheat Sheet</Eyebrow>
      <h2 className="section-title">Everything, in one screen.</h2>
      <p>Bookmark this. Open it at the table. The whole game on one screen.</p>

      <h3 className="sub-title">Groups</h3>
      <div className="cheat-grid">
        <div className="cheat-card"><span className="num">2</span><h5>Pair</h5><p>2 identical tiles. <strong>No jokers.</strong></p></div>
        <div className="cheat-card"><span className="num">3</span><h5>Pung</h5><p>3 identical tiles. Jokers OK.</p></div>
        <div className="cheat-card"><span className="num">4</span><h5>Kong</h5><p>4 identical tiles. Jokers OK.</p></div>
        <div className="cheat-card"><span className="num">5</span><h5>Quint</h5><p>5 of a kind. Requires jokers.</p></div>
      </div>

      <Divider deco>✦</Divider>

      <h3 className="sub-title">The set, at a glance</h3>
      <div className="cheat-grid">
        <div className="cheat-card"><span className="num">108</span><h5>Suit tiles</h5><p>Bams + Dots + Craks. 36 of each suit (1–9, four copies each).</p></div>
        <div className="cheat-card"><span className="num">28</span><h5>Honors</h5><p>16 Winds + 12 Dragons.</p></div>
        <div className="cheat-card"><span className="num">8</span><h5>Flowers</h5><p>All interchangeable.</p></div>
        <div className="cheat-card"><span className="num">8</span><h5>Jokers</h5><p>Wild for groups of 3+ only.</p></div>
      </div>

      <Divider deco>✦</Divider>

      <h3 className="sub-title">Dragons pair with suits</h3>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-around', background: 'var(--cream-card)', border: '1px solid var(--line)', padding: 14, borderRadius: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <Tile tile={TILES.dragons[1]} size="sm" />
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 6, color: 'var(--ink-mute)' }}>Green → Bams</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Tile tile={TILES.dragons[2]} size="sm" />
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 6, color: 'var(--ink-mute)' }}>Soap → Dots</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Tile tile={TILES.dragons[0]} size="sm" />
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 6, color: 'var(--ink-mute)' }}>Red → Craks</div>
        </div>
      </div>

      <h3 className="sub-title">A turn, in four words</h3>
      <div className="cheat-grid">
        <div className="cheat-card"><span className="num">1</span><h5>Watch</h5><p>The discard.</p></div>
        <div className="cheat-card"><span className="num">2</span><h5>Call?</h5><p>Or pass.</p></div>
        <div className="cheat-card"><span className="num">3</span><h5>Draw</h5><p>From the wall.</p></div>
        <div className="cheat-card"><span className="num">4</span><h5>Discard</h5><p>Name it aloud.</p></div>
      </div>

      <Divider deco>✦</Divider>

      <h3 className="sub-title">Glossary</h3>
      <ul className="clean">
        {GLOSSARY.map((g) => (
          <li key={g.term}>
            <span className="num" style={{ fontFamily: 'var(--display)', fontStyle: 'italic', fontSize: 18, minWidth: 80 }}>{g.term}</span>
            <div className="body"><p>{g.def}</p></div>
          </li>
        ))}
      </ul>

      <Callout tag="One last thing">If you're stuck mid-game, ask. The other players want you to play more, not less.</Callout>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────

function App() {
  const LEARN_SECTIONS = [
    { id: 'overview',   label: 'Overview',   Comp: Overview },
    { id: 'tiles',      label: 'Tiles',      Comp: TilesScreen },
    { id: 'charleston', label: 'Charleston', Comp: CharlestonScreen },
    { id: 'turn',       label: 'A Turn',     Comp: TurnScreen },
    { id: 'card',       label: 'The Card',   Comp: CardScreen },
    { id: 'strategy',   label: 'Strategy',   Comp: StrategyScreen },
    { id: 'etiquette',  label: 'Etiquette',  Comp: EtiquetteScreen },
  ];

  const initial = (() => {
    const h = (window.location.hash || '').replace('#', '');
    const [t, sub] = h.split('/');
    return {
      tab: ['learn', 'practice', 'cheat'].includes(t) ? t : 'learn',
      learnSection: LEARN_SECTIONS.find((s) => s.id === sub)?.id || 'overview',
    };
  })();

  const [tab, setTab] = useState(initial.tab);
  const [learnSection, setLearnSection] = useState(initial.learnSection);
  const mainRef = useRef(null);

  useEffect(() => {
    const h = tab === 'learn' ? `#learn/${learnSection}` : `#${tab}`;
    window.history.replaceState(null, '', h);
  }, [tab, learnSection]);

  function switchTab(t) {
    setTab(t);
    if (mainRef.current) mainRef.current.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function jumpToLearn(section) {
    setTab('learn');
    setLearnSection(section);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0);
  }

  const ActiveLearn = LEARN_SECTIONS.find((s) => s.id === learnSection);

  return (
    <div className="app">
      <header className="app-header">
        <div className="mark">
          <span className="hand">Mahjong</span>
          <span className="sub">Monday</span>
        </div>
        <div className="crest" aria-hidden="true">M</div>
      </header>

      {tab === 'learn' ? (
        <nav className="section-bar" aria-label="Learn sections">
          {LEARN_SECTIONS.map((s, i) => (
            <button key={s.id} className={`seg ${learnSection === s.id ? 'active' : ''}`}
              onClick={() => { setLearnSection(s.id); window.scrollTo({ top: 0, behavior: 'instant' }); }}>
              <span className="num">{String(i + 1).padStart(2, '0')}</span>{s.label}
            </button>
          ))}
        </nav>
      ) : null}

      <main className="main" ref={mainRef}>
        {tab === 'learn' && ActiveLearn ? <ActiveLearn.Comp goLearn={jumpToLearn} goPractice={() => switchTab('practice')} /> : null}
        {tab === 'practice' ? <PracticeScreen /> : null}
        {tab === 'cheat' ? <CheatSheet /> : null}
      </main>

      <nav className="tabbar" aria-label="Main">
        <button className={`tab ${tab === 'learn' ? 'active' : ''}`} onClick={() => switchTab('learn')}>
          <span className="glyph"><TabIcon name="learn" /></span>Learn
        </button>
        <button className={`tab ${tab === 'practice' ? 'active' : ''}`} onClick={() => switchTab('practice')}>
          <span className="glyph"><TabIcon name="practice" /></span>Practice
        </button>
        <button className={`tab ${tab === 'cheat' ? 'active' : ''}`} onClick={() => switchTab('cheat')}>
          <span className="glyph"><TabIcon name="cheat" /></span>Cheat
        </button>
        <button className="tab" onClick={() => { switchTab('learn'); setLearnSection('overview'); }}>
          <span className="glyph"><TabIcon name="home" /></span>Top
        </button>
      </nav>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
