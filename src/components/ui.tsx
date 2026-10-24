import { useEffect } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { Inbox, X, AlertOctagon } from 'lucide-react';
import type { Severity, Status } from '../types';
import { cn } from '../lib/format';

export { cn };

export const STATUS_STYLE: Record<Status, { label: string; text: string; bg: string; border: string; dot: string; top: string; bar: string }> = {
  healthy: { label: 'Healthy', text: 'text-ok', bg: 'bg-ok/10', border: 'border-ok/40', dot: 'bg-ok', top: 'border-t-ok', bar: 'bg-ok' },
  warning: { label: 'Warning', text: 'text-warn', bg: 'bg-warn/10', border: 'border-warn/40', dot: 'bg-warn', top: 'border-t-warn', bar: 'bg-warn' },
  critical: { label: 'Critical', text: 'text-crit', bg: 'bg-crit/10', border: 'border-crit/40', dot: 'bg-crit', top: 'border-t-crit', bar: 'bg-crit' },
};
export const SEVERITY_STYLE: Record<Severity, { label: string; text: string; bg: string; border: string; dot: string; left: string }> = {
  info: { label: 'Information', text: 'text-ok', bg: 'bg-ok/10', border: 'border-ok/40', dot: 'bg-ok', left: 'border-l-ok' },
  warning: { label: 'Warning', text: 'text-warn', bg: 'bg-warn/10', border: 'border-warn/40', dot: 'bg-warn', left: 'border-l-warn' },
  high: { label: 'High Risk', text: 'text-brand', bg: 'bg-brand/10', border: 'border-brand/40', dot: 'bg-brand', left: 'border-l-brand' },
  critical: { label: 'Critical', text: 'text-crit', bg: 'bg-crit/10', border: 'border-crit/40', dot: 'bg-crit', left: 'border-l-crit' },
};

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('min-w-0 rounded-md border border-line bg-surface shadow-panel', className)} {...rest}>{children}</div>;
}

export function Panel({ title, action, children, className, pad = true }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <Card className={className}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h3 className="text-[15px] font-semibold uppercase tracking-wide text-ink">{title}</h3>
          {action}
        </div>
      )}
      <div className={pad ? 'p-4' : ''}>{children}</div>
    </Card>
  );
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'primary' | 'ghost' | 'danger'; size?: 'sm' | 'md' };
export function Button({ variant = 'default', size = 'md', className, ...p }: BtnProps) {
  const v = {
    default: 'border-line bg-raised text-ink hover:border-muted',
    primary: 'border-brand bg-brand text-on-brand hover:brightness-110',
    ghost: 'border-transparent bg-transparent text-muted hover:bg-raised hover:text-ink',
    danger: 'border-crit/60 bg-transparent text-crit hover:bg-crit/10',
  }[variant];
  return (
    <button
      className={cn('inline-flex items-center justify-center gap-2 rounded border font-medium transition disabled:cursor-not-allowed disabled:opacity-50', size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-10 px-4 text-sm', v, className)}
      {...p}
    />
  );
}

export function StatusBadge({ status, size = 'sm' }: { status: Status; size?: 'sm' | 'lg' }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded border font-semibold', s.bg, s.border, s.text, size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs')}>
      <span className={cn('h-2 w-2 rounded-full', s.dot, status === 'critical' && 'animate-blink')} />
      {s.label.toUpperCase()}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const s = SEVERITY_STYLE[severity];
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded border px-2 py-0.5 text-xs font-semibold', s.bg, s.border, s.text)}>
      <span className={cn('h-2 w-2 rounded-full', s.dot)} />
      {s.label.toUpperCase()}
    </span>
  );
}

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-ok/50 px-2 py-0.5 font-mono text-[11px] font-semibold text-ok">
      <span className="h-1.5 w-1.5 animate-blink rounded-full bg-ok" />LIVE
    </span>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label?: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex max-w-full overflow-x-auto rounded border border-line bg-raised">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} aria-pressed={value === o.value}
          className={cn('h-9 whitespace-nowrap border-r border-line px-3 font-mono text-xs font-medium last:border-0', value === o.value ? 'bg-brand text-on-brand' : 'text-muted hover:text-ink')}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Empty({ title, text }: { title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-md border border-dashed border-line px-4 py-10 text-center">
      <Inbox size={26} className="text-muted" />
      <p className="mt-2 font-display text-lg font-semibold">{title}</p>
      {text && <p className="max-w-sm text-sm text-muted">{text}</p>}
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded border border-crit/50 bg-crit/10 px-3 py-2 text-sm text-crit">
      <AlertOctagon size={16} className="mt-0.5 shrink-0" /><span>{children}</span>
    </div>
  );
}

export function LoadingState({ label = 'Loading plant data…' }: { label?: string }) {
  return (
    <div className="space-y-4" role="status" aria-label={label}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-24 animate-blink rounded-md bg-raised" />)}
      </div>
      <div className="h-64 animate-blink rounded-md bg-raised" />
    </div>
  );
}

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-md border border-line bg-surface p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded p-1.5 text-muted hover:bg-raised hover:text-ink"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="flex min-w-0 flex-col gap-1.5"><span className="label">{label}</span>{children}</label>;
}

export function Bar({ value, className }: { value: number; className?: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-sm bg-raised">
      <div className={cn('h-full transition-all duration-700', className ?? 'bg-ok')} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
