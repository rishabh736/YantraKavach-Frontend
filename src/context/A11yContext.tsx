import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { translate } from '../lib/i18n';
import type { Lang } from '../lib/i18n';

interface Ctx {
  scale: number;
  setScale: (n: number) => void;
  contrast: boolean;
  toggleContrast: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (s: string) => string;
}
const A11yCtx = createContext<Ctx>({ scale: 1, setScale: () => {}, contrast: false, toggleContrast: () => {}, lang: 'en', setLang: () => {}, t: (s) => s });
export const useA11y = () => useContext(A11yCtx);

const KEY = 'yk_a11y';
export function A11yProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ scale: number; contrast: boolean; lang: Lang }>(() => {
    try { return { scale: 1, contrast: false, lang: 'en' as Lang, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
    catch { return { scale: 1, contrast: false, lang: 'en' as Lang }; }
  });
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${16 * state.scale}px`;
    root.classList.toggle('hc', state.contrast);
    root.lang = state.lang === 'hi' ? 'hi' : 'en-IN';
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);
  return (
    <A11yCtx.Provider value={{
      ...state,
      setScale: (scale) => setState((s) => ({ ...s, scale })),
      toggleContrast: () => setState((s) => ({ ...s, contrast: !s.contrast })),
      setLang: (lang) => setState((s) => ({ ...s, lang })),
      t: (s) => translate(state.lang, s),
    }}>
      {children}
    </A11yCtx.Provider>
  );
}
