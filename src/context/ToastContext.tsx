import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XOctagon, Info } from 'lucide-react';

export type Tone = 'ok' | 'warn' | 'crit' | 'info';
interface ToastItem { id: number; msg: string; tone: Tone }
interface Ctx { toast: (msg: string, tone?: Tone) => void }

const ToastCtx = createContext<Ctx>({ toast: () => {} });
export const useToast = () => useContext(ToastCtx);

const STYLE: Record<Tone, { border: string; text: string; Icon: typeof Info }> = {
  ok: { border: 'border-l-ok', text: 'text-ok', Icon: CheckCircle2 },
  warn: { border: 'border-l-warn', text: 'text-warn', Icon: AlertTriangle },
  crit: { border: 'border-l-crit', text: 'text-crit', Icon: XOctagon },
  info: { border: 'border-l-info', text: 'text-info', Icon: Info },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const toast = useCallback((msg: string, tone: Tone = 'ok') => {
    const id = Date.now() + Math.random();
    setItems((t) => [...t.slice(-3), { id, msg, tone }]);
    setTimeout(() => setItems((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);
  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-20 right-3 z-[100] flex w-[min(360px,calc(100vw-1.5rem))] flex-col gap-2 md:bottom-4 md:right-4" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => {
            const s = STYLE[t.tone];
            return (
              <motion.div key={t.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className={`pointer-events-auto flex items-start gap-3 rounded border border-line border-l-4 ${s.border} bg-raised px-3 py-2.5 text-sm shadow-lg`}>
                <s.Icon size={16} className={`mt-0.5 shrink-0 ${s.text}`} />
                <span>{t.msg}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
