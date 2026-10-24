const BASE = import.meta.env.BASE_URL;

/** Brand icon (helmet, gear and tools). Swaps to a light-on-dark version in dark theme. */
export function LogoMark({ size = 38, full = false }: { size?: number; full?: boolean }) {
  const light = `${BASE}${full ? 'logo-icon-full.png' : 'logo-icon.png'}`;
  const dark = full ? light : `${BASE}logo-icon-dark.png`;
  return (
    <>
      <img src={light} alt="Yantra Kavach" style={{ height: size, width: 'auto' }} className="block dark:hidden" />
      <img src={dark} alt="" aria-hidden="true" style={{ height: size, width: 'auto' }} className="hidden dark:block" />
    </>
  );
}

/** "YANTRA KAVACH" wordmark image. */
export function Wordmark({ height = 32 }: { height?: number }) {
  return (
    <>
      <img src={`${BASE}logo-wordmark.png`} alt="Yantra Kavach" style={{ height, width: 'auto' }} className="block dark:hidden" />
      <img src={`${BASE}logo-wordmark-dark.png`} alt="" aria-hidden="true" style={{ height, width: 'auto' }} className="hidden dark:block" />
    </>
  );
}

export function Logo({ compact = false, size = 40 }: { compact?: boolean; sub?: boolean; size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={size} />
      {!compact && <Wordmark height={Math.round(size * 0.82)} />}
    </div>
  );
}
