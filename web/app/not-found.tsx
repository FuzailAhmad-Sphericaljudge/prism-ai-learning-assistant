import Link from "next/link";
import { Compass, Home, BookOpen, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient refraction glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-cyan-500/15 via-violet-500/15 to-pink-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl">
        {/* Prism refractive icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-violet-500/20 to-pink-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
          <Compass className="h-8 w-8 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-400">
            Temporal Boundary Violation
          </span>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">404</h1>
          <p className="text-sm text-slate-300">
            This learning coordinate does not exist or has been partitioned by the Temporal Evidence Firewall.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/app"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Course Library</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all border border-slate-700"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
          PRISM AI • Team The Falcons
        </div>
      </div>
    </div>
  );
}
