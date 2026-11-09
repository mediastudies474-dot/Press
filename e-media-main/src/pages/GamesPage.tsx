import { useEffect, useMemo, useRef, useState } from 'react';
import { Brain, Shuffle, Zap, Grid3x3, Trophy, RefreshCw, ChevronLeft } from 'lucide-react';

type GameId = 'trivia' | 'scramble' | 'memory' | 'reaction';

interface GameMeta {
  id: GameId;
  title: string;
  tagline: string;
  icon: React.ReactNode;
  gradient: string;
}

const GAMES: GameMeta[] = [
  { id: 'trivia',   title: 'Eswatini Trivia', tagline: 'Test your knowledge of the Kingdom', icon: <Brain size={22} />, gradient: 'from-amber-500 to-rose-500' },
  { id: 'scramble', title: 'Word Scramble',   tagline: 'Unscramble Swazi & news words',     icon: <Shuffle size={22} />, gradient: 'from-blue-500 to-indigo-600' },
  { id: 'memory',   title: 'Memory Match',    tagline: 'Find the matching media logos',     icon: <Grid3x3 size={22} />, gradient: 'from-emerald-500 to-teal-600' },
  { id: 'reaction', title: 'Tap Reaction',    tagline: 'How fast can you tap?',             icon: <Zap size={22} />,    gradient: 'from-fuchsia-500 to-purple-600' },
];

const HS_KEY = 'emedia-games-highscores';
const loadHS = (): Record<GameId, number> => {
  try { return { trivia: 0, scramble: 0, memory: 0, reaction: 0, ...JSON.parse(localStorage.getItem(HS_KEY) || '{}') }; }
  catch { return { trivia: 0, scramble: 0, memory: 0, reaction: 0 }; }
};
const saveHS = (hs: Record<GameId, number>) => localStorage.setItem(HS_KEY, JSON.stringify(hs));

const GamesPage = () => {
  const [active, setActive] = useState<GameId | null>(null);
  const [highScores, setHighScores] = useState(loadHS());

  const recordScore = (id: GameId, score: number, lowerIsBetter = false) => {
    setHighScores(prev => {
      const current = prev[id] || 0;
      const better = lowerIsBetter ? (current === 0 || score < current) : score > current;
      if (!better) return prev;
      const next = { ...prev, [id]: score };
      saveHS(next);
      return next;
    });
  };

  if (active === 'trivia')   return <TriviaGame   onBack={() => setActive(null)} onScore={(s) => recordScore('trivia', s)} best={highScores.trivia} />;
  if (active === 'scramble') return <ScrambleGame onBack={() => setActive(null)} onScore={(s) => recordScore('scramble', s)} best={highScores.scramble} />;
  if (active === 'memory')   return <MemoryGame   onBack={() => setActive(null)} onScore={(s) => recordScore('memory', s, true)} best={highScores.memory} />;
  if (active === 'reaction') return <ReactionGame onBack={() => setActive(null)} onScore={(s) => recordScore('reaction', s, true)} best={highScores.reaction} />;

  return (
    <div className="px-4 pt-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Trophy size={20} className="text-primary" /> Games
        </h2>
        <span className="text-xs text-muted-foreground">Beat your best score</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {GAMES.map(g => (
          <button
            key={g.id}
            onClick={() => setActive(g.id)}
            className={`relative overflow-hidden rounded-2xl p-4 text-left text-white bg-gradient-to-br ${g.gradient} active:scale-[0.97] transition-transform shadow-lg`}
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-3">
              {g.icon}
            </div>
            <p className="text-sm font-bold leading-tight">{g.title}</p>
            <p className="text-[11px] opacity-90 mt-0.5 leading-snug">{g.tagline}</p>
            <p className="text-[10px] mt-3 font-semibold opacity-90">
              Best: {highScores[g.id] || '—'}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-card border border-border/50 p-4">
        <p className="text-sm font-semibold text-card-foreground mb-1">🏆 Daily challenge</p>
        <p className="text-xs text-muted-foreground">Play any game once a day to keep your streak alive. Top scores save automatically.</p>
      </div>
    </div>
  );
};

const GameShell = ({ title, onBack, children, best, score }: { title: string; onBack: () => void; children: React.ReactNode; best?: number; score?: number }) => (
  <div className="px-4 pt-4 pb-24">
    <div className="flex items-center justify-between mb-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-primary font-semibold">
        <ChevronLeft size={18} /> Games
      </button>
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      <div className="text-[10px] text-muted-foreground text-right leading-tight">
        {score !== undefined && <div>Score: <span className="font-bold text-foreground">{score}</span></div>}
        {best !== undefined && <div>Best: <span className="font-bold text-primary">{best || '—'}</span></div>}
      </div>
    </div>
    {children}
  </div>
);

/* ---------------- Trivia ---------------- */
const TRIVIA: { q: string; choices: string[]; a: number }[] = [
  { q: 'What is the capital city of Eswatini (administrative)?', choices: ['Manzini', 'Mbabane', 'Lobamba', 'Big Bend'], a: 1 },
  { q: 'Which annual ceremony features the Reed Dance?', choices: ['Incwala', 'Umhlanga', 'Buganu', 'Lusekwane'], a: 1 },
  { q: 'Eswatini changed its name from Swaziland in which year?', choices: ['2016', '2017', '2018', '2019'], a: 2 },
  { q: 'Which currency is used in Eswatini?', choices: ['Rand', 'Lilangeni', 'Pula', 'Kwacha'], a: 1 },
  { q: 'Which mountain is the highest in Eswatini?', choices: ['Emlembe', 'Sibebe', 'Mananga', 'Ngwenya'], a: 0 },
  { q: 'Lobamba is the seat of which branch of government?', choices: ['Judiciary', 'Legislature', 'Executive', 'Military'], a: 1 },
  { q: 'Which sport had Eswatini\'s first Olympic medal hopes?', choices: ['Boxing', 'Football', 'Athletics', 'Swimming'], a: 2 },
  { q: 'Which river forms part of Eswatini\'s border with Mozambique?', choices: ['Komati', 'Lusutfu', 'Mbuluzi', 'Ngwavuma'], a: 1 },
  { q: 'How many official languages does Eswatini have?', choices: ['1', '2', '3', '4'], a: 1 },
  { q: 'Which is the largest Eswatini-based newspaper group?', choices: ['Times of Eswatini', 'Eswatini Observer', 'Swazi News', 'Independent News'], a: 0 },
];

const TriviaGame = ({ onBack, onScore, best }: { onBack: () => void; onScore: (s: number) => void; best: number }) => {
  const [order] = useState(() => [...TRIVIA].sort(() => Math.random() - 0.5).slice(0, 8));
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = order[idx];

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.a) setScore(s => s + 10);
    setTimeout(() => {
      if (idx + 1 >= order.length) {
        setFinished(true);
        onScore(score + (i === q.a ? 10 : 0));
      } else {
        setIdx(idx + 1);
        setPicked(null);
      }
    }, 800);
  };

  return (
    <GameShell title="Eswatini Trivia" onBack={onBack} best={best} score={score}>
      {finished ? (
        <div className="text-center py-10">
          <Trophy size={48} className="text-primary mx-auto mb-3" />
          <p className="text-2xl font-bold text-foreground">{score} points</p>
          <p className="text-sm text-muted-foreground mt-1">{score >= 60 ? 'Brilliant!' : score >= 30 ? 'Nice run!' : 'Keep going!'}</p>
          <button onClick={onBack} className="mt-5 px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Done</button>
        </div>
      ) : (
        <div>
          <div className="h-1.5 rounded-full bg-muted mb-4 overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${(idx / order.length) * 100}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mb-2">Question {idx + 1} of {order.length}</p>
          <p className="text-base font-bold text-foreground mb-4">{q.q}</p>
          <div className="space-y-2">
            {q.choices.map((c, i) => {
              const isCorrect = picked !== null && i === q.a;
              const isWrong = picked === i && i !== q.a;
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                    isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-foreground'
                    : isWrong ? 'bg-rose-500/20 border-rose-500 text-foreground'
                    : 'bg-card border-border/50 hover:border-primary/40 text-card-foreground'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </GameShell>
  );
};

/* ---------------- Scramble ---------------- */
const WORDS = ['MBABANE', 'LIBANDLA', 'INCWALA', 'UMHLANGA', 'LILANGENI', 'EMASWATI', 'SIBEBE', 'MANZINI', 'LOBAMBA', 'EMLEMBE'];
const scramble = (w: string) => {
  let arr = w.split('');
  do { arr = arr.sort(() => Math.random() - 0.5); } while (arr.join('') === w);
  return arr.join('');
};

const ScrambleGame = ({ onBack, onScore, best }: { onBack: () => void; onScore: (s: number) => void; best: number }) => {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(45);
  const [words] = useState(() => [...WORDS].sort(() => Math.random() - 0.5).slice(0, 6));
  const target = words[round];
  const scrambled = useMemo(() => target ? scramble(target) : '', [target]);
  const done = round >= words.length || timeLeft <= 0;

  useEffect(() => {
    if (done) { onScore(score); return; }
    const t = setInterval(() => setTimeLeft(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [done, score, onScore]);

  const submit = () => {
    if (guess.toUpperCase() === target) {
      setScore(s => s + 15);
      setFeedback('correct');
      setTimeout(() => { setFeedback(null); setGuess(''); setRound(r => r + 1); }, 500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 500);
    }
  };

  return (
    <GameShell title="Word Scramble" onBack={onBack} best={best} score={score}>
      {done ? (
        <div className="text-center py-10">
          <Trophy size={48} className="text-primary mx-auto mb-3" />
          <p className="text-2xl font-bold text-foreground">{score} points</p>
          <button onClick={onBack} className="mt-5 px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Done</button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-3">
            <span>Word {round + 1}/{words.length}</span>
            <span className={timeLeft < 10 ? 'text-rose-500 font-bold' : ''}>{timeLeft}s</span>
          </div>
          <div className={`rounded-2xl p-8 text-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-4 transition-transform ${feedback === 'correct' ? 'scale-105' : feedback === 'wrong' ? 'animate-pulse' : ''}`}>
            <p className="text-3xl font-black tracking-[0.3em]">{scrambled}</p>
          </div>
          <input
            value={guess}
            onChange={e => setGuess(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Your answer"
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-card border border-border/50 text-foreground text-center font-bold tracking-widest uppercase mb-3"
          />
          <button onClick={submit} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm">
            Submit
          </button>
          <button onClick={() => setRound(r => r + 1)} className="w-full mt-2 py-2 text-xs text-muted-foreground">Skip</button>
        </div>
      )}
    </GameShell>
  );
};

/* ---------------- Memory ---------------- */
const EMOJIS = ['📺', '📻', '📰', '🎙️', '🌍', '⚽', '🎵', '🎬'];
type Card = { id: number; emoji: string; flipped: boolean; matched: boolean };

const MemoryGame = ({ onBack, onScore, best }: { onBack: () => void; onScore: (s: number) => void; best: number }) => {
  const [cards, setCards] = useState<Card[]>(() => {
    const pairs = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5);
    return pairs.map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
  });
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const done = cards.every(c => c.matched);

  useEffect(() => { if (done) onScore(moves); }, [done, moves, onScore]);

  const flip = (i: number) => {
    if (selected.length === 2 || cards[i].flipped || cards[i].matched) return;
    const next = cards.map((c, idx) => idx === i ? { ...c, flipped: true } : c);
    const nextSel = [...selected, i];
    setCards(next);
    setSelected(nextSel);
    if (nextSel.length === 2) {
      setMoves(m => m + 1);
      setTimeout(() => {
        setCards(prev => {
          const [a, b] = nextSel;
          if (prev[a].emoji === prev[b].emoji) {
            return prev.map((c, idx) => (idx === a || idx === b) ? { ...c, matched: true } : c);
          }
          return prev.map((c, idx) => (idx === a || idx === b) ? { ...c, flipped: false } : c);
        });
        setSelected([]);
      }, 700);
    }
  };

  return (
    <GameShell title="Memory Match" onBack={onBack} best={best} score={moves}>
      {done ? (
        <div className="text-center py-10">
          <Trophy size={48} className="text-primary mx-auto mb-3" />
          <p className="text-2xl font-bold text-foreground">{moves} moves</p>
          <p className="text-sm text-muted-foreground mt-1">Fewer moves = better score</p>
          <button onClick={onBack} className="mt-5 px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Done</button>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-3 text-center">Moves: {moves}</p>
          <div className="grid grid-cols-4 gap-2">
            {cards.map((c, i) => (
              <button
                key={c.id}
                onClick={() => flip(i)}
                className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition-all ${
                  c.flipped || c.matched
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white scale-100'
                    : 'bg-card border border-border/50 text-transparent'
                } ${c.matched ? 'opacity-60' : ''}`}
              >
                {(c.flipped || c.matched) ? c.emoji : '?'}
              </button>
            ))}
          </div>
        </>
      )}
    </GameShell>
  );
};

/* ---------------- Reaction ---------------- */
const ReactionGame = ({ onBack, onScore, best }: { onBack: () => void; onScore: (s: number) => void; best: number }) => {
  const [state, setState] = useState<'idle' | 'waiting' | 'go' | 'result' | 'tooEarly'>('idle');
  const [reaction, setReaction] = useState<number | null>(null);
  const [runs, setRuns] = useState<number[]>([]);
  const startRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const start = () => {
    setState('waiting');
    setReaction(null);
    const delay = 1500 + Math.random() * 2500;
    timerRef.current = window.setTimeout(() => {
      startRef.current = performance.now();
      setState('go');
    }, delay);
  };

  const tap = () => {
    if (state === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setState('tooEarly');
      return;
    }
    if (state === 'go') {
      const ms = Math.round(performance.now() - startRef.current);
      setReaction(ms);
      setRuns(r => [...r, ms]);
      setState('result');
      onScore(ms);
    }
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const bg =
    state === 'go' ? 'bg-emerald-500'
    : state === 'waiting' ? 'bg-rose-500'
    : state === 'tooEarly' ? 'bg-amber-500'
    : 'bg-gradient-to-br from-fuchsia-500 to-purple-600';

  const label =
    state === 'idle' ? 'Tap to start'
    : state === 'waiting' ? 'Wait for GREEN…'
    : state === 'go' ? 'TAP NOW!'
    : state === 'tooEarly' ? 'Too early! Tap to retry'
    : `${reaction} ms`;

  return (
    <GameShell title="Tap Reaction" onBack={onBack} best={best} score={reaction ?? undefined}>
      <button
        onClick={state === 'idle' || state === 'tooEarly' || state === 'result' ? start : tap}
        className={`w-full h-72 rounded-3xl text-white text-2xl font-black flex flex-col items-center justify-center gap-2 transition-colors ${bg}`}
      >
        <Zap size={40} />
        {label}
      </button>
      {runs.length > 0 && (
        <div className="mt-5">
          <p className="text-xs text-muted-foreground mb-2">Recent reactions (ms)</p>
          <div className="flex gap-2 flex-wrap">
            {runs.slice(-6).map((r, i) => (
              <span key={i} className="text-xs bg-card border border-border/50 px-2.5 py-1 rounded-full font-bold text-card-foreground">{r}</span>
            ))}
          </div>
        </div>
      )}
      {state === 'result' && (
        <button onClick={start} className="w-full mt-4 py-3 rounded-xl bg-card border border-border/50 text-foreground font-semibold text-sm flex items-center justify-center gap-2">
          <RefreshCw size={14} /> Try again
        </button>
      )}
    </GameShell>
  );
};

export default GamesPage;
