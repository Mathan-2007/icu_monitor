import { Component } from 'react';

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled React error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
          <div className="max-w-md rounded-2xl border border-red-500/30 bg-slate-900 p-8 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">System error</p>
            <h1 className="mt-4 text-2xl font-semibold text-white">Something went wrong</h1>
            <p className="mt-3 text-sm text-slate-300">
              The ICU dashboard hit an unexpected error. Please refresh the page and try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-400"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
