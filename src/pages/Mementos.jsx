import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2, Search, Gift, Store, Award, CheckCircle2, AlertCircle } from 'lucide-react';

const TYPES = ['All', 'trophy', 'medal', 'certificate', 'memento', 'gift', 'plaque', 'merchandise', 'other'];
const STATUSES = ['pending', 'ordered', 'partial', 'received'];
const statusBadge = { pending: 'warning', ordered: 'info', partial: 'info', received: 'success' };

const emptyForm = { 
  name: '', 
  type: 'trophy', 
  vendor_id: '', 
  quantity_required: 1, 
  quantity_received: 0, 
  status: 'pending', 
  notes: '' 
};

export default function Mementos() {
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { 
    fetchItems(); 
    fetchVendors(); 
  }, []);

  async function fetchItems() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.from('mementos').select('*, vendors(id, name)').order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching mementos:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVendors() {
    try {
      const { data } = await supabase.from('vendors').select('id, name').order('name');
      setVendors(data || []);
    } catch (err) {
      console.error('Error fetching vendors for mementos:', err);
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
      type: item.type || 'trophy', 
      vendor_id: item.vendor_id || '',
      quantity_required: item.quantity_required || 0, 
      quantity_received: item.quantity_received || 0,
      status: item.status || 'pending', 
      notes: item.notes || ''
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSubmitting(true);
    const payload = { 
      ...form, 
      vendor_id: form.vendor_id || null,
      quantity_required: Number(form.quantity_required) || 0,
      quantity_received: Number(form.quantity_received) || 0
    };
    try {
      if (editingItem) {
        await supabase.from('mementos').update(payload).eq('id', editingItem.id);
      } else {
        await supabase.from('mementos').insert(payload);
      }
      setShowModal(false);
      await fetchItems();
    } catch (err) {
      console.error('Error saving memento:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      await supabase.from('mementos').delete().eq('id', deleteConfirm.id);
      setDeleteConfirm(null);
      await fetchItems();
    } catch (err) {
      console.error('Error deleting memento:', err);
    }
  }

  const filtered = items.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.vendors?.name && i.vendors.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'All' || i.type?.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  if (loading) return <LoadingSpinner label="Auditing trophy and memento reserves..." />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-white tracking-tight">Awards & Mementos Logistics</h1>
          <p className="text-xs text-slate-400 mt-1">Track quotas, delivery shortfalls, and vendor assignments for awards</p>
        </div>
        <button 
          onClick={openAdd} 
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all duration-200 active:scale-95"
        >
          <Plus size={18} /> Add Memento
        </button>
      </div>

      {/* Search & Type Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search memento by name or vendor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {TYPES.slice(0, 6).map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all duration-200 ${
                selectedType.toLowerCase() === type.toLowerCase()
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Mementos Table */}
      {filtered.length === 0 ? (
        <EmptyState 
          title="No mementos recorded" 
          description={searchTerm || selectedType !== 'All' ? "No records matched your filters." : "Establish awards inventory to monitor fulfillment."} 
          actionLabel="Add Memento" 
          onAction={openAdd}
          icon={Gift} 
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 border-b border-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Award Item</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Fulfillment Progress</th>
                  <th className="px-6 py-4 text-center">Shortfall</th>
                  <th className="px-6 py-4">Vendor Partner</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(item => {
                  const req = item.quantity_required || 0;
                  const recv = item.quantity_received || 0;
                  const diff = req - recv;
                  const pct = req > 0 ? Math.min(100, Math.round((recv / req) * 100)) : 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-amber-400">
                            <Award size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{item.name}</p>
                            {item.notes && <p className="text-xs text-slate-400">{item.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700/60 capitalize">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 min-w-[160px]">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-mono text-slate-300 font-semibold">{recv} of {req}</span>
                            <span className="font-mono text-slate-400 font-bold">{pct}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-300 ${pct === 100 ? 'bg-emerald-400' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg ${diff <= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                          {diff <= 0 ? 'Complete' : `-${diff}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300">
                        {item.vendors?.name ? (
                          <div className="flex items-center gap-1.5">
                            <Store size={13} className="text-slate-500" />
                            <span>{item.vendors.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
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
                          title="Edit Memento"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(item)} 
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Memento"
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

      {/* Add / Edit Memento Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Memento Entry' : 'Configure New Memento'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Item Designation *
            </label>
            <input 
              required 
              type="text" 
              placeholder="e.g. 1st Place Crystal Trophy"
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Item Classification</label>
              <select 
                value={form.type} 
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm capitalize focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                {TYPES.filter(t => t !== 'All').map(t => <option key={t} value={t} className="bg-slate-900 capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Contracted Vendor</label>
              <select 
                value={form.vendor_id} 
                onChange={e => setForm({ ...form, vendor_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="" className="bg-slate-900">-- None Assigned --</option>
                {vendors.map(v => <option key={v.id} value={v.id} className="bg-slate-900">{v.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Qty Required</label>
              <input 
                type="number" 
                min="0"
                value={form.quantity_required} 
                onChange={e => setForm({ ...form, quantity_required: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Qty Received</label>
              <input 
                type="number" 
                min="0"
                value={form.quantity_received} 
                onChange={e => setForm({ ...form, quantity_received: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Delivery Status</label>
              <select 
                value={form.status} 
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm capitalize focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                {STATUSES.map(s => <option key={s} value={s} className="bg-slate-900 capitalize">{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Specifications & Notes</label>
            <textarea 
              rows={2} 
              placeholder="Material, engraving details, delivery contact..."
              value={form.notes} 
              onChange={e => setForm({ ...form, notes: e.target.value })}
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
              {submitting ? 'Saving...' : (editingItem ? 'Save Modifications' : 'Create Memento')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Memento Record"
        message={`Are you sure you want to remove "${deleteConfirm?.name}"? Fulfillment statistics will recalculate.`}
        confirmLabel="Delete Memento"
        variant="danger"
      />
    </div>
  );
}
