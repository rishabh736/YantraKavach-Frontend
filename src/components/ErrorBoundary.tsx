import { Component } from 'react';
import type { ReactNode } from 'react';

interface State { failed: boolean }
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State { return { failed: true }; }
  componentDidCatch(error: unknown) { console.error('UI error:', error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="mx-auto mt-24 max-w-md rounded-md border border-crit/40 bg-surface p-6 text-center shadow-panel">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted">The page hit an unexpected error. Your data is safe. Reload to try again.</p>
        <button onClick={() => window.location.reload()} className="mt-4 h-10 rounded border border-brand bg-brand px-4 text-sm font-medium text-on-brand">Reload page</button>
      </div>
    );
  }
}
