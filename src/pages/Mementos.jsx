import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

const TYPES = ['memento', 'trophy', 'medal', 'certificate', 'gift', 'plaque', 'merchandise', 'other'];
const STATUSES = ['pending', 'ordered', 'partial', 'received'];
const statusBadge = { pending: 'warning', ordered: 'info', partial: 'info', received: 'success' };

const emptyForm = { name: '', type: 'memento', vendor_id: '', quantity_required: 0, quantity_received: 0, status: 'pending', notes: '' };

export default function Mementos() {
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchItems(); fetchVendors(); }, []);

  async function fetchItems() {
    setLoading(true);
    const { data } = await supabase.from('mementos').select('*, vendors(id, name)').order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  async function fetchVendors() {
    const { data } = await supabase.from('vendors').select('id, name').order('name');
    setVendors(data || []);
  }

  function openAdd() { setEditingItem(null); setForm(emptyForm); setShowModal(true); }

  function openEdit(item) {
    setEditingItem(item);
    setForm({
      name: item.name, type: item.type, vendor_id: item.vendor_id || '',
      quantity_required: item.quantity_required, quantity_received: item.quantity_received,
      status: item.status, notes: item.notes || ''
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    const payload = { ...form, vendor_id: form.vendor_id || null };
    if (editingItem) {
      await supabase.from('mementos').update(payload).eq('id', editingItem.id);
    } else {
      await supabase.from('mementos').insert(payload);
    }
    setShowModal(false);
    fetchItems();
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    await supabase.from('mementos').delete().eq('id', deleteConfirm.id);
    setDeleteConfirm(null);
    fetchItems();
  }

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Summary stats
  const totalRequired = items.reduce((s, i) => s + i.quantity_required, 0);
  const totalReceived = items.reduce((s, i) => s + i.quantity_received, 0);
  const totalPending = totalRequired - totalReceived;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mementos</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" placeholder="Search mementos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap">
            <Plus size={18} /> Add Memento
          </button>
        </div>
      </div>

      {/* Summary bar */}
      {items.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-6">
          <div><span className="text-sm text-gray-500">Total Required:</span> <span className="font-bold text-gray-900">{totalRequired}</span></div>
          <div><span className="text-sm text-gray-500">Total Received:</span> <span className="font-bold text-green-600">{totalReceived}</span></div>
          <div><span className="text-sm text-gray-500">Total Pending:</span> <span className={`font-bold ${totalPending > 0 ? 'text-red-600' : 'text-green-600'}`}>{totalPending}</span></div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title="No mementos found" description="Track trophies, certificates, and other event items." actionLabel="Add Memento" onAction={openAdd} />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(item => {
                  const pending = item.quantity_required - item.quantity_received;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-gray-600 capitalize">{item.type}</td>
                      <td className="px-6 py-4 text-gray-600">{item.vendors?.name || '—'}</td>
                      <td className="px-6 py-4 text-center text-gray-900 font-medium">{item.quantity_required}</td>
                      <td className="px-6 py-4 text-center text-gray-900 font-medium">{item.quantity_received}</td>
                      <td className={`px-6 py-4 text-center font-bold ${pending > 0 ? 'text-red-600' : 'text-green-600'}`}>{pending}</td>
                      <td className="px-6 py-4"><Badge variant={statusBadge[item.status]}>{item.status}</Badge></td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => openEdit(item)} className="text-indigo-600 hover:text-indigo-900"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteConfirm(item)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Memento' : 'Add Memento'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <select value={form.vendor_id} onChange={e => setForm({ ...form, vendor_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">— No vendor —</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Required</label>
              <input type="number" min="0" value={form.quantity_required} onChange={e => setForm({ ...form, quantity_required: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Received</label>
              <input type="number" min="0" value={form.quantity_received} onChange={e => setForm({ ...form, quantity_received: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete}
        title="Delete Memento" message={`Are you sure you want to delete "${deleteConfirm?.name}"?`} confirmLabel="Delete" />
    </div>
  );
}
