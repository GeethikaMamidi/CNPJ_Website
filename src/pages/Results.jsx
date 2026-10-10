import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { exportToCSV } from '../lib/utils';
import { 
  Trophy, 
  Eye, 
  Download, 
  Award, 
  Crown, 
  Medal, 
  Sparkles,
  Users,
  CheckCircle2
} from 'lucide-react';

const positionStyle = {
  1: { 
    emoji: '🥇', 
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-black',
    glow: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    border: 'border-amber-500/40 shadow-glow-amber'
  },
  2: { 
    emoji: '🥈', 
    badge: 'bg-slate-300/20 text-slate-200 border-slate-300/30 font-black',
    glow: 'from-slate-400/20 via-slate-500/10 to-transparent',
    border: 'border-slate-400/40'
  },
  3: { 
    emoji: '🥉', 
    badge: 'bg-amber-700/20 text-amber-400 border-amber-700/30 font-black',
    glow: 'from-amber-700/20 via-amber-800/10 to-transparent',
    border: 'border-amber-700/40'
  },
};

export default function Results() {
  const [results, setResults] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      if (!supabase) { setLoading(false); return; }
      
      let resultsData = [];
      const { data: viewData, error } = await supabase
        .from('results_view')
        .select('*')
        .order('event_name')
        .order('position');

      if (!error && viewData && viewData.length > 0) {
        resultsData = viewData;
      } else {
        // Fallback: compute results in frontend from submitted evaluations
        const { data: evals } = await supabase
          .from('evaluations')
          .select('*, participants(id, name, registration_id), events(id, name, category)')
          .eq('status', 'submitted');

        if (evals && evals.length > 0) {
          const grouped = {};
          evals.forEach(ev => {
            const key = `${ev.participant_id}_${ev.event_id}`;
            if (!grouped[key]) {
              grouped[key] = {
                participant_id: ev.participant_id,
                participant_name: ev.participants?.name,
                registration_id: ev.participants?.registration_id,
                event_id: ev.event_id,
                event_name: ev.events?.name,
                event_category: ev.events?.category,
                scores: [],
              };
            }
            grouped[key].scores.push(Number(ev.total_score) || 0);
          });

          const flatResults = Object.values(grouped).map(g => ({
            ...g,
            final_score: Math.round((g.scores.reduce((a, b) => a + b, 0) / g.scores.length) * 100) / 100,
            num_judges: g.scores.length,
          }));

          const byEvent = {};
          flatResults.forEach(r => {
            if (!byEvent[r.event_id]) byEvent[r.event_id] = [];
            byEvent[r.event_id].push(r);
          });

          resultsData = [];
          Object.values(byEvent).forEach(eventResults => {
            eventResults.sort((a, b) => b.final_score - a.final_score);
            let rank = 0;
            let prevScore = null;
            eventResults.forEach((r, i) => {
              if (r.final_score !== prevScore) { rank = i + 1; prevScore = r.final_score; }
              resultsData.push({ ...r, position: rank });
            });
          });
        }
      }

      setResults(resultsData);

      const { data: eventsData } = await supabase.from('events').select('id, name').order('name');
      setEvents(eventsData || []);
    } catch (err) {
      console.error('Failed to load results:', err);
    } finally {
      setLoading(false);
    }
  }

  async function showDetails(participantId, participantName) {
    try {
      const { data: evals } = await supabase
        .from('evaluations')
        .select('*, judges(name, organization), scores(marks, criteria(name, max_marks))')
        .eq('participant_id', participantId)
        .eq('status', 'submitted');

      setDetailModal({
        participant_name: participantName,
        evaluations: evals || []
      });
    } catch (err) {
      console.error('Failed to load evaluation score sheet:', err);
    }
  }

  function handleExport() {
    if (!filteredResults.length) return;
    const exportData = filteredResults.map(r => ({
      Rank: r.position,
      Event: r.event_name,
      Category: r.event_category,
      Team: r.participant_name,
      RegistrationID: r.registration_id,
      FinalScore: r.final_score,
      JudgesEvaluated: r.num_judges,
    }));
    exportToCSV(exportData, `TechTatva_Results_${selectedEvent ? 'Filtered' : 'All'}`);
  }

  const filteredResults = selectedEvent
    ? results.filter(r => r.event_id === selectedEvent)
    : results;

  const eventGroups = {};
  filteredResults.forEach(r => {
    if (!eventGroups[r.event_id]) {
      eventGroups[r.event_id] = {
        event_name: r.event_name,
        event_category: r.event_category,
        results: []
      };
    }
    eventGroups[r.event_id].results.push(r);
  });

  if (loading) return <LoadingSpinner label="Compiling leaderboard standings..." />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-white tracking-tight">Official Standings & Leaderboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Realtime weighted ranking derived from verified judge evaluations
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedEvent}
            onChange={e => setSelectedEvent(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Fest Tracks</option>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>

          {filteredResults.length > 0 && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-semibold text-xs transition-colors shrink-0"
              title="Download results as CSV"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <EmptyState
          title="No Published Results Yet"
          description="Scores will calculate automatically as judges submit and finalize their rubric evaluations."
          icon={Trophy}
        />
      ) : (
        <div className="space-y-10">
          {Object.entries(eventGroups).map(([eventId, group]) => {
            const topThree = group.results.slice(0, 3);
            return (
              <div key={eventId} className="space-y-4">
                {/* Event Title Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-glow-amber">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-bold text-white tracking-tight">{group.event_name}</h2>
                      <p className="text-xs text-slate-400">{group.results.length} ranked entries</p>
                    </div>
                  </div>
                  <Badge variant="purple">{group.event_category || 'Technical'}</Badge>
                </div>

                {/* Podium Stage for Top 3 */}
                {topThree.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {/* Rank 2 (Silver) */}
                    {topThree[1] && (
                      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-400/30 p-5 backdrop-blur-xl shadow-lg order-2 md:order-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">🥈</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            2nd Place
                          </span>
                        </div>
                        <div>
                          <p className="font-display font-extrabold text-base text-white">{topThree[1].participant_name}</p>
                          <p className="font-mono text-xs text-slate-400">{topThree[1].registration_id}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-medium">Final Score</span>
                          <span className="font-display font-extrabold text-lg text-slate-200 font-mono">{topThree[1].final_score}</span>
                        </div>
                      </div>
                    )}

                    {/* Rank 1 (Gold - Elevated) */}
                    {topThree[0] && (
                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-amber-500/15 via-slate-900/90 to-slate-900/90 border border-amber-500/40 p-6 backdrop-blur-xl shadow-glow-amber order-1 md:order-2 flex flex-col justify-between md:-translate-y-2">
                        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-amber-500/20 rounded-full blur-xl pointer-events-none" />
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-3xl">🥇</span>
                            <Crown size={18} className="text-amber-400 animate-pulse" />
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Champion
                          </span>
                        </div>
                        <div>
                          <p className="font-display font-black text-lg text-white">{topThree[0].participant_name}</p>
                          <p className="font-mono text-xs text-amber-300/80">{topThree[0].registration_id}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between">
                          <span className="text-xs text-amber-200/80 font-semibold">Final Score</span>
                          <span className="font-display font-black text-2xl text-amber-300 font-mono">{topThree[0].final_score}</span>
                        </div>
                      </div>
                    )}

                    {/* Rank 3 (Bronze) */}
                    {topThree[2] && (
                      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-amber-700/30 p-5 backdrop-blur-xl shadow-lg order-3 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">🥉</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-amber-400 border border-amber-700/40">
                            3rd Place
                          </span>
                        </div>
                        <div>
                          <p className="font-display font-extrabold text-base text-white">{topThree[2].participant_name}</p>
                          <p className="font-mono text-xs text-slate-400">{topThree[2].registration_id}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-medium">Final Score</span>
                          <span className="font-display font-extrabold text-lg text-amber-400 font-mono">{topThree[2].final_score}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Complete Leaderboard Table */}
                <div className="overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-950/60 border-b border-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <tr>
                          <th className="px-6 py-4">Position</th>
                          <th className="px-6 py-4">Team / Competitor</th>
                          <th className="px-6 py-4">Registration ID</th>
                          <th className="px-6 py-4 text-center">Final Score</th>
                          <th className="px-6 py-4 text-center">Judges Polled</th>
                          <th className="px-6 py-4 text-right">Score Sheet</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {group.results.map(r => {
                          const ps = positionStyle[r.position];
                          return (
                            <tr key={r.participant_id} className={`hover:bg-slate-800/40 transition-colors ${r.position <= 3 ? 'bg-slate-900/40' : ''}`}>
                              <td className="px-6 py-4">
                                {ps ? (
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${ps.badge}`}>
                                    <span>{ps.emoji}</span>
                                    <span>#{r.position}</span>
                                  </span>
                                ) : (
                                  <span className="font-mono text-xs font-bold text-slate-400 px-3 py-1">
                                    #{r.position}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 font-semibold text-white">
                                {r.participant_name}
                              </td>
                              <td className="px-6 py-4 font-mono text-xs text-slate-400">
                                {r.registration_id || '—'}
                              </td>
                              <td className="px-6 py-4 text-center font-display font-extrabold text-indigo-400 font-mono text-base">
                                {r.final_score}
                              </td>
                              <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs">
                                {r.num_judges}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => showDetails(r.participant_id, r.participant_name)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors"
                                >
                                  <Eye size={14} /> View Breakdown
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Score Breakdown Modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={`Evaluation Score Sheet — ${detailModal?.participant_name || ''}`}
        size="lg"
      >
        {detailModal && detailModal.evaluations.length > 0 ? (
          <div className="space-y-5">
            {detailModal.evaluations.map((ev, i) => (
              <div key={ev.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <div>
                    <h4 className="font-semibold text-sm text-white">
                      {ev.judges?.name || `Judge ${i + 1}`}
                    </h4>
                    {ev.judges?.organization && (
                      <p className="text-xs text-slate-400">{ev.judges.organization}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-display font-extrabold text-base text-indigo-400 font-mono">
                      {ev.total_score} pts
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800/60">
                        <th className="text-left py-2 font-semibold">Criterion</th>
                        <th className="text-center py-2 font-semibold">Awarded</th>
                        <th className="text-center py-2 font-semibold">Maximum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {(ev.scores || []).map((s, j) => (
                        <tr key={j}>
                          <td className="py-2 text-slate-300 font-medium">{s.criteria?.name || '—'}</td>
                          <td className="py-2 text-center font-bold text-white font-mono">{s.marks}</td>
                          <td className="py-2 text-center text-slate-500 font-mono">{s.criteria?.max_marks || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {ev.remarks && (
                  <div className="pt-2 border-t border-slate-800/60">
                    <p className="text-xs text-slate-400 italic">
                      Judge remarks: "{ev.remarks}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 py-4 text-center">
            No itemized evaluation breakdowns recorded yet for this participant.
          </p>
        )}
      </Modal>
    </div>
  );
}
