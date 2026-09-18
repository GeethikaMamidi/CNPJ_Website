import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Save, Send, RotateCcw } from 'lucide-react';

const statusBadge = { pending: 'warning', in_progress: 'info', submitted: 'success' };

export default function Judging() {
  const [judges, setJudges] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedJudge, setSelectedJudge] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [participants, setParticipants] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [evalData, setEvalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [confirmAction, setConfirmAction] = useState(null); // { type, participantId }

  useEffect(() => {
    (async () => {
      const [jRes, eRes] = await Promise.all([
        supabase.from('judges').select('id, name, assigned_event_id').order('name'),
        supabase.from('events').select('id, name').order('name')
      ]);
      setJudges(jRes.data || []);
      setEvents(eRes.data || []);
      setLoading(false);
    })();
  }, []);

  // When judge changes, pre-select their assigned event
  function handleJudgeChange(judgeId) {
    setSelectedJudge(judgeId);
    setSelectedEvent('');
    setParticipants([]);
    setEvalData({});
    if (judgeId) {
      const judge = judges.find(j => j.id === judgeId);
      if (judge?.assigned_event_id) {
        setSelectedEvent(judge.assigned_event_id);
      }
    }
  }

  // Load participants, criteria, and evaluations when event is selected
  const loadEvaluations = useCallback(async () => {
    if (!selectedJudge || !selectedEvent) return;
    setLoading(true);

    const [pRes, cRes, evRes] = await Promise.all([
      supabase.from('participants').select('*').eq('event_id', selectedEvent).order('name'),
      supabase.from('criteria').select('*').eq('event_id', selectedEvent).order('created_at'),
      supabase.from('evaluations').select('*, scores(criteria_id, marks)')
        .eq('judge_id', selectedJudge).eq('event_id', selectedEvent)
    ]);

    const parts = pRes.data || [];
    const crits = cRes.data || [];
    const evals = evRes.data || [];

    setParticipants(parts);
    setCriteria(crits);

    // Build evaluation state keyed by participant_id
    const ed = {};
    parts.forEach(p => {
      const existing = evals.find(e => e.participant_id === p.id);
      if (existing) {
        const scoreMap = {};
        (existing.scores || []).forEach(s => { scoreMap[s.criteria_id] = Number(s.marks); });
        const total = crits.reduce((sum, c) => sum + (scoreMap[c.id] || 0), 0);
        ed[p.id] = {
          evaluationId: existing.id,
          scores: scoreMap,
          remarks: existing.remarks || '',
          status: existing.status,
          totalScore: total
        };
      } else {
        const scoreMap = {};
        crits.forEach(c => { scoreMap[c.id] = 0; });
        ed[p.id] = {
          evaluationId: null,
          scores: scoreMap,
          remarks: '',
          status: 'pending',
          totalScore: 0
        };
      }
    });
    setEvalData(ed);
    setLoading(false);
  }, [selectedJudge, selectedEvent]);

  useEffect(() => {
    if (selectedJudge && selectedEvent) loadEvaluations();
  }, [selectedJudge, selectedEvent, loadEvaluations]);

  function handleMarkChange(participantId, criteriaId, value, maxMarks) {
    const clamped = Math.min(Math.max(0, Number(value) || 0), maxMarks);
    setEvalData(prev => {
      const entry = { ...prev[participantId] };
      entry.scores = { ...entry.scores, [criteriaId]: clamped };
      entry.totalScore = criteria.reduce((sum, c) => sum + (entry.scores[c.id] || 0), 0);
      return { ...prev, [participantId]: entry };
    });
  }

  function handleRemarksChange(participantId, value) {
    setEvalData(prev => ({
      ...prev,
      [participantId]: { ...prev[participantId], remarks: value }
    }));
  }

  async function saveDraft(participantId) {
    setSaving(prev => ({ ...prev, [participantId]: true }));
    const entry = evalData[participantId];
    try {
      let evalId = entry.evaluationId;
      if (!evalId) {
        // Insert new evaluation
        const { data } = await supabase.from('evaluations').insert({
          judge_id: selectedJudge,
          participant_id: participantId,
          event_id: selectedEvent,
          total_score: entry.totalScore,
          remarks: entry.remarks,
          status: 'in_progress'
        }).select('id').single();
        evalId = data.id;
      } else {
        // Update existing evaluation
        await supabase.from('evaluations').update({
          total_score: entry.totalScore,
          remarks: entry.remarks,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        }).eq('id', evalId);
      }

      // Upsert scores
      const scoreRows = criteria.map(c => ({
        evaluation_id: evalId,
        criteria_id: c.id,
        marks: entry.scores[c.id] || 0
      }));

      for (const row of scoreRows) {
        const { data: existing } = await supabase.from('scores')
          .select('id').eq('evaluation_id', row.evaluation_id).eq('criteria_id', row.criteria_id).maybeSingle();
        if (existing) {
          await supabase.from('scores').update({ marks: row.marks }).eq('id', existing.id);
        } else {
          await supabase.from('scores').insert(row);
        }
      }

      // Refresh
      await loadEvaluations();
    } catch (err) {
      console.error('Save draft error:', err);
    }
    setSaving(prev => ({ ...prev, [participantId]: false }));
  }

  async function submitEvaluation(participantId) {
    setSaving(prev => ({ ...prev, [participantId]: true }));
    const entry = evalData[participantId];
    try {
      let evalId = entry.evaluationId;
      if (!evalId) {
        const { data } = await supabase.from('evaluations').insert({
          judge_id: selectedJudge,
          participant_id: participantId,
          event_id: selectedEvent,
          total_score: entry.totalScore,
          remarks: entry.remarks,
          status: 'submitted'
        }).select('id').single();
        evalId = data.id;
      } else {
        await supabase.from('evaluations').update({
          total_score: entry.totalScore,
          remarks: entry.remarks,
          status: 'submitted',
          updated_at: new Date().toISOString()
        }).eq('id', evalId);
      }

      // Upsert scores
      const scoreRows = criteria.map(c => ({
        evaluation_id: evalId,
        criteria_id: c.id,
        marks: entry.scores[c.id] || 0
      }));

      for (const row of scoreRows) {
        const { data: existing } = await supabase.from('scores')
          .select('id').eq('evaluation_id', row.evaluation_id).eq('criteria_id', row.criteria_id).maybeSingle();
        if (existing) {
          await supabase.from('scores').update({ marks: row.marks }).eq('id', existing.id);
        } else {
          await supabase.from('scores').insert(row);
        }
      }

      await loadEvaluations();
    } catch (err) {
      console.error('Submit error:', err);
    }
    setSaving(prev => ({ ...prev, [participantId]: false }));
  }

  async function reopenEvaluation(participantId) {
    const entry = evalData[participantId];
    if (!entry.evaluationId) return;
    await supabase.from('evaluations').update({
      status: 'in_progress',
      updated_at: new Date().toISOString()
    }).eq('id', entry.evaluationId);
    await loadEvaluations();
  }

  function handleConfirm() {
    if (!confirmAction) return;
    if (confirmAction.type === 'submit') submitEvaluation(confirmAction.participantId);
    if (confirmAction.type === 'reopen') reopenEvaluation(confirmAction.participantId);
    setConfirmAction(null);
  }

  if (loading && judges.length === 0) return <LoadingSpinner />;

  const maxTotal = criteria.reduce((sum, c) => sum + c.max_marks, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Judging</h1>

      {/* Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Judge</label>
            <select value={selectedJudge} onChange={e => handleJudgeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">— Choose a judge —</option>
              {judges.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Event</label>
            <select value={selectedEvent} onChange={e => { setSelectedEvent(e.target.value); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!selectedJudge}>
              <option value="">— Choose an event —</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {!selectedJudge || !selectedEvent ? (
        <EmptyState title="Select a Judge and Event" description="Choose a judge and event above to start evaluating participants." />
      ) : loading ? (
        <LoadingSpinner />
      ) : participants.length === 0 ? (
        <EmptyState title="No participants" description="There are no participants registered for this event." />
      ) : criteria.length === 0 ? (
        <EmptyState title="No criteria defined" description="Add judging criteria for this event before evaluating." />
      ) : (
        <div className="space-y-6">
          {participants.map(p => {
            const entry = evalData[p.id];
            if (!entry) return null;
            const isSubmitted = entry.status === 'submitted';
            const isSaving = saving[p.id];

            return (
              <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {/* Header */}
                <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
                    <p className="text-sm text-gray-500">Reg: {p.registration_id} {p.college && `• ${p.college}`}</p>
                  </div>
                  <Badge variant={statusBadge[entry.status]}>{entry.status.replace('_', ' ')}</Badge>
                </div>

                {/* Criteria Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                  {criteria.map(c => (
                    <div key={c.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{c.name}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={c.max_marks}
                          value={entry.scores[c.id] ?? 0}
                          onChange={e => handleMarkChange(p.id, c.id, e.target.value, c.max_marks)}
                          disabled={isSubmitted}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${isSubmitted ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                        />
                        <span className="text-sm text-gray-400 whitespace-nowrap">/ {c.max_marks}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total & Remarks */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                  <div className="bg-indigo-50 rounded-lg p-4 flex items-center justify-between">
                    <span className="font-medium text-indigo-900">Total Score</span>
                    <span className="text-2xl font-bold text-indigo-700">{entry.totalScore} <span className="text-sm font-normal text-indigo-400">/ {maxTotal}</span></span>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <textarea
                      value={entry.remarks}
                      onChange={e => handleRemarksChange(p.id, e.target.value)}
                      disabled={isSubmitted}
                      rows={2}
                      placeholder="Optional remarks..."
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${isSubmitted ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  {isSubmitted ? (
                    <>
                      <span className="flex items-center gap-1 text-green-600 font-medium text-sm">
                        <CheckCircle size={16} /> Submitted
                      </span>
                      <button
                        onClick={() => setConfirmAction({ type: 'reopen', participantId: p.id })}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 font-medium"
                      >
                        <RotateCcw size={14} /> Reopen (Admin)
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => saveDraft(p.id)}
                        disabled={isSaving}
                        className="flex items-center gap-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
                      >
                        <Save size={14} /> {isSaving ? 'Saving...' : 'Save Draft'}
                      </button>
                      <button
                        onClick={() => setConfirmAction({ type: 'submit', participantId: p.id })}
                        disabled={isSaving}
                        className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
                      >
                        <Send size={14} /> Submit
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={confirmAction?.type === 'submit' ? 'Submit Evaluation' : 'Reopen Evaluation'}
        message={
          confirmAction?.type === 'submit'
            ? "Are you sure you want to submit this evaluation? You won't be able to edit it after submission."
            : 'Reopen this evaluation for editing? The judge will be able to modify their scores.'
        }
        confirmLabel={confirmAction?.type === 'submit' ? 'Submit' : 'Reopen'}
        variant={confirmAction?.type === 'submit' ? 'info' : 'warning'}
      />
    </div>
  );
}

// Small helper used in JSX
function CheckCircle({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}
