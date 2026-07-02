'use client';

import type {ReactNode} from 'react';
import {useState} from 'react';

type JackpotGame = '6/58' | '6/55' | '6/50';
type SavedKey = 'fourD' | 'sixD' | 'jackpot';
type FavoriteCategory = 'fourD' | 'sixD' | 'packageSet' | 'lotto658' | 'lotto655' | 'lotto650';

type FavoriteNumber = {
  id: string;
  category: FavoriteCategory;
  value: string;
  createdAt: string;
};

type LuckyNumberCopy = {
  fourDTitle: string;
  fourDDescription: string;
  sixDTitle: string;
  sixDDescription: string;
  jackpotTitle: string;
  jackpotDescription: string;
  spinButton: string;
  saveButton: string;
  savedButton: string;
  addedMessage: string;
  duplicateMessage: string;
  fullMessage: string;
  failedMessage: string;
  manageText: string;
};

const jackpotGames: JackpotGame[] = ['6/58', '6/55', '6/50'];
const jackpotUpperBounds: Record<JackpotGame, number> = {
  '6/58': 58,
  '6/55': 55,
  '6/50': 50
};
const favoriteStorageKey = '4d-ai-web-favorites-v2';
const favoriteCategories: FavoriteCategory[] = ['fourD', 'sixD', 'packageSet', 'lotto658', 'lotto655', 'lotto650'];
const maxFavoriteItems = 200;

const jackpotCategoryByGame: Record<JackpotGame, FavoriteCategory> = {
  '6/58': 'lotto658',
  '6/55': 'lotto655',
  '6/50': 'lotto650'
};

function randomDigit() {
  return Math.floor(Math.random() * 10);
}

function generateDigits(count: number) {
  return Array.from({length: count}, randomDigit);
}

function generateJackpot(game: JackpotGame) {
  const upperBound = jackpotUpperBounds[game];
  const pool = Array.from({length: upperBound}, (_, index) => index + 1);

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool.slice(0, 6).sort((left, right) => left - right);
}

function padJackpotNumber(value: number) {
  return String(value).padStart(2, '0');
}

function readFavorites() {
  try {
    const decoded = JSON.parse(window.localStorage.getItem(favoriteStorageKey) ?? '[]') as FavoriteNumber[];
    return Array.isArray(decoded)
      ? decoded.filter((item) => favoriteCategories.includes(item.category) && item.value.trim())
      : [];
  } catch {
    return [];
  }
}

function writeFavorites(items: FavoriteNumber[]) {
  window.localStorage.setItem(favoriteStorageKey, JSON.stringify(items));
}

function categoryLabel(category: FavoriteCategory) {
  if (category === 'fourD') return '4D';
  if (category === 'sixD') return '6D';
  if (category === 'lotto658') return '6/58';
  if (category === 'lotto655') return '6/55';
  if (category === 'lotto650') return '6/50';
  return '包字';
}

export function LuckyNumberToolClient({copy}: {copy: LuckyNumberCopy}) {
  const [fourD, setFourD] = useState(() => generateDigits(4));
  const [sixD, setSixD] = useState(() => generateDigits(6));
  const [jackpotGame, setJackpotGame] = useState<JackpotGame>('6/58');
  const [jackpotNumbers, setJackpotNumbers] = useState(() => generateJackpot('6/58'));
  const [savedKey, setSavedKey] = useState<SavedKey | null>(null);
  const [message, setMessage] = useState('');

  function showSaved(key: SavedKey) {
    setSavedKey(key);
    window.setTimeout(() => setSavedKey((current) => (current === key ? null : current)), 1200);
  }

  function saveFavorite(category: FavoriteCategory, value: string, key: SavedKey) {
    try {
      const favorites = readFavorites();
      const currentEntries = favorites.filter((item) => item.category === category);

      if (currentEntries.some((item) => item.value === value)) {
        setMessage(copy.duplicateMessage);
        showSaved(key);
        return;
      }

      if (currentEntries.length >= maxFavoriteItems) {
        setMessage(copy.fullMessage.replace('{category}', categoryLabel(category)));
        return;
      }

      const next = [
        {id: `${category}-${value}-${Date.now()}`, category, value, createdAt: new Date().toISOString()},
        ...favorites
      ];
      writeFavorites(next);
      setMessage(copy.addedMessage);
      showSaved(key);
    } catch {
      setMessage(copy.failedMessage);
    }
  }

  function selectJackpotGame(game: JackpotGame) {
    setJackpotGame(game);
    setJackpotNumbers(generateJackpot(game));
    setSavedKey(null);
    setMessage('');
  }

  return (
    <section className="space-y-6">
      <LuckyCard
        title={copy.fourDTitle}
        description={copy.fourDDescription}
        numbers={fourD.map(String)}
        numberSize="large"
        saved={savedKey === 'fourD'}
        spinLabel={copy.spinButton}
        saveLabel={copy.saveButton}
        savedLabel={copy.savedButton}
        onSpin={() => {
          setFourD(generateDigits(4));
          setSavedKey(null);
          setMessage('');
        }}
        onSave={() => saveFavorite('fourD', fourD.join(''), 'fourD')}
      />

      <LuckyCard
        title={copy.sixDTitle}
        description={copy.sixDDescription}
        numbers={sixD.map(String)}
        numberSize="compact"
        saved={savedKey === 'sixD'}
        spinLabel={copy.spinButton}
        saveLabel={copy.saveButton}
        savedLabel={copy.savedButton}
        onSpin={() => {
          setSixD(generateDigits(6));
          setSavedKey(null);
          setMessage('');
        }}
        onSave={() => saveFavorite('sixD', sixD.join(''), 'sixD')}
      />

      <LuckyCard
        title={copy.jackpotTitle}
        description={copy.jackpotDescription}
        numbers={jackpotNumbers.map(padJackpotNumber)}
        numberSize="compact"
        saved={savedKey === 'jackpot'}
        spinLabel={copy.spinButton}
        saveLabel={copy.saveButton}
        savedLabel={copy.savedButton}
        onSpin={() => {
          setJackpotNumbers(generateJackpot(jackpotGame));
          setSavedKey(null);
          setMessage('');
        }}
        onSave={() => saveFavorite(jackpotCategoryByGame[jackpotGame], jackpotNumbers.map(padJackpotNumber).join('-'), 'jackpot')}
        headerExtra={
          <div className="mt-6 grid grid-cols-3 gap-3">
            {jackpotGames.map((game) => {
              const active = jackpotGame === game;
              return (
                <button
                  key={game}
                  type="button"
                  onClick={() => selectJackpotGame(game)}
                  aria-pressed={active}
                  className={`min-h-[58px] rounded-[18px] border bg-white px-3 text-xl font-black transition ${
                    active
                      ? 'border-[#d8ad38] text-[#d1a022] shadow-[0_0_0_1px_rgba(216,173,56,0.25)]'
                      : 'border-[#e3dec2] text-[#101820] hover:border-[#d8ad38]'
                  }`}
                >
                  {game}
                </button>
              );
            })}
          </div>
        }
      />

      {message ? (
        <p className="rounded-[18px] border border-amber-200 bg-white px-5 py-4 text-base font-black leading-6 text-[#0d2340] shadow-sm">
          {message}
        </p>
      ) : null}

      <p className="px-1 text-lg font-black leading-8 text-[#5f625b]">
        {copy.manageText}
      </p>
    </section>
  );
}

function LuckyCard({
  title,
  description,
  numbers,
  numberSize,
  saved,
  spinLabel,
  saveLabel,
  savedLabel,
  headerExtra,
  onSpin,
  onSave
}: {
  title: string;
  description: string;
  numbers: string[];
  numberSize: 'large' | 'compact';
  saved: boolean;
  spinLabel: string;
  saveLabel: string;
  savedLabel: string;
  headerExtra?: ReactNode;
  onSpin: () => void;
  onSave: () => void;
}) {
  return (
    <article className="rounded-[28px] border border-[#e7dfc2] bg-white px-7 py-8 shadow-sm">
      <h2 className="text-2xl font-black leading-tight text-[#101820]">{title}</h2>
      <p className="mt-4 text-xl font-black leading-8 text-[#5f625b]">{description}</p>
      {headerExtra}

      <div className={`mt-8 grid gap-3 ${numbers.length === 4 ? 'grid-cols-4' : 'grid-cols-6'}`}>
        {numbers.map((number, index) => (
          <div
            key={`${index}-${number}`}
            className={`result-number flex items-center justify-center rounded-[20px] border border-[#e3dec2] bg-white font-black text-[#101820] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)] ${
              numberSize === 'large'
                ? 'min-h-[138px] text-6xl sm:text-7xl'
                : 'min-h-[118px] text-4xl sm:text-5xl'
            }`}
          >
            {number}
          </div>
        ))}
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onSpin}
          className="min-h-[72px] rounded-[24px] border-2 border-[#d8ad38] bg-white px-3 text-lg font-black text-[#0d2340] shadow-sm transition hover:bg-[#fffaf0] sm:text-xl"
        >
          {spinLabel}
        </button>
        <button
          type="button"
          onClick={onSave}
          className="min-h-[72px] rounded-[24px] border border-[#0e725f] bg-[#0d7a67] px-3 text-lg font-black text-white shadow-sm transition hover:bg-[#096c5a] sm:text-xl"
        >
          {saved ? savedLabel : saveLabel}
        </button>
      </div>
    </article>
  );
}
