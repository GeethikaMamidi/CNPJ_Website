import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  Calendar, 
  Users, 
  UserCheck, 
  CheckCircle, 
  Clock, 
  Trophy, 
  Store, 
  Gift, 
  ArrowRight,
  TrendingUp,
  Award,
  Layers
} from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    events: 0, judges: 0, participants: 0,
    completedEvals: 0, pendingEvals: 0,
    winners: 0, vendors: 0, mementos: 0
  });
  const [judgingProgress, setJudgingProgress] = useState([]);
  const [mementoStatus, setMementoStatus] = useState({ required: 0, received: 0, pending: [] });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    try {
      const [eventsRes, judgesRes, participantsRes, evalsRes, vendorsRes, mementosRes] = await Promise.all([
        supabase.from('events').select('id, name', { count: 'exact' }),
        supabase.from('judges').select('id', { count: 'exact' }),
        supabase.from('participants').select('id', { count: 'exact' }),
        supabase.from('evaluations').select('id, event_id, status'),
        supabase.from('vendors').select('id', { count: 'exact' }),
        supabase.from('mementos').select('*, vendors(name)')
      ]);

      const evals = evalsRes.data || [];
      const completed = evals.filter(e => e.status === 'submitted').length;
      const pending = evals.filter(e => e.status !== 'submitted').length;

      // Winners: count unique participants with position <= 3 from results_view
      let winnersCount = 0;
      try {
        const { data: results } = await supabase.from('results_view').select('participant_id, position');
        winnersCount = results ? results.filter(r => r.position <= 3).length : 0;
      } catch { 
        winnersCount = 0; 
      }

      setStats({
        events: eventsRes.count || (eventsRes.data?.length ?? 0),
        judges: judgesRes.count || (judgesRes.data?.length ?? 0),
        participants: participantsRes.count || (participantsRes.data?.length ?? 0),
        completedEvals: completed,
        pendingEvals: pending,
        winners: winnersCount,
        vendors: vendorsRes.count || (vendorsRes.data?.length ?? 0),
        mementos: (mementosRes.data || []).length
      });

      // Judging progress per event
      const events = eventsRes.data || [];
      const progress = events.map(ev => {
        const eventEvals = evals.filter(e => e.event_id === ev.id);
        const submitted = eventEvals.filter(e => e.status === 'submitted').length;
        return { name: ev.name, total: eventEvals.length, submitted };
      }).filter(p => p.total > 0);
      setJudgingProgress(progress);

      // Memento status
      const mems = mementosRes.data || [];
      const totalReq = mems.reduce((s, m) => s + (Number(m.quantity_required) || 0), 0);
      const totalRec = mems.reduce((s, m) => s + (Number(m.quantity_received) || 0), 0);
      const pendingMems = mems.filter(m => (Number(m.quantity_required) || 0) > (Number(m.quantity_received) || 0));
      setMementoStatus({ required: totalReq, received: totalRec, pending: pendingMems });
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner label="Crunching fest analytics..." />;

  const mementoPercent = mementoStatus.required > 0 
    ? Math.min(100, Math.round((mementoStatus.received / mementoStatus.required) * 100))
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 p-6 md:p-8 border border-indigo-500/20 backdrop-blur-xl shadow-2xl">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <TrendingUp size={14} />
              <span>Realtime Festival Command Center</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-black text-white tracking-tight">
              TechTatva Event Intelligence
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Monitor active tracks, judge deliberations, leaderboard standings, and procurement logistics with sub-second synchronization.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/judging"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <span>Judging Console</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/results"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all hover:border-slate-600"
            >
              <Trophy size={16} className="text-amber-400" />
              <span>Leaderboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Core Telemetry</h2>
          <span className="text-xs text-slate-500">Live Counters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Total Events" value={stats.events} icon={<Calendar size={22} />} color="blue" subtitle="Active categories" />
          <Card title="Panel Judges" value={stats.judges} icon={<Users size={22} />} color="purple" subtitle="Assigned evaluators" />
          <Card title="Registered Teams" value={stats.participants} icon={<UserCheck size={22} />} color="indigo" subtitle="Competitors roster" />
          <Card title="Submitted Scores" value={stats.completedEvals} icon={<CheckCircle size={22} />} color="green" subtitle="Locked evaluations" />
          <Card title="Pending Evals" value={stats.pendingEvals} icon={<Clock size={22} />} color="orange" subtitle="In deliberation" />
          <Card title="Podium Winners" value={stats.winners} icon={<Trophy size={22} />} color="teal" subtitle="Top 3 ranked" />
          <Card title="Verified Vendors" value={stats.vendors} icon={<Store size={22} />} color="pink" subtitle="Procurement partners" />
          <Card title="Memento Items" value={stats.mementos} icon={<Gift size={22} />} color="blue" subtitle="Trophies & certificates" />
        </div>
      </div>

      {/* Split Analytics: Judging Progress & Memento Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Judging Progress per Event */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-6 backdrop-blur-xl shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">Judging Completion</h3>
                  <p className="text-xs text-slate-400">Evaluation progress across events</p>
                </div>
              </div>
              <Link to="/judging" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <span>Evaluate</span> <ArrowRight size={12} />
              </Link>
            </div>

            {judgingProgress.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-400">No active judging sessions recorded yet.</p>
                <Link to="/judging" className="mt-3 inline-block text-xs font-semibold text-indigo-400 hover:underline">
                  Start an evaluation session →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {judgingProgress.map((p, i) => {
                  const pct = p.total > 0 ? Math.round((p.submitted / p.total) * 100) : 0;
                  return (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-200 truncate">{p.name}</span>
                        <span className="font-mono text-slate-400 font-medium">
                          {p.submitted} / {p.total} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Memento & Trophy Logistics */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-6 backdrop-blur-xl shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">Awards & Mementos</h3>
                  <p className="text-xs text-slate-400">Procurement and delivery tracking</p>
                </div>
              </div>
              <Link to="/mementos" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                <span>Manage</span> <ArrowRight size={12} />
              </Link>
            </div>

            {mementoStatus.required === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-400">No memento quotas established yet.</p>
                <Link to="/mementos" className="mt-3 inline-block text-xs font-semibold text-emerald-400 hover:underline">
                  Configure mementos →
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Stats Pill Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Required</p>
                    <p className="font-display text-lg font-extrabold text-white mt-0.5">{mementoStatus.required}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Received</p>
                    <p className="font-display text-lg font-extrabold text-emerald-400 mt-0.5">{mementoStatus.received}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Pending</p>
                    <p className={`font-display text-lg font-extrabold mt-0.5 ${mementoStatus.required - mementoStatus.received > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {mementoStatus.required - mementoStatus.received}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Fulfillment quota</span>
                    <span className="font-mono font-semibold text-white">{mementoPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${mementoPercent}%` }} 
                    />
                  </div>
                </div>

                {/* Pending Items mini table */}
                {mementoStatus.pending.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-slate-300 mb-2">Pending Fulfillment Items</p>
                    <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-800/70 text-slate-400 bg-slate-900/60">
                            <th className="text-left py-2 px-3 font-semibold">Item</th>
                            <th className="text-center py-2 px-2 font-semibold">Req</th>
                            <th className="text-center py-2 px-2 font-semibold">Recv</th>
                            <th className="text-center py-2 px-2 font-semibold">Shortfall</th>
                            <th className="text-right py-2 px-3 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {mementoStatus.pending.slice(0, 4).map(m => (
                            <tr key={m.id} className="hover:bg-slate-800/30">
                              <td className="py-2 px-3 font-medium text-slate-200">{m.name}</td>
                              <td className="py-2 px-2 text-center text-slate-400">{m.quantity_required}</td>
                              <td className="py-2 px-2 text-center text-slate-400">{m.quantity_received}</td>
                              <td className="py-2 px-2 text-center font-bold text-rose-400">
                                {m.quantity_required - m.quantity_received}
                              </td>
                              <td className="py-2 px-3 text-right">
                                <Badge variant={m.status === 'received' ? 'success' : (m.status === 'ordered' ? 'info' : 'warning')}>
                                  {m.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
