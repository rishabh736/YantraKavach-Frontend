import { useA11y } from '../context/A11yContext';
import { cn } from '../lib/format';

/** Accessibility utility bar: skip link, text size, high contrast and language. */
export function UtilityBar() {
  const { t, scale, setScale, contrast, toggleContrast, lang, setLang } = useA11y();
  const skip = () => {
    const main = document.getElementById('main');
    if (main) { main.focus(); main.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  };
  const chip = (active: boolean) =>
    cn('h-6 min-w-[28px] rounded border px-1.5 text-xs font-medium', active ? 'border-ink bg-ink text-surface' : 'border-line bg-surface text-ink hover:border-muted');
  return (
    <div className="no-print border-b border-line bg-raised text-xs" role="region" aria-label="Accessibility options">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 overflow-x-auto px-4 py-1.5 sm:px-6">
        <button onClick={skip} className="whitespace-nowrap font-medium text-info underline-offset-2 hover:underline">{t('Skip to main content')}</button>
        <div className="flex items-center gap-4 whitespace-nowrap">
          <div className="flex items-center gap-1.5" role="group" aria-label={t('Text size')}>
            <span className="text-muted">{t('Text size')}</span>
            <button className={chip(scale === 0.9)} onClick={() => setScale(0.9)} aria-pressed={scale === 0.9} aria-label="Decrease text size">A−</button>
            <button className={chip(scale === 1)} onClick={() => setScale(1)} aria-pressed={scale === 1} aria-label="Normal text size">A</button>
            <button className={chip(scale === 1.15)} onClick={() => setScale(1.15)} aria-pressed={scale === 1.15} aria-label="Increase text size">A+</button>
          </div>
          <button className={cn(chip(contrast), 'px-2')} onClick={toggleContrast} aria-pressed={contrast}>{t('High contrast')}</button>
          <div className="flex items-center gap-1.5" role="group" aria-label={t('Language')}>
            <button className={chip(lang === 'en')} onClick={() => setLang('en')} aria-pressed={lang === 'en'} lang="en">EN</button>
            <button className={chip(lang === 'hi')} onClick={() => setLang('hi')} aria-pressed={lang === 'hi'} lang="hi">हिन्दी</button>
          </div>
        </div>
      </div>
    </div>
  );
}
