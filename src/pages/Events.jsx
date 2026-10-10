import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2, Search, Calendar, Filter, Sparkles } from 'lucide-react';

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Literary', 'Other'];
const STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'];
const statusBadge = { upcoming: 'info', ongoing: 'warning', completed: 'success', cancelled: 'danger' };

const emptyForm = { name: '', category: 'Technical', description: '', status: 'upcoming' };

export default function Events() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
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
      category: item.category || 'Technical', 
      description: item.description || '', 
      status: item.status || 'upcoming' 
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await supabase.from('events').update(form).eq('id', editingItem.id);
      } else {
        await supabase.from('events').insert(form);
      }
      setShowModal(false);
      await fetchItems();
    } catch (err) {
      console.error('Save event error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      await supabase.from('events').delete().eq('id', deleteConfirm.id);
      setDeleteConfirm(null);
      await fetchItems();
    } catch (err) {
      console.error('Delete event error:', err);
    }
  }

  const filtered = items.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.description && i.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || i.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <LoadingSpinner label="Loading festival events..." />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-white tracking-tight">Events Management</h1>
          <p className="text-xs text-slate-400 mt-1">Configure tracks, descriptions, and operational lifecycles</p>
        </div>
        <button 
          onClick={openAdd} 
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all duration-200 active:scale-95"
        >
          <Plus size={18} /> Add Event
        </button>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search events by name or topic..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <Filter size={14} className="text-slate-500 mr-1 shrink-0 hidden sm:block" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table / Grid */}
      {filtered.length === 0 ? (
        <EmptyState 
          title="No events found" 
          description={searchTerm || selectedCategory !== 'All' ? "Try adjusting your search criteria or category filter." : "Get started by adding your first tech fest event."} 
          actionLabel="Add Event" 
          onAction={openAdd}
          icon={Calendar} 
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 border-b border-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Event Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-white">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-400/80" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate">
                      {item.description || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusBadge[item.status] || 'neutral'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openEdit(item)} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                        title="Edit Event"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(item)} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete Event"
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

      {/* Add / Edit Event Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Event Details' : 'Create New Event'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Event Name *
            </label>
            <input 
              required 
              type="text" 
              placeholder="e.g. RoboWars, AI Hackathon"
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Category</label>
              <select 
                value={form.category} 
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Status</label>
              <select 
                value={form.status} 
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                {STATUSES.map(s => <option key={s} value={s} className="bg-slate-900 capitalize">{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Description</label>
            <textarea 
              rows={3} 
              placeholder="Outline event objectives, rounds, or rules..."
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })}
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
              {submitting ? 'Saving...' : (editingItem ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? All associated evaluations, criteria, and participants will be affected.`}
        confirmLabel="Delete Event"
        variant="danger"
      />
    </div>
  );
}
