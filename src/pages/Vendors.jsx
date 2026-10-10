import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2, Search, Store, Phone, Mail, User, Package, CreditCard, Truck } from 'lucide-react';

const PAYMENT = ['pending', 'partial', 'paid'];
const DELIVERY = ['pending', 'partial', 'delivered'];
const payBadge = { pending: 'warning', partial: 'info', paid: 'success', completed: 'success' };
const delBadge = { pending: 'warning', partial: 'info', delivered: 'success' };

const emptyForm = { 
  name: '', 
  contact_person: '', 
  phone: '', 
  email: '', 
  items_supplied: '', 
  payment_status: 'pending', 
  delivery_status: 'pending', 
  notes: '' 
};

export default function Vendors() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.from('vendors').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
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
      contact_person: item.contact_person || '', 
      phone: item.phone || '',
      email: item.email || '', 
      items_supplied: item.items_supplied || '',
      payment_status: item.payment_status || 'pending', 
      delivery_status: item.delivery_status || 'pending', 
      notes: item.notes || ''
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await supabase.from('vendors').update(form).eq('id', editingItem.id);
      } else {
        await supabase.from('vendors').insert(form);
      }
      setShowModal(false);
      await fetchItems();
    } catch (err) {
      console.error('Error saving vendor:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      await supabase.from('vendors').delete().eq('id', deleteConfirm.id);
      setDeleteConfirm(null);
      await fetchItems();
    } catch (err) {
      console.error('Error deleting vendor:', err);
    }
  }

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.contact_person && i.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (i.items_supplied && i.items_supplied.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <LoadingSpinner label="Accessing vendor registry..." />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-white tracking-tight">Vendors & Procurement</h1>
          <p className="text-xs text-slate-400 mt-1">Manage external print shops, trophy craft houses, and payment balances</p>
        </div>
        <button 
          onClick={openAdd} 
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all duration-200 active:scale-95"
        >
          <Plus size={18} /> Add Vendor
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search vendors, contacts, or supplied items..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Vendors Table */}
      {filtered.length === 0 ? (
        <EmptyState 
          title="No vendors on record" 
          description={searchTerm ? "No vendors matched your query." : "Track suppliers for mementos, certificates, and fest banners."} 
          actionLabel="Add Vendor" 
          onAction={openAdd}
          icon={Store} 
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 border-b border-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Vendor Agency</th>
                  <th className="px-6 py-4">Contact Person</th>
                  <th className="px-6 py-4">Supplied Items</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Delivery</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-indigo-400 font-bold">
                          <Store size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          {item.notes && (
                            <p className="text-xs text-slate-400 truncate max-w-xs">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-slate-200">
                          <User size={13} className="text-slate-500" />
                          <span>{item.contact_person || '—'}</span>
                        </div>
                        {item.phone && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Phone size={12} className="text-slate-500" />
                            <span>{item.phone}</span>
                          </div>
                        )}
                        {item.email && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Mail size={12} className="text-slate-500" />
                            <span>{item.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Package size={14} className="text-slate-500 shrink-0" />
                        <span>{item.items_supplied || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={payBadge[item.payment_status] || 'neutral'}>
                        {item.payment_status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={delBadge[item.delivery_status] || 'neutral'}>
                        {item.delivery_status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openEdit(item)} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                        title="Edit Vendor"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(item)} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete Vendor"
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

      {/* Add / Edit Vendor Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Vendor Record' : 'Register New Vendor'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Vendor Agency / Name *
            </label>
            <input 
              required 
              type="text" 
              placeholder="e.g. ABC Prints & Awards"
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Contact Person</label>
              <input 
                type="text" 
                placeholder="Manager name"
                value={form.contact_person} 
                onChange={e => setForm({ ...form, contact_person: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Phone Number</label>
              <input 
                type="tel" 
                placeholder="+91 98765 00000"
                value={form.phone} 
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Email Address</label>
              <input 
                type="email" 
                placeholder="vendor@supplies.com"
                value={form.email} 
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Items Supplied</label>
              <input 
                type="text" 
                placeholder="Trophies, Certificates, Banners"
                value={form.items_supplied} 
                onChange={e => setForm({ ...form, items_supplied: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Payment Status</label>
              <select 
                value={form.payment_status} 
                onChange={e => setForm({ ...form, payment_status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                {PAYMENT.map(p => <option key={p} value={p} className="bg-slate-900 capitalize">{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Delivery Status</label>
              <select 
                value={form.delivery_status} 
                onChange={e => setForm({ ...form, delivery_status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                {DELIVERY.map(d => <option key={d} value={d} className="bg-slate-900 capitalize">{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Notes & Terms</label>
            <textarea 
              rows={2} 
              placeholder="Advance payment terms, shipment tracking, or contact hours..."
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
              {submitting ? 'Saving...' : (editingItem ? 'Update Vendor' : 'Register Vendor')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Remove Vendor"
        message={`Are you sure you want to remove vendor "${deleteConfirm?.name}"? Linked memento procurement records may lose vendor attribution.`}
        confirmLabel="Remove Vendor"
        variant="danger"
      />
    </div>
  );
}
