import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { Trophy, Eye, Medal } from 'lucide-react';

const positionStyle = {
  1: { emoji: '🥇', className: 'text-yellow-600 font-bold' },
  2: { emoji: '🥈', className: 'text-gray-500 font-bold' },
  3: { emoji: '🥉', className: 'text-amber-700 font-bold' },
};

export default function Results() {
  const [results, setResults] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState(null); // { participant_name, scores: [] }

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);

    // Try the results_view first
    let resultsData = [];
    const { data: viewData, error } = await supabase
      .from('results_view')
      .select('*')
      .order('event_name')
      .order('position');

    if (!error && viewData && viewData.length > 0) {
      resultsData = viewData;
    } else {
      // Fallback: compute results in frontend
      const { data: evals } = await supabase
        .from('evaluations')
        .select('*, participants(id, name, registration_id), events(id, name, category)')
        .eq('status', 'submitted');

      if (evals && evals.length > 0) {
        // Group by participant + event
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
          grouped[key].scores.push(Number(ev.total_score));
        });

        // Calculate averages
        let flatResults = Object.values(grouped).map(g => ({
          ...g,
          final_score: Math.round((g.scores.reduce((a, b) => a + b, 0) / g.scores.length) * 100) / 100,
          num_judges: g.scores.length,
        }));

        // Rank within each event
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

    // Get events list
    const { data: eventsData } = await supabase.from('events').select('id, name').order('name');
    setEvents(eventsData || []);

    setLoading(false);
  }

  async function showDetails(participantId, participantName) {
    const { data: evals } = await supabase
      .from('evaluations')
      .select('*, judges(name), scores(marks, criteria(name, max_marks))')
      .eq('participant_id', participantId)
      .eq('status', 'submitted');

    setDetailModal({
      participant_name: participantName,
      evaluations: evals || []
    });
  }

  // Group results by event
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

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Results</h1>
        <select
          value={selectedEvent}
          onChange={e => setSelectedEvent(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Events</option>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>
      </div>

      {filteredResults.length === 0 ? (
        <EmptyState
          title="No results yet"
          description="Evaluations need to be submitted before results can be calculated."
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(eventGroups).map(([eventId, group]) => (
            <div key={eventId}>
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="text-indigo-600" size={22} />
                <h2 className="text-lg font-semibold text-gray-800">{group.event_name}</h2>
                <Badge variant="info">{group.event_category}</Badge>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg. ID</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Final Score</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Judges</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {group.results.map(r => {
                        const ps = positionStyle[r.position];
                        return (
                          <tr key={r.participant_id} className={`hover:bg-gray-50 ${r.position <= 3 ? 'bg-yellow-50/30' : ''}`}>
                            <td className={`px-6 py-4 ${ps?.className || 'text-gray-600'}`}>
                              {ps ? `${ps.emoji} #${r.position}` : `#${r.position}`}
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">{r.participant_name}</td>
                            <td className="px-6 py-4 text-gray-600 font-mono text-sm">{r.registration_id}</td>
                            <td className="px-6 py-4 text-center font-bold text-indigo-700">{r.final_score}</td>
                            <td className="px-6 py-4 text-center text-gray-500">{r.num_judges}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => showDetails(r.participant_id, r.participant_name)}
                                className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1 text-sm font-medium"
                              >
                                <Eye size={14} /> View
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
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={`Judge Scores — ${detailModal?.participant_name || ''}`}
        size="lg"
      >
        {detailModal && detailModal.evaluations.length > 0 ? (
          <div className="space-y-4">
            {detailModal.evaluations.map((ev, i) => (
              <div key={ev.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-900">{ev.judges?.name || `Judge ${i + 1}`}</h4>
                  <span className="text-lg font-bold text-indigo-700">Total: {ev.total_score}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b">
                        <th className="text-left py-2 font-medium">Criterion</th>
                        <th className="text-center py-2 font-medium">Marks</th>
                        <th className="text-center py-2 font-medium">Max</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(ev.scores || []).map((s, j) => (
                        <tr key={j} className="border-b last:border-0">
                          <td className="py-2 text-gray-700">{s.criteria?.name || '—'}</td>
                          <td className="py-2 text-center font-medium">{s.marks}</td>
                          <td className="py-2 text-center text-gray-400">{s.criteria?.max_marks || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {ev.remarks && (
                  <p className="mt-2 text-sm text-gray-500 italic">Remarks: {ev.remarks}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No evaluation details available.</p>
        )}
      </Modal>
    </div>
  );
}
