import { Link } from 'react-router-dom';
import { usePlant } from '../context/PlantContext';
import { ZONES } from '../lib/mock';
import { STATUS_STYLE, cn } from './ui';
import { healthScoreLabel } from './floorUtil';

const TILE = {
  healthy: 'border-ok/50 bg-ok/10 hover:bg-ok/20',
  warning: 'border-warn/60 bg-warn/10 hover:bg-warn/20',
  critical: 'border-crit/60 bg-crit/15 hover:bg-crit/25',
};

/** Simplified digital-twin floor plan. Click a tile to open that machine's monitoring panel. */
export function FactoryFloor() {
  const { machines, statusOf, healthOf } = usePlant();
  return (
    <div className="space-y-4">
      {ZONES.map((z, zi) => (
        <div key={z}>
          <div className="label mb-1.5">{z}</div>
          <div className="grid grid-cols-6 gap-2">
            {machines.slice(zi * 6, zi * 6 + 6).map((m) => {
              const st = statusOf(m);
              return (
                <Link key={m.id} to={`/machines/${m.id}`} title={`${m.name} · ${STATUS_STYLE[st].label} · ${healthScoreLabel(healthOf(m))}`}
                  aria-label={`${m.name}, ${STATUS_STYLE[st].label}`}
                  className={cn('relative flex aspect-[1.15] items-center justify-center rounded-sm border font-mono text-[13px] font-semibold transition', TILE[st])}>
                  M{m.id}
                  <span className={cn('absolute right-1 top-1 h-1.5 w-1.5 rounded-full', STATUS_STYLE[st].dot, st === 'critical' && 'animate-blink')} />
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
