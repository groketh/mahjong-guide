const { useState, useEffect } = React;

function AmericanMahjongGuide() {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(pct);
      const ids = ['overview', 'tiles', 'setup', 'gameplay', 'card', 'winning', 'etiquette', 'strategy'];
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 120) { setActiveSection(ids[i]); break; }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'tiles', label: 'Tiles' },
    { id: 'setup', label: 'Setup' },
    { id: 'gameplay', label: 'Gameplay' },
    { id: 'card', label: 'The Card' },
    { id: 'winning', label: 'Winning' },
    { id: 'etiquette', label: 'Etiquette' },
    { id: 'strategy', label: 'Strategy' },
  ];

  const Tile = ({ children, color = 'ink' }) => {
    const colors = { ink: 'text-stone-900', red: 'text-red-700', green: 'text-emerald-800', blue: 'text-blue-700' };
    return (
      <div className={`w-9 h-12 bg-amber-50 rounded border-2 border-amber-200/70 flex items-center justify-center text-xl shadow-md ${colors[color]} select-none`}>
        {children}
      </div>
    );
  };

  const HeroTile = ({ top, bottom, color = 'ink' }) => {
    const colors = { ink: 'text-stone-800', red: 'text-red-700', green: 'text-emerald-700', blue: 'text-blue-700' };
    return (
      <div className={`w-9 h-12 bg-amber-50 rounded border-2 border-amber-200 flex flex-col items-center justify-center shadow-md select-none ${colors[color]}`}>
        <span className="font-serif text-base font-semibold leading-none">{top}</span>
        {bottom && <span className="font-mono text-[7px] leading-none mt-1 opacity-40 tracking-tight">{bottom}</span>}
      </div>
    );
  };

  const SectionTag = ({ children }) => (
    <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-amber-500 mb-3">{children}</div>
  );

  const Callout = ({ title, children, variant = 'gold' }) => {
    const styles = variant === 'warning' ? 'bg-orange-900/20 border-orange-600' : 'bg-amber-700/10 border-amber-500';
    const titleColor = variant === 'warning' ? 'text-orange-400' : 'text-amber-500';
    const icon = variant === 'warning' ? '⚠' : '✦';
    return (
      <div className={`${styles} border-l-[3px] rounded-r-md p-4 my-5`}>
        <div className={`font-mono text-[10px] tracking-[0.2em] uppercase ${titleColor} mb-2 flex items-center gap-1.5`}>
          <span>{icon}</span><span>{title}</span>
        </div>
        <p className="text-[15px] leading-relaxed text-stone-200/80 m-0">{children}</p>
      </div>
    );
  };

  const InfoCard = ({ title, items }) => (
    <div className="bg-white/[0.04] border border-white/10 rounded-lg p-4">
      <h4 className="font-serif text-[13px] font-semibold text-amber-300 uppercase tracking-wider mb-3">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-stone-200/70 leading-snug border-b border-white/5 last:border-0 pb-1.5 last:pb-0">
            <span className="text-amber-500 mr-1.5">·</span>{item}
          </li>
        ))}
      </ul>
    </div>
  );

  const Step = ({ num, title, children }) => (
    <li className="flex gap-3.5 mb-5">
      <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-amber-500 flex items-center justify-center font-mono text-xs text-amber-500 bg-amber-700/10 mt-0.5">{num}</div>
      <div className="flex-1 min-w-0">
        <div className="font-serif text-[15px] font-semibold text-stone-100 mb-1">{title}</div>
        <p className="text-[15px] text-stone-200/75 leading-relaxed m-0">{children}</p>
      </div>
    </li>
  );

  const HandCard = ({ name, value, desc }) => (
    <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4">
      <div className="flex justify-between items-baseline gap-2 mb-1.5 flex-wrap">
        <div className="font-serif text-[15px] font-semibold text-amber-300">{name}</div>
        <div className="font-mono text-[11px] tracking-wider text-amber-500 whitespace-nowrap">{value}</div>
      </div>
      <p className="text-[14px] text-stone-200/65 leading-relaxed m-0">{desc}</p>
    </div>
  );

  const SectionHeader = ({ tag, title }) => (
    <React.Fragment>
      <SectionTag>{tag}</SectionTag>
      <h2 className="font-serif text-2xl md:text-3xl font-semibold text-stone-100 mb-5 leading-tight tracking-wide">{title}</h2>
    </React.Fragment>
  );

  const SubHead = ({ children }) => (
    <h3 className="font-serif text-base md:text-lg text-amber-300 mt-7 mb-3 tracking-wide">{children}</h3>
  );

  const P = ({ children }) => (
    <p className="text-[16px] md:text-[17px] text-stone-200/80 leading-[1.75] mb-4">{children}</p>
  );

  return (
    <div className="min-h-screen text-stone-100" style={{
      backgroundColor: '#1b4332',
      backgroundImage: 'radial-gradient(ellipse at 20% 10%, rgba(201,168,76,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, rgba(201,168,76,0.06) 0%, transparent 50%)',
    }}>
      <div className="fixed top-0 left-0 h-1 z-50 transition-all duration-100" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #40916c, #c9a84c)' }} />

      <div className="relative text-center px-5 pt-12 pb-9 border-b border-amber-700/20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 70%)' }} />
        <div className="relative">
          <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-amber-500 mb-4">National Mah Jongg League · Est. 1937</div>
          <h1 className="font-serif font-semibold leading-[1.05] mb-3.5 tracking-wide" style={{ fontSize: 'clamp(34px, 9vw, 72px)' }}>
            American<span className="block text-amber-500">Mah Jongg</span>
          </h1>
          <p className="italic text-stone-200/60 max-w-md mx-auto mb-8 px-2" style={{ fontSize: 'clamp(15px, 4vw, 19px)' }}>
            The complete guide to tiles, hands, strategy, and the art of the game
          </p>
          <div className="flex justify-center gap-1.5 flex-wrap px-2">
            <HeroTile top="3" bottom="BAM" color="green" />
            <HeroTile top="5" bottom="DOT" color="blue" />
            <HeroTile top="7" bottom="CRAK" />
            <HeroTile top="E" bottom="WIND" />
            <HeroTile top="R" bottom="DRAG" color="red" />
            <HeroTile top="G" bottom="DRAG" color="green" />
            <HeroTile top="★" bottom="JKR" color="green" />
          </div>
        </div>
      </div>

      <nav className="sticky top-0 z-40 bg-black/30 backdrop-blur border-b border-amber-700/15 px-4 py-3 overflow-x-auto whitespace-nowrap" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="inline-flex items-center gap-1 md:flex md:flex-wrap md:max-w-4xl md:mx-auto">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-amber-500 mr-2">Jump to</span>
          {sections.map((s) => (
            <button key={s.id} onClick={() => scrollTo(s.id)}
              aria-current={activeSection === s.id ? 'true' : undefined}
              className={`font-mono text-[11px] px-2.5 py-1.5 rounded transition-all ${activeSection === s.id ? 'text-amber-300 bg-amber-700/25 ring-1 ring-amber-500/30' : 'text-stone-200/55 hover:bg-amber-700/10 hover:text-amber-300'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-5 md:px-8">

        <section id="overview" className="py-11 md:py-16 border-b border-white/[0.06]">
          <SectionHeader tag="01 — Overview" title="What Is American Mah Jongg?" />
          <P>American Mah Jongg is a tile-based game for <strong className="text-stone-100 font-semibold">four players</strong> that evolved from the Chinese game of Mahjong after its introduction to the United States in the 1920s. Today's American version is governed by the <em className="text-amber-300 italic">National Mah Jongg League (NMJL)</em>, founded in 1937, and is distinctly different from its Chinese, Japanese, and other Asian counterparts.</P>
          <P>The defining feature of American Mah Jongg is the <strong className="text-stone-100">annual card</strong> — a scorecard issued each year by the NMJL listing the only valid winning hands for that year. Players must build one of these specific hands to win, making the game a unique blend of luck, pattern recognition, and tactical maneuvering.</P>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5">
            <InfoCard title="Key Facts" items={['4 players (3 possible)', '152 tiles in play', 'Annual NMJL card required', 'Jokers can substitute tiles', 'Play is counterclockwise']} />
            <InfoCard title="vs. Chinese Mahjong" items={['Uses joker tiles', 'Fixed hand patterns (card)', 'No melding of incomplete sets', 'Scoring is simpler (25/50 pts)', 'Charleston tile-passing ritual']} />
          </div>
        </section>

        <section id="tiles" className="py-11 md:py-16 border-b border-white/[0.06]">
          <SectionHeader tag="02 — The Tiles" title="Know Your Tiles" />
          <P>A standard American Mah Jongg set contains <strong className="text-stone-100">152 tiles</strong> across several suits and honor categories. Understanding each tile type is essential before play begins.</P>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6">
            {[
              { name: 'Bam (Bamboo)', tiles: [['🀐'], ['🀑'], ['🀒'], ['🀓']], desc: '1–9, depicted with bamboo stalks. The 1-bam is often a bird.' },
              { name: 'Crack (Characters)', tiles: [['🀇'], ['🀈'], ['🀉'], ['🀊']], desc: '1–9, Chinese numerals with the character for "ten thousand."' },
              { name: 'Dot (Circles)', tiles: [['🀙'], ['🀚'], ['🀛'], ['🀜']], desc: '1–9, shown as circular discs arranged on the tile.' },
              { name: 'Winds', tiles: [['🀀'], ['🀁'], ['🀂'], ['🀃']], desc: 'East, South, West, North — 4 of each, 16 total.' },
              { name: 'Dragons', tiles: [['🀄', 'red'], ['🀅', 'green'], ['🀆', 'blue']], desc: 'Red, Green, White (Soap) — 4 of each, 12 total.' },
              { name: 'Flowers & Jokers', tiles: [['🌸', 'red'], ['JKR', 'green']], desc: '8 flowers and 8 jokers — jokers are wild within sets of 3+.' },
            ].map((cat) => (
              <div key={cat.name} className="bg-white/[0.04] border border-amber-700/20 rounded-lg p-4">
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-amber-500 mb-2.5">{cat.name}</div>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {cat.tiles.map(([t, c], i) => (
                    <div key={i} className="w-8 h-11 bg-amber-50 rounded border-2 border-amber-200/70 flex items-center justify-center shadow-sm select-none"
                      style={{ fontSize: t === 'JKR' ? '10px' : '17px', fontFamily: t === 'JKR' ? 'monospace' : 'inherit', color: c === 'red' ? '#b91c1c' : c === 'green' ? '#065f46' : c === 'blue' ? '#1d4ed8' : '#1c1917' }}>
                      {t}
                    </div>
                  ))}
                </div>
                <div className="text-[13px] text-stone-200/55 italic leading-snug">{cat.desc}</div>
              </div>
            ))}
          </div>
          <Callout title="Joker Rule">Jokers may substitute for any tile <em className="text-amber-300 italic">within a set of three or more identical tiles</em> (pung, kong, or quint). Jokers <strong className="text-stone-100">cannot</strong> be used in pairs. A player may "call" a joker from an exposed meld if they hold the exact tile it represents.</Callout>
          <Callout title="Common Mistake" variant="warning">Jokers <strong className="text-stone-100">cannot</strong> substitute in a pair. They only work in groups of 3 or more — this trips up players switching from other variants.</Callout>
        </section>

        <section id="setup" className="py-11 md:py-16 border-b border-white/[0.06]">
          <SectionHeader tag="03 — Setup" title="Seating, Winds & The Wall" />
          <SubHead>Assigning Seats & Winds</SubHead>
          <P>Each player is assigned one of the four <strong className="text-stone-100">wind positions</strong>. The East wind player is the <em className="text-amber-300 italic">dealer</em> for the first hand and has first pick of tiles. Winds rotate after each hand (or stay if East wins).</P>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-5">
            {[{ sym: '🀀', name: 'East', role: 'Dealer' }, { sym: '🀁', name: 'South', role: 'Left of East' }, { sym: '🀂', name: 'West', role: 'Across' }, { sym: '🀃', name: 'North', role: 'Right of East' }].map((w) => (
              <div key={w.name} className="bg-white/[0.05] border border-amber-700/25 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">{w.sym}</div>
                <div className="font-mono text-[10px] tracking-wider uppercase text-amber-500">{w.name}</div>
                <div className="text-[12px] text-stone-200/50 mt-0.5">{w.role}</div>
              </div>
            ))}
          </div>
          <SubHead>Building the Wall</SubHead>
          <ol className="list-none my-5">
            <Step num="1" title="Shuffle & Stack">Turn all tiles face down and mix thoroughly ("washing"). Each player stacks two rows of 19 tiles in front of them, forming four walls of a square.</Step>
            <Step num="2" title="Break the Wall">The dealer rolls two dice. Counting counterclockwise from the dealer, that player breaks the wall at the dice total. Dealing begins from the right side of the break.</Step>
            <Step num="3" title="Deal the Tiles">Deal counterclockwise: <strong className="text-stone-100">3 tiles at a time for 4 rounds</strong> (12 each), then one more to each player. East gets a 14th tile to start; others have 13.</Step>
          </ol>
          <SubHead>The Charleston</SubHead>
          <P>Before play begins, all players participate in the <em className="text-amber-300 italic">Charleston</em> — a mandatory tile-passing ritual unique to American Mah Jongg that helps everyone improve their starting hand.</P>
          <ol className="list-none my-5">
            <Step num="1" title="First Right">Each player simultaneously passes <strong className="text-stone-100">3 tiles face-down</strong> to the player on their right. You cannot look at incoming tiles before passing.</Step>
            <Step num="2" title="First Across">Pass 3 tiles to the player across from you.</Step>
            <Step num="3" title="First Left">Pass 3 tiles to the player on your left.</Step>
            <Step num="4" title="Second Charleston">Optional second round (left, across, right) if all agree. After that, a <em className="text-amber-300 italic">courtesy pass</em> of 1–3 tiles may be offered to the player across.</Step>
          </ol>
          <Callout title="Pro Tip">Pass tiles that don't fit <em className="text-amber-300 italic">any</em> hand you're considering — flowers you don't need, lone tiles from suits you're abandoning. Pass with purpose, not just your "worst" tiles.</Callout>
        </section>

        <section id="gameplay" className="py-11 md:py-16 border-b border-white/[0.06]">
          <SectionHeader tag="04 — Gameplay" title="How a Turn Works" />
          <P>After the Charleston, the dealer (East) discards one tile to begin play. The game proceeds counterclockwise. On your turn, you either draw a tile from the wall or claim a discarded tile.</P>
          <SubHead>Drawing from the Wall</SubHead>
          <P>If no one claims the previous discard, draw the next tile from the wall, add it to your hand (now 14 tiles), and then discard one face-up to the center, announcing its name.</P>
          <SubHead>Claiming a Discard</SubHead>
          <P>Any player may claim a discarded tile <em className="text-amber-300 italic">before</em> the next player draws from the wall.</P>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5">
            <InfoCard title={'"Mah Jongg!" Claim'} items={['Any player may call any discard', 'Must complete a winning hand', 'Takes priority over all other claims', 'Game ends immediately']} />
            <InfoCard title="Regular Claim" items={['Must form a set of 3+ tiles', 'Must expose the complete set', 'Play jumps to the claimer', 'Cannot claim for a pair only']} />
          </div>
          <Callout title="Exposed Melds" variant="warning">When you claim a discard, place the completed set <strong className="text-stone-100">face-up</strong> in front of you. Your hand is now partially exposed and cannot be rearranged for a different hand.</Callout>
          <SubHead>Joker Exchange</SubHead>
          <P>If an opponent's exposed meld contains a joker and you hold the exact tile it represents, you may swap your real tile for their joker on your turn. This gives you a wild card and removes one from them.</P>
        </section>

        <section id="card" className="py-11 md:py-16 border-b border-white/[0.06]">
          <SectionHeader tag="05 — The Card" title="The NMJL Card" />
          <P>The <em className="text-amber-300 italic">National Mah Jongg League Card</em> is the heart of the game. Published annually (usually in spring), it lists every valid winning hand for the year. You must build one of these exact hands — no improvising.</P>
          <P>Cards are purchased directly from the NMJL for a small fee. The card changes each year, keeping play fresh and requiring players to re-learn categories annually.</P>
          <SubHead>Common Hand Categories</SubHead>
          <P>While specifics change yearly, most cards include these recurring categories:</P>
          <div className="grid sm:grid-cols-2 gap-3 my-5">
            <HandCard name="2468 (Evens)" value="25 / 50 pts" desc="Built from even-numbered tiles (2, 4, 6, 8). Often pairs, pungs, and kongs of even numbers." />
            <HandCard name="Like Numbers" value="25 / 50 pts" desc="Sets of the same number across all three suits — e.g., three 7s of bam, crack, and dot." />
            <HandCard name="Winds & Dragons" value="25 / 50 pts" desc="Composed entirely of wind and dragon honors. Often closed (no exposed melds allowed)." />
            <HandCard name="Consecutive Run" value="25 / 50 pts" desc="Tiles in ascending sequence — same suit, or mirrored across suits (e.g., 1–2–3 in bam and crack)." />
            <HandCard name="Singles & Pairs" value="25 / 50 pts" desc="A hand built entirely of pairs — typically 7 pairs totaling 14 tiles. Elegant and challenging." />
            <HandCard name="Flowers" value="25 / 50 pts" desc="Hands incorporating the 8 flower tiles. Flowers cannot receive joker substitutions." />
          </div>
          <SubHead>Reading the Card</SubHead>
          <P>Each hand uses shorthand notation:</P>
          <ul className="list-none space-y-1.5 my-5">
            {[['FF', 'two Flowers (a pair)'], ['222', 'three 2s — a pung of one suit'], ['2222', 'four 2s — a kong'], ['22222', 'five 2s — a quint'], ['NEWS', 'North, East, West, South winds'], ['C', 'a closed hand — no claims allowed']].map(([code, meaning]) => (
              <li key={code} className="flex gap-2.5 items-baseline flex-wrap text-[15px] text-stone-200/75">
                <code className="font-mono text-[13px] text-amber-500 bg-amber-700/10 px-2 py-0.5 rounded whitespace-nowrap">{code}</code>
                <span>{meaning}</span>
              </li>
            ))}
          </ul>
          <Callout title="Closed vs. Open Hands">Hands marked <strong className="text-stone-100">C</strong> are <em className="text-amber-300 italic">closed</em> — you cannot claim any discard. Every tile must be drawn from the wall. Closed hands are harder but often worth more points.</Callout>
        </section>

        <section id="winning" className="py-11 md:py-16 border-b border-white/[0.06]">
          <SectionHeader tag="06 — Winning" title="Declaring Mah Jongg" />
          <P>You win by completing a valid hand from the card using exactly <strong className="text-stone-100">14 tiles</strong> (13 in hand + 1 final tile). The final tile may come from the wall or a discard.</P>
          <SubHead>Calling "Mah Jongg!"</SubHead>
          <ol className="list-none my-5">
            <Step num="1" title="Announce">Call "Mah Jongg!" immediately when you claim a discard or draw the winning tile — before the next player draws.</Step>
            <Step num="2" title="Reveal">Lay all 14 tiles face-up and point to the matching hand on the NMJL card. Your hand must match exactly — right tiles, right quantities, right suits.</Step>
            <Step num="3" title="Collect Payment">All players verify the hand, then payment is settled per the rules below.</Step>
          </ol>
          <SubHead>Scoring</SubHead>
          <P>American Mah Jongg scoring is refreshingly simple. Each hand has two values: one for an <em className="text-amber-300 italic">open</em> hand and one for a <em className="text-amber-300 italic">closed</em> hand — typically <strong className="text-stone-100">25 and 50 points</strong>, with some special hands worth more.</P>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5">
            <InfoCard title="Winner Receives" items={['Points from all 3 opponents', 'Double from the discarder', 'Or equal from all if self-draw', 'Joker-only hands: full value']} />
            <InfoCard title="Penalties" items={['False Mah Jongg: pay all players', 'Dead hand: cannot win', 'Calling wrong tile: penalty', 'Wall game: no winner, redeal']} />
          </div>
          <Callout title="False Declaration" variant="warning">Calling "Mah Jongg!" with an invalid hand is a <strong className="text-stone-100">false declaration</strong>. You must pay each player the value of the hand you claimed, and the game continues without you.</Callout>
        </section>

        <section id="etiquette" className="py-11 md:py-16 border-b border-white/[0.06]">
          <SectionHeader tag="07 — Etiquette" title="Table Etiquette" />
          <P>American Mah Jongg has strong social conventions developed over nearly a century. Respecting them keeps games friendly and fair.</P>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5">
            <InfoCard title="Always Do" items={['Announce each discard by name', 'Pass Charleston tiles face-down', 'Wait for the discard name before claiming', 'Expose melds immediately', 'Keep the card visible to all']} />
            <InfoCard title="Never Do" items={["Look at others' tiles", 'Give unsolicited mid-game advice', 'Delay a discard unnecessarily', 'Claim and then change your mind', 'Discard after calling Mah Jongg']} />
          </div>
          <SubHead>Timing a Claim</SubHead>
          <P>After a discard, there is a brief window to claim. Most groups allow a moment of silence — once the next player touches a wall tile, the previous discard is dead.</P>
          <SubHead>The Dead Hand</SubHead>
          <P>A hand becomes <em className="text-amber-300 italic">dead</em> if you call a tile you don't actually need, expose a meld not on your card, or commit certain procedural errors. A dead hand cannot win but must still discard normally each turn.</P>
        </section>

        <section id="strategy" className="py-11 md:py-16 border-b border-white/[0.06]">
          <SectionHeader tag="08 — Strategy" title="Strategy & Tips" />
          <SubHead>Choose 2–3 Target Hands</SubHead>
          <P>After the Charleston, identify <strong className="text-stone-100">two or three hands</strong> your tiles could build. Keep flexibility early; narrow your focus as tiles emerge. Committing too early is the most common beginner mistake.</P>
          <SubHead>Tile Counting</SubHead>
          <P>There are exactly <strong className="text-stone-100">4 of each suit tile</strong> (plus 8 jokers). Track discards mentally. If three 6-bam have been discarded, the fourth is either in the wall, in someone's hand, or covered by a joker — that changes whether a 6-bam hand is realistic.</P>
          <SubHead>Watch the Discards</SubHead>
          <P>Discards tell a story. If a player keeps passing on dragons, they're not building Winds & Dragons. If they claim two tiles in one suit, avoid feeding that suit further.</P>
          <SubHead>Joker Management</SubHead>
          <P>Jokers are powerful but finite. Save them for the <em className="text-amber-300 italic">rarest</em> tiles you need, not common ones. A joker standing in for a 5-dot early on may be better swapped when you draw the real 5-dot — freeing the joker for tougher slots later.</P>
          <SubHead>Defensive Discards</SubHead>
          <P>When you're far from winning, choose <em className="text-amber-300 italic">safe discards</em> — tiles already discarded by others, or from suits no one is collecting. Don't feed an opponent who's clearly close.</P>
          <SubHead>Charleston Strategy</SubHead>
          <P>The Charleston is your best chance to shape your hand. Drop entire suits if you can. Stay flexible early — over-committing before the Charleston ends limits your options.</P>
          <Callout title="For New Players">Don't try to memorize the entire card at once. Pick <strong className="text-stone-100">three or four hand categories</strong> you understand well and focus on those. Depth beats breadth.</Callout>
        </section>

      </div>

      <footer className="text-center py-9 px-5 border-t border-amber-700/15">
        <div className="text-amber-500 text-lg tracking-[0.4em] opacity-50 mb-3">· · ·</div>
        <p className="font-mono text-[10px] tracking-wider text-stone-200/30 uppercase leading-relaxed">
          American Mah Jongg Definitive Guide<br />NMJL Card required for current-year hands · nmjl.com
        </p>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AmericanMahjongGuide />);
