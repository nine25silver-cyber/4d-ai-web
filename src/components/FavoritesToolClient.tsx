'use client';

import {useEffect, useMemo, useState} from 'react';

type FavoriteCategory = 'fourD' | 'sixD' | 'packageSet' | 'lotto658' | 'lotto655' | 'lotto650';
type PackageType = '24打' | '12打' | '6打' | '4打';

type FavoriteNumber = {
  id: string;
  category: FavoriteCategory;
  value: string;
  createdAt: string;
};

type Props = {
  labels: {
    categoriesTitle: string;
    savedTitle: string;
    addButton: string;
    clearButton: string;
    clearConfirm: string;
    inputLabel: string;
    packageTypeLabel: string;
    lottoInputLabel: string;
    saveButton: string;
    cancelButton: string;
    duplicateText: string;
    limitText: string;
    invalidText: string;
    emptyText: string;
    savedText: string;
    deleteButton: string;
    syncNoteTitle: string;
    syncNoteText: string;
  };
};

const storageKey = '4d-ai-web-favorites-v2';
const maxItems = 200;
const categories: FavoriteCategory[] = ['fourD', 'sixD', 'packageSet', 'lotto658', 'lotto655', 'lotto650'];
const packageTypes: PackageType[] = ['24打', '12打', '6打', '4打'];

function categoryLabel(category: FavoriteCategory) {
  if (category === 'fourD') return '4D';
  if (category === 'sixD') return '6D';
  if (category === 'packageSet') return '包字';
  if (category === 'lotto658') return '6/58';
  if (category === 'lotto655') return '6/55';
  return '6/50';
}

function lottoUpperBound(category: FavoriteCategory) {
  if (category === 'lotto658') return 58;
  if (category === 'lotto655') return 55;
  if (category === 'lotto650') return 50;
  return null;
}

function formatDisplayValue(entry: FavoriteNumber) {
  return lottoUpperBound(entry.category) ? entry.value.replaceAll('-', ' ') : entry.value;
}

function readFavorites() {
  if (typeof window === 'undefined') return [];
  try {
    const decoded = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]') as FavoriteNumber[];
    return Array.isArray(decoded) ? decoded.filter((item) => categories.includes(item.category) && item.value.trim()) : [];
  } catch {
    return [];
  }
}

function writeFavorites(items: FavoriteNumber[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(items));
}

function validateDigits(raw: string, length: number) {
  const normalized = raw.replace(/\s+/g, '');
  return new RegExp(`^\\d{${length}}$`).test(normalized) ? normalized : '';
}

function validateLotto(values: string[], upperBound: number) {
  const numbers = values.map((value) => Number.parseInt(value.trim(), 10));
  if (numbers.length !== 6 || numbers.some((value) => Number.isNaN(value) || value < 1 || value > upperBound)) return '';
  if (new Set(numbers).size !== numbers.length) return '';
  return numbers.sort((left, right) => left - right).map((value) => String(value).padStart(2, '0')).join('-');
}

function validatePackage(packageType: PackageType, rawDigits: string) {
  const digits = rawDigits.replace(/\s+/g, '');
  if (!/^\d{4}$/.test(digits)) return '';
  const counts = new Map<string, number>();
  for (const digit of digits) counts.set(digit, (counts.get(digit) ?? 0) + 1);
  const signature = Array.from(counts.values()).sort((left, right) => left - right).join(',');
  if (packageType === '24打' && counts.size !== 4) return '';
  if (packageType === '12打' && signature !== '1,1,2') return '';
  if (packageType === '6打' && signature !== '2,2') return '';
  if (packageType === '4打' && signature !== '1,3') return '';
  return `${packageType}${digits}`;
}

export function FavoritesToolClient({labels}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<FavoriteCategory>('fourD');
  const [favorites, setFavorites] = useState<FavoriteNumber[]>([]);
  const [digits, setDigits] = useState('');
  const [packageType, setPackageType] = useState<PackageType>('24打');
  const [lottoValues, setLottoValues] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const currentEntries = useMemo(
    () => favorites.filter((item) => item.category === selectedCategory).sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    [favorites, selectedCategory]
  );

  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  function resetInputs() {
    setDigits('');
    setLottoValues(['', '', '', '', '', '']);
  }

  function saveFavorite() {
    const upperBound = lottoUpperBound(selectedCategory);
    const canonical = upperBound
      ? validateLotto(lottoValues, upperBound)
      : selectedCategory === 'packageSet'
        ? validatePackage(packageType, digits)
        : validateDigits(digits, selectedCategory === 'fourD' ? 4 : 6);

    if (!canonical) {
      setMessage(labels.invalidText);
      return;
    }
    if (currentEntries.some((item) => item.value === canonical)) {
      setMessage(labels.duplicateText);
      return;
    }
    if (currentEntries.length >= maxItems) {
      setMessage(labels.limitText.replace('{category}', categoryLabel(selectedCategory)).replace('{max}', String(maxItems)));
      return;
    }

    const next = [
      {id: `${selectedCategory}-${canonical}-${Date.now()}`, category: selectedCategory, value: canonical, createdAt: new Date().toISOString()},
      ...favorites
    ];
    setFavorites(next);
    writeFavorites(next);
    resetInputs();
    setMessage(labels.savedText);
  }

  function deleteFavorite(entry: FavoriteNumber) {
    const next = favorites.filter((item) => item.id !== entry.id);
    setFavorites(next);
    writeFavorites(next);
  }

  function clearCurrentCategory() {
    if (!window.confirm(labels.clearConfirm.replace('{category}', categoryLabel(selectedCategory)))) return;
    const next = favorites.filter((item) => item.category !== selectedCategory);
    setFavorites(next);
    writeFavorites(next);
  }

  return (
    <section className="mt-8 grid gap-5 lg:grid-cols-[420px_1fr]">
      <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-black text-slate-800">{labels.categoriesTitle}</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {categories.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelectedCategory(category);
                  setMessage('');
                  resetInputs();
                }}
                aria-pressed={active}
                className={`min-h-[50px] rounded-md border px-3 py-2 text-sm font-black transition ${active ? 'border-blue-700 bg-blue-800 text-white shadow-sm' : 'border-slate-300 bg-white text-slate-800 hover:border-blue-400 hover:bg-blue-50'}`}
              >
                {categoryLabel(category)}
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 text-sm font-black text-slate-900">{labels.addButton} {categoryLabel(selectedCategory)}</div>
          {lottoUpperBound(selectedCategory) ? (
            <label className="block">
              <span className="text-sm font-black text-slate-800">{labels.lottoInputLabel}</span>
              <div className="mt-2 grid grid-cols-6 gap-2">
                {lottoValues.map((value, index) => (
                  <input
                    key={index}
                    inputMode="numeric"
                    maxLength={2}
                    value={value}
                    onChange={(event) => {
                      const next = [...lottoValues];
                      next[index] = event.target.value.replace(/\D/g, '').slice(0, 2);
                      setLottoValues(next);
                    }}
                    placeholder={`${index + 1}`}
                    className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-center text-sm font-black text-slate-950 outline-none focus:border-blue-500"
                  />
                ))}
              </div>
            </label>
          ) : selectedCategory === 'packageSet' ? (
            <div>
              <span className="text-sm font-black text-slate-800">{labels.packageTypeLabel}</span>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {packageTypes.map((type) => (
                  <button key={type} type="button" onClick={() => setPackageType(type)} className={`rounded-md border px-2 py-2 text-sm font-black ${packageType === type ? 'border-blue-700 bg-blue-800 text-white' : 'border-slate-300 bg-white text-slate-800 hover:bg-blue-50'}`}>
                    {type}
                  </button>
                ))}
              </div>
              <label className="mt-4 block">
                <span className="text-sm font-black text-slate-800">{labels.inputLabel}</span>
                <input inputMode="numeric" maxLength={4} value={digits} onChange={(event) => setDigits(event.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="1234" className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-lg font-black tracking-[0.2em] text-slate-950 outline-none focus:border-blue-500" />
              </label>
            </div>
          ) : (
            <label className="block">
              <span className="text-sm font-black text-slate-800">{labels.inputLabel}</span>
              <input inputMode="numeric" maxLength={selectedCategory === 'fourD' ? 4 : 6} value={digits} onChange={(event) => setDigits(event.target.value.replace(/\D/g, '').slice(0, selectedCategory === 'fourD' ? 4 : 6))} placeholder={selectedCategory === 'fourD' ? '1234' : '123456'} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-lg font-black tracking-[0.2em] text-slate-950 outline-none focus:border-blue-500" />
            </label>
          )}
          <button type="button" onClick={saveFavorite} className="mt-4 w-full rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-black text-blue-900 hover:bg-blue-100">
            {labels.saveButton}
          </button>
          {message ? <p className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-800">{message}</p> : null}
        </div>

        <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="text-xs font-black uppercase text-blue-800">{labels.syncNoteTitle}</div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{labels.syncNoteText}</p>
        </div>
      </form>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-slate-950">{labels.savedTitle} - {categoryLabel(selectedCategory)}</h2>
          <button type="button" onClick={clearCurrentCategory} disabled={currentEntries.length === 0} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-700 hover:border-rose-300 hover:text-rose-700 disabled:opacity-50">
            {labels.clearButton}
          </button>
        </div>
        {currentEntries.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm leading-6 text-slate-600">
            {labels.emptyText.replace('{category}', categoryLabel(selectedCategory))}
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {currentEntries.map((favorite) => (
              <article key={favorite.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div>
                  <div className="text-xl font-black text-slate-950">{formatDisplayValue(favorite)}</div>
                  <p className="mt-1 text-xs font-bold text-slate-500">{new Date(favorite.createdAt).toLocaleString()}</p>
                </div>
                <button type="button" onClick={() => deleteFavorite(favorite)} className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-black text-slate-600 hover:border-rose-300 hover:text-rose-700">
                  {labels.deleteButton}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
