import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { 
  Save, 
  Send, 
  RotateCcw, 
  ClipboardCheck, 
  UserCheck, 
  CheckCircle, 
  Lock, 
  Sparkles, 
  Award,
  AlertCircle
} from 'lucide-react';

const statusBadge = { 
  pending: 'warning', 
  in_progress: 'info', 
  draft: 'info', 
  submitted: 'success' 
};

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
      try {
        if (!supabase) { setLoading(false); return; }
        const [jRes, eRes] = await Promise.all([
          supabase.from('judges').select('id, name, assigned_event_id').order('name'),
          supabase.from('events').select('id, name').order('name')
        ]);
        setJudges(jRes.data || []);
        setEvents(eRes.data || []);
      } catch (err) {
        console.error('Failed to initialize judging faculty/events:', err);
      } finally {
        setLoading(false);
      }
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

    try {
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
    } catch (err) {
      console.error('Error loading evaluation data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedJudge, selectedEvent]);

  useEffect(() => {
    if (selectedJudge && selectedEvent) loadEvaluations();
  }, [selectedJudge, selectedEvent, loadEvaluations]);

  function handleMarkChange(participantId, criteriaId, value, maxMarks) {
    const numeric = parseFloat(value);
    const clamped = isNaN(numeric) ? 0 : Math.min(Math.max(0, numeric), maxMarks);
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
        const { data, error } = await supabase.from('evaluations').insert({
          judge_id: selectedJudge,
          participant_id: participantId,
          event_id: selectedEvent,
          total_score: entry.totalScore,
          remarks: entry.remarks,
          status: 'in_progress'
        }).select('id').single();
        if (error) throw error;
        evalId = data.id;
      } else {
        const { error } = await supabase.from('evaluations').update({
          total_score: entry.totalScore,
          remarks: entry.remarks,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        }).eq('id', evalId);
        if (error) throw error;
      }

      // Upsert individual criterion scores
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
      console.error('Save draft error:', err);
    } finally {
      setSaving(prev => ({ ...prev, [participantId]: false }));
    }
  }

  async function submitEvaluation(participantId) {
    setSaving(prev => ({ ...prev, [participantId]: true }));
    const entry = evalData[participantId];
    try {
      let evalId = entry.evaluationId;
      if (!evalId) {
        const { data, error } = await supabase.from('evaluations').insert({
          judge_id: selectedJudge,
          participant_id: participantId,
          event_id: selectedEvent,
          total_score: entry.totalScore,
          remarks: entry.remarks,
          status: 'submitted'
        }).select('id').single();
        if (error) throw error;
        evalId = data.id;
      } else {
        const { error } = await supabase.from('evaluations').update({
          total_score: entry.totalScore,
          remarks: entry.remarks,
          status: 'submitted',
          updated_at: new Date().toISOString()
        }).eq('id', evalId);
        if (error) throw error;
      }

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
      console.error('Submit evaluation error:', err);
    } finally {
      setSaving(prev => ({ ...prev, [participantId]: false }));
    }
  }

  async function reopenEvaluation(participantId) {
    const entry = evalData[participantId];
    if (!entry.evaluationId) return;
    try {
      await supabase.from('evaluations').update({
        status: 'in_progress',
        updated_at: new Date().toISOString()
      }).eq('id', entry.evaluationId);
      await loadEvaluations();
    } catch (err) {
      console.error('Reopen evaluation error:', err);
    }
  }

  function handleConfirm() {
    if (!confirmAction) return;
    if (confirmAction.type === 'submit') submitEvaluation(confirmAction.participantId);
    if (confirmAction.type === 'reopen') reopenEvaluation(confirmAction.participantId);
    setConfirmAction(null);
  }

  if (loading && judges.length === 0) return <LoadingSpinner label="Initializing judging portal..." />;

  const maxTotal = criteria.reduce((sum, c) => sum + Number(c.max_marks || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div>
        <h1 className="font-display text-2xl font-black text-white tracking-tight">Judging Terminal</h1>
        <p className="text-xs text-slate-400 mt-1">
          Realtime rubric grading, marks verification, score locking, and official submission
        </p>
      </div>

      {/* Selector Console: Judge & Event */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Step 1: Authenticate Active Judge
            </label>
            <select 
              value={selectedJudge} 
              onChange={e => handleJudgeChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
            >
              <option value="" className="bg-slate-900">-- Select Judge Profile --</option>
              {judges.map(j => (
                <option key={j.id} value={j.id} className="bg-slate-900">
                  {j.name} {j.organization ? `(${j.organization})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Step 2: Event Evaluation Track
            </label>
            <select 
              value={selectedEvent} 
              onChange={e => {
                setSelectedEvent(e.target.value);
                setParticipants([]);
                setEvalData({});
              }}
              disabled={!selectedJudge}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:opacity-40 transition-colors"
            >
              <option value="" className="bg-slate-900">-- Select Event Track --</option>
              {events.map(e => (
                <option key={e.id} value={e.id} className="bg-slate-900">{e.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Criteria Tags Strip */}
        {criteria.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-2">Evaluation Rubric:</span>
            {criteria.map(c => (
              <span key={c.id} className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {c.name}: <strong className="text-white font-mono">{c.max_marks} pts</strong>
              </span>
            ))}
            <span className="ml-auto text-xs font-bold text-slate-300 font-mono">
              Max Total: {maxTotal} pts
            </span>
          </div>
        )}
      </div>

      {/* Main Judging Area */}
      {!selectedJudge || !selectedEvent ? (
        <EmptyState 
          title="Terminal Inactive" 
          description="Select both a judge profile and an event track above to pull candidate participant rosters." 
          icon={ClipboardCheck} 
        />
      ) : loading ? (
        <LoadingSpinner label="Loading participant rubrics..." />
      ) : participants.length === 0 ? (
        <EmptyState 
          title="No Teams Enrolled" 
          description="No participants have registered for this event yet." 
          icon={UserCheck} 
        />
      ) : (
        <div className="space-y-6">
          {participants.map(p => {
            const entry = evalData[p.id] || { scores: {}, totalScore: 0, remarks: '', status: 'pending' };
            const isSubmitted = entry.status === 'submitted';
            const isSaving = saving[p.id];
            const percent = maxTotal > 0 ? Math.round((entry.totalScore / maxTotal) * 100) : 0;

            return (
              <div 
                key={p.id} 
                className={`rounded-2xl border transition-all duration-200 overflow-hidden backdrop-blur-xl ${
                  isSubmitted 
                    ? 'bg-slate-900/60 border-emerald-500/30 shadow-lg shadow-emerald-500/5' 
                    : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700/80 shadow-xl'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-800/60 gap-3 bg-slate-950/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-display font-bold text-indigo-400">
                      {p.registration_id ? p.registration_id.slice(-3) : '#'}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-white">{p.name}</h3>
                      <p className="text-xs text-slate-400">{p.college || 'Independent Competitor'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={statusBadge[entry.status] || 'neutral'}>
                      {entry.status === 'in_progress' ? 'Draft Saved' : entry.status}
                    </Badge>
                    <div className="text-right">
                      <span className="font-display text-xl font-black text-white font-mono">
                        {entry.totalScore}
                      </span>
                      <span className="text-xs text-slate-400 font-mono"> / {maxTotal}</span>
                      <span className="ml-1.5 text-xs font-semibold text-indigo-400">({percent}%)</span>
                    </div>
                  </div>
                </div>

                {/* Rubric Criteria Inputs / View */}
                <div className="p-6 space-y-6">
                  {criteria.length === 0 ? (
                    <p className="text-xs text-amber-400">⚠️ No criteria configured for this event. Configure criteria in schema.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {criteria.map(c => {
                        const currentMark = entry.scores[c.id] ?? 0;
                        return (
                          <div key={c.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-slate-300">{c.name}</span>
                              <span className="font-mono text-slate-400">Max: {c.max_marks}</span>
                            </div>

                            {isSubmitted ? (
                              <div className="flex items-center justify-between pt-1">
                                <div className="w-full bg-slate-800 rounded-full h-2 mr-3 overflow-hidden">
                                  <div 
                                    className="bg-emerald-500 h-2 rounded-full" 
                                    style={{ width: `${Math.min(100, (currentMark / c.max_marks) * 100)}%` }} 
                                  />
                                </div>
                                <span className="font-mono font-bold text-sm text-emerald-400 shrink-0">
                                  {currentMark}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  min="0"
                                  max={c.max_marks}
                                  step="0.5"
                                  value={currentMark}
                                  onChange={e => handleMarkChange(p.id, c.id, e.target.value, c.max_marks)}
                                  className="w-full accent-indigo-500 cursor-pointer"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  max={c.max_marks}
                                  step="0.5"
                                  value={currentMark}
                                  onChange={e => handleMarkChange(p.id, c.id, e.target.value, c.max_marks)}
                                  className="w-16 px-2.5 py-1 text-center font-mono font-bold text-sm rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Remarks Field */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Deliberation Remarks & Judge Feedback
                    </label>
                    {isSubmitted ? (
                      <p className="text-sm text-slate-300 italic p-3 rounded-xl bg-slate-950/40 border border-slate-800/40">
                        {entry.remarks ? `"${entry.remarks}"` : 'No written commentary provided.'}
                      </p>
                    ) : (
                      <textarea
                        rows={2}
                        placeholder="Constructive feedback, technical highlights, strengths or weaknesses..."
                        value={entry.remarks}
                        onChange={e => handleRemarksChange(p.id, e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between p-4 px-6 border-t border-slate-800/60 bg-slate-950/40">
                  {isSubmitted ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                        <CheckCircle size={16} />
                        <span>Submitted & Locked by Judge</span>
                      </div>
                      <button
                        onClick={() => setConfirmAction({ type: 'reopen', participantId: p.id })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:bg-amber-500/10 rounded-xl font-semibold transition-colors"
                      >
                        <RotateCcw size={13} /> Reopen (Admin Edit)
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-3 w-full">
                      <button
                        onClick={() => saveDraft(p.id)}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-xl transition-all disabled:opacity-50"
                      >
                        <Save size={14} /> {isSaving ? 'Saving...' : 'Save Draft'}
                      </button>
                      <button
                        onClick={() => setConfirmAction({ type: 'submit', participantId: p.id })}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        <Send size={14} /> Submit Final
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={confirmAction?.type === 'submit' ? 'Lock & Submit Evaluation' : 'Reopen Evaluation Session'}
        message={
          confirmAction?.type === 'submit'
            ? 'Are you ready to lock these scores? After submission, this evaluation cannot be edited without administrator override.'
            : 'Reopening will allow the judge or coordinator to modify individual marks and remarks.'
        }
        confirmLabel={confirmAction?.type === 'submit' ? 'Confirm Submission' : 'Reopen Session'}
        variant={confirmAction?.type === 'submit' ? 'info' : 'warning'}
      />
    </div>
  );
}
