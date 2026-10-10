import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2, Search, Users, Mail, Phone, Building, Briefcase, Award } from 'lucide-react';

const emptyForm = { name: '', email: '', phone: '', organization: '', designation: '', assigned_event_id: '' };

export default function Judges() {
  const [items, setItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState('');
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
      const { data, error } = await supabase.from('judges').select('*, events(id, name)').order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching judges:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEvents() {
    try {
      const { data } = await supabase.from('events').select('id, name').order('name');
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events for judge assignment:', err);
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
      email: item.email || '', 
      phone: item.phone || '',
      organization: item.organization || '', 
      designation: item.designation || '',
      assigned_event_id: item.assigned_event_id || ''
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSubmitting(true);
    const payload = { ...form, assigned_event_id: form.assigned_event_id || null };
    try {
      if (editingItem) {
        await supabase.from('judges').update(payload).eq('id', editingItem.id);
      } else {
        await supabase.from('judges').insert(payload);
      }
      setShowModal(false);
      await fetchItems();
    } catch (err) {
      console.error('Error saving judge:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      await supabase.from('judges').delete().eq('id', deleteConfirm.id);
      setDeleteConfirm(null);
      await fetchItems();
    } catch (err) {
      console.error('Error deleting judge:', err);
    }
  }

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.organization && i.organization.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (i.events?.name && i.events.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <LoadingSpinner label="Retrieving judging faculty..." />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-white tracking-tight">Judges Directory</h1>
          <p className="text-xs text-slate-400 mt-1">Manage external panelists, university professors, and assigned tracks</p>
        </div>
        <button 
          onClick={openAdd} 
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all duration-200 active:scale-95"
        >
          <Plus size={18} /> Add Judge
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search judges by name, org, or event..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Judges Table */}
      {filtered.length === 0 ? (
        <EmptyState 
          title="No judges found" 
          description={searchTerm ? "No judges matched your search criteria." : "Register judges to assign them to evaluation tracks."} 
          actionLabel="Add Judge" 
          onAction={openAdd}
          icon={Users} 
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 border-b border-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Judge Profile</th>
                  <th className="px-6 py-4">Organization & Title</th>
                  <th className="px-6 py-4">Contact Details</th>
                  <th className="px-6 py-4">Assigned Event</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(item => {
                  const initials = item.name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center font-display font-bold text-sm text-indigo-300">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="text-xs text-slate-400">{item.designation || 'Panelist'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Building size={14} className="text-slate-500" />
                          <span>{item.organization || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 space-y-0.5 text-xs">
                        {item.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail size={13} className="text-slate-500" />
                            <span>{item.email}</span>
                          </div>
                        )}
                        {item.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={13} className="text-slate-500" />
                            <span>{item.phone}</span>
                          </div>
                        )}
                        {!item.email && !item.phone && '—'}
                      </td>
                      <td className="px-6 py-4">
                        {item.events?.name ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                            <Award size={12} />
                            {item.events.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => openEdit(item)} 
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                          title="Edit Judge"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(item)} 
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Judge"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Judge Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Judge Details' : 'Register New Judge'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Full Name *
            </label>
            <input 
              required 
              type="text" 
              placeholder="e.g. Dr. Rajesh Kumar"
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Email Address</label>
              <input 
                type="email" 
                placeholder="judge@university.edu"
                value={form.email} 
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Phone Number</label>
              <input 
                type="tel" 
                placeholder="+91 98765 43210"
                value={form.phone} 
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Organization / Dept</label>
              <input 
                type="text" 
                placeholder="e.g. Department of CSE"
                value={form.organization} 
                onChange={e => setForm({ ...form, organization: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Designation</label>
              <input 
                type="text" 
                placeholder="e.g. Professor / Lead Architect"
                value={form.designation} 
                onChange={e => setForm({ ...form, designation: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Assigned Event Track</label>
            <select 
              value={form.assigned_event_id} 
              onChange={e => setForm({ ...form, assigned_event_id: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="" className="bg-slate-900">-- None (Unassigned) --</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id} className="bg-slate-900">{ev.name}</option>
              ))}
            </select>
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
              {submitting ? 'Saving...' : (editingItem ? 'Save Changes' : 'Register Judge')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Remove Judge"
        message={`Are you sure you want to remove judge "${deleteConfirm?.name}"? Any draft scores from this judge will be erased.`}
        confirmLabel="Remove Judge"
        variant="danger"
      />
    </div>
  );
}
