import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Calendar, Users, UserCheck, CheckCircle, Clock, Trophy, Store, Gift } from 'lucide-react';

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
    } catch { winnersCount = 0; }

    setStats({
      events: eventsRes.count || 0,
      judges: judgesRes.count || 0,
      participants: participantsRes.count || 0,
      completedEvals: completed,
      pendingEvals: pending,
      winners: winnersCount,
      vendors: vendorsRes.count || 0,
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
    const totalReq = mems.reduce((s, m) => s + m.quantity_required, 0);
    const totalRec = mems.reduce((s, m) => s + m.quantity_received, 0);
    const pendingMems = mems.filter(m => m.quantity_required > m.quantity_received);
    setMementoStatus({ required: totalReq, received: totalRec, pending: pendingMems });

    setLoading(false);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card title="Total Events" value={stats.events} icon={<Calendar size={24} />} color="blue" />
        <Card title="Total Judges" value={stats.judges} icon={<Users size={24} />} color="green" />
        <Card title="Total Participants" value={stats.participants} icon={<UserCheck size={24} />} color="purple" />
        <Card title="Completed Evaluations" value={stats.completedEvals} icon={<CheckCircle size={24} />} color="green" />
        <Card title="Pending Evaluations" value={stats.pendingEvals} icon={<Clock size={24} />} color="orange" />
        <Card title="Winners" value={stats.winners} icon={<Trophy size={24} />} color="indigo" />
        <Card title="Total Vendors" value={stats.vendors} icon={<Store size={24} />} color="pink" />
        <Card title="Total Mementos" value={stats.mementos} icon={<Gift size={24} />} color="teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Judging Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Judging Progress</h2>
          {judgingProgress.length === 0 ? (
            <p className="text-gray-500 text-sm">No evaluations started yet.</p>
          ) : (
            <div className="space-y-4">
              {judgingProgress.map((p, i) => {
                const pct = p.total > 0 ? Math.round((p.submitted / p.total) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 truncate mr-2">{p.name}</span>
                      <span className="text-gray-500 whitespace-nowrap">{p.submitted}/{p.total} completed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-indigo-600 h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Memento Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Memento Status</h2>
          {mementoStatus.required === 0 ? (
            <p className="text-gray-500 text-sm">No mementos tracked yet.</p>
          ) : (
            <>
              <div className="flex gap-6 mb-4 text-sm">
                <div><span className="text-gray-500">Required:</span> <span className="font-bold">{mementoStatus.required}</span></div>
                <div><span className="text-gray-500">Received:</span> <span className="font-bold text-green-600">{mementoStatus.received}</span></div>
                <div><span className="text-gray-500">Pending:</span> <span className={`font-bold ${mementoStatus.required - mementoStatus.received > 0 ? 'text-red-600' : 'text-green-600'}`}>{mementoStatus.required - mementoStatus.received}</span></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div className="bg-teal-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${mementoStatus.required > 0 ? Math.round((mementoStatus.received / mementoStatus.required) * 100) : 0}%` }} />
              </div>
              {mementoStatus.pending.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b">
                        <th className="text-left py-2 font-medium">Item</th>
                        <th className="text-left py-2 font-medium">Type</th>
                        <th className="text-center py-2 font-medium">Req</th>
                        <th className="text-center py-2 font-medium">Recv</th>
                        <th className="text-center py-2 font-medium">Pend</th>
                        <th className="text-left py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mementoStatus.pending.map(m => (
                        <tr key={m.id} className="border-b last:border-0">
                          <td className="py-2 font-medium text-gray-900">{m.name}</td>
                          <td className="py-2 text-gray-600 capitalize">{m.type}</td>
                          <td className="py-2 text-center">{m.quantity_required}</td>
                          <td className="py-2 text-center">{m.quantity_received}</td>
                          <td className="py-2 text-center text-red-600 font-bold">{m.quantity_required - m.quantity_received}</td>
                          <td className="py-2">
                            <Badge variant={m.status === 'received' ? 'success' : m.status === 'pending' ? 'warning' : 'info'}>{m.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
