"use client";

import React from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6 bg-slate-900 border border-rose-500/30 p-8 rounded-3xl shadow-2xl">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertOctagon className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white">Application Error</h1>
            <p className="text-xs text-slate-400 font-mono">
              {error.message || "A critical runtime error occurred."}
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
