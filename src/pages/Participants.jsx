import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2, Search, UserCheck, School, Hash, Calendar, Award } from 'lucide-react';

const emptyForm = { name: '', registration_id: '', event_id: '', category: 'Technical', college: '' };

export default function Participants() {
  const [items, setItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { 
    fetchItems(); 
    fetchEvents(); 
  }, []);

  async function fetchItems() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.from('participants').select('*, events(id, name)').order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching participants:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEvents() {
    try {
      const { data } = await supabase.from('events').select('id, name').order('name');
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  }

  function openAdd() {
    setEditingItem(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setForm({
      name: item.name, 
      registration_id: item.registration_id || '',
      event_id: item.event_id || '', 
      category: item.category || 'Technical', 
      college: item.college || ''
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await supabase.from('participants').update(form).eq('id', editingItem.id);
      } else {
        await supabase.from('participants').insert(form);
      }
      setShowModal(false);
      await fetchItems();
    } catch (err) {
      console.error('Error saving participant:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      await supabase.from('participants').delete().eq('id', deleteConfirm.id);
      setDeleteConfirm(null);
      await fetchItems();
    } catch (err) {
      console.error('Error deleting participant:', err);
    }
  }

  const filtered = items.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.registration_id && i.registration_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.college && i.college.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesEvent = !selectedEventFilter || i.event_id === selectedEventFilter;
    return matchesSearch && matchesEvent;
  });

  if (loading) return <LoadingSpinner label="Fetching participant rosters..." />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-white tracking-tight">Participants & Teams</h1>
          <p className="text-xs text-slate-400 mt-1">Manage competitor credentials, collegiate representation, and event bindings</p>
        </div>
        <button 
          onClick={openAdd} 
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all duration-200 active:scale-95"
        >
          <Plus size={18} /> Add Participant
        </button>
      </div>

      {/* Search & Event Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search by team name, reg ID, or college..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedEventFilter}
            onChange={e => setSelectedEventFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 text-xs font-semibold focus:border-indigo-500 focus:outline-none"
          >
            <option value="" className="bg-slate-900">All Registered Events</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id} className="bg-slate-900">{ev.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Participants Table */}
      {filtered.length === 0 ? (
        <EmptyState 
          title="No participants found" 
          description={searchTerm || selectedEventFilter ? "No competitors matched your search criteria." : "Register participant teams to begin event scheduling and evaluation."} 
          actionLabel="Add Participant" 
          onAction={openAdd}
          icon={UserCheck} 
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 border-b border-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Reg ID</th>
                  <th className="px-6 py-4">Team / Participant</th>
                  <th className="px-6 py-4">College / University</th>
                  <th className="px-6 py-4">Registered Event</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                        {item.registration_id || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <School size={14} className="text-slate-500 shrink-0" />
                        <span className="truncate">{item.college || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                        <Award size={12} className="text-purple-400" />
                        {item.events?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openEdit(item)} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                        title="Edit Participant"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(item)} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete Participant"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Participant Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Participant Details' : 'Register Participant'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Team / Participant Name *
              </label>
              <input 
                required 
                type="text" 
                placeholder="e.g. Team Alpha"
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Registration ID *
              </label>
              <input 
                required 
                type="text" 
                placeholder="e.g. REG001"
                value={form.registration_id} 
                onChange={e => setForm({ ...form, registration_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Target Event *
            </label>
            <select 
              required
              value={form.event_id} 
              onChange={e => setForm({ ...form, event_id: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="" className="bg-slate-900">-- Choose Event Track --</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id} className="bg-slate-900">{ev.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">College / Institution</label>
            <input 
              type="text" 
              placeholder="e.g. National Institute of Technology"
              value={form.college} 
              onChange={e => setForm({ ...form, college: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button 
              type="button" 
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : (editingItem ? 'Save Changes' : 'Register')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Remove Participant"
        message={`Are you sure you want to remove "${deleteConfirm?.name}"? Any recorded judging evaluations for this participant will also be removed.`}
        confirmLabel="Remove Participant"
        variant="danger"
      />
    </div>
  );
}
