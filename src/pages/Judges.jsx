import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import {
  Plus, Edit2, Trash2, Search, Users, Mail, Phone,
  Building, Award, Download, CheckCircle, AlertCircle, X
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// All CONFIRMED judges from the Google Sheet (availability NOT in red).
// "awaiting REPLY thru MAIL" entries are still marked CONFIRMED in the sheet,
// so they are included. Missing values are pre-filled with 'NA'.
// ─────────────────────────────────────────────────────────────────────────────
const SHEET_JUDGES = [
  // BIZCOMM – QUANT QUEST
  { name: 'Mr. Pranav S. Joshi',      email: 'pranav.joshi@manipal.edu',  phone: '8904791006', organization: 'School of Basic Sciences, Humanities & Management', designation: 'Professor', event: 'QUANT QUEST' },
  { name: 'B S Manjunatha',           email: 'bs.manju@manipal.edu',       phone: 'NA',         organization: 'School of Basic Sciences, Humanities & Management', designation: 'Professor', event: 'QUANT QUEST' },
  // BIZCOMM – MONOPOLY
  { name: 'Dr. Sunith Hebbar',        email: 'sunith.hebbar@manipal.edu',  phone: '9986886286', organization: 'School of Basic Sciences, Humanities & Management', designation: 'Professor', event: 'MONOPOLY' },
  { name: 'Dr. Sumukh S Hungund',     email: 'sumukh.hungund@manipal.edu', phone: '9980876542', organization: 'School of Basic Sciences, Humanities & Management', designation: 'Professor', event: 'MONOPOLY' },
  // BIZCOMM – QUANDARY
  { name: 'Dr. Sunith Hebbar',        email: 'sunith.hebbar@manipal.edu',  phone: '9986886286', organization: 'School of Basic Sciences, Humanities & Management', designation: 'Professor', event: 'QUANDARY' },
  { name: 'Mr. Pranav S. Joshi',      email: 'pranav.joshi@manipal.edu',  phone: '8904791006', organization: 'School of Basic Sciences, Humanities & Management', designation: 'Professor', event: 'QUANDARY' },
  // COSMIC CON – STARLOCK HOLMES
  { name: 'Dr. Umesh Sahu',           email: 'umesh.sahu@manipal.edu',     phone: 'NA',         organization: 'Department of Mechatronics',                          designation: 'Professor', event: 'STARLOCK HOLMES' },
  { name: 'Dr. Ishwar Bhiradi',       email: 'ishwar.bhiradi@manipal.edu', phone: '8497040087', organization: 'Department of Mechatronics',                          designation: 'Professor', event: 'STARLOCK HOLMES' },
  { name: 'Dr. Harish Kumar Kamat',   email: 'harish.kamath@manipal.edu',  phone: '7760670046', organization: 'Department of Mechanical Engineering',               designation: 'Professor', event: 'STARLOCK HOLMES' },
  // KRAFTWAGEN – OFFROAD MAYHEM
  { name: 'Dr. Padmaraj N H',         email: 'padmaraj.nh@manipal.edu',    phone: '9886106513', organization: 'Department of Mechanical & Industrial Engineering',   designation: 'Professor', event: 'OFFROAD MAYHEM' },
  { name: 'Dr. Mahesha G T',          email: 'mahesh.gt@manipal.edu',      phone: '9480572702', organization: 'Department of Aeronautical & Automobile Engineering', designation: 'Professor', event: 'OFFROAD MAYHEM' },
  { name: 'Dr. Murali Gopal M',       email: 'muraligopal.m@manipal.edu',  phone: '8075825633', organization: 'Department of Aeronautical & Automobile Engineering', designation: 'Professor', event: 'OFFROAD MAYHEM' },
  // MOTION MATRIX – FASTEST LINE FOLLOWER
  { name: "Dr. Jeane Marina D'Souza", email: 'jeane.dsouza@manipal.edu',   phone: '9945668599', organization: 'Department of Mechatronics',                          designation: 'Professor', event: 'FASTEST LINE FOLLOWER' },
  { name: 'Dr. Kiran Dasari',         email: 'kiran.dasari@manipal.edu',   phone: '9494242472', organization: 'Department of Mechatronics',                          designation: 'Professor', event: 'FASTEST LINE FOLLOWER' },
  { name: 'Dr. Spoorthi Singh',       email: 'spoorthi.shekar@manipal.edu',phone: '9483089083', organization: 'Department of Mechatronics',                          designation: 'Professor', event: 'FASTEST LINE FOLLOWER' },
  // MOTION MATRIX – MAZE SOLVER
  { name: 'Dr. Shilpa Suresh',        email: 'shilpa.suresh@manipal.edu',  phone: '9400423775', organization: 'Department of Mechatronics',                          designation: 'Professor', event: 'MAZE SOLVER' },
  { name: 'Mr. Mukund Kumar Menon',   email: 'mukund.menon@manipal.edu',   phone: '7676319790', organization: 'School of Electrical Engineering',                    designation: 'Professor', event: 'MAZE SOLVER' },
  { name: 'Dr. Subramanya R Prabhu B',email: 'subramanya.prabhu@manipal.edu',phone: 'NA',      organization: 'Department of Mechatronics',                          designation: 'Professor', event: 'MAZE SOLVER' },
  // NEXUS – INNOFRAME
  { name: 'Mr. Nausha Shetty',        email: 'nausha.shetty@manipal.edu',  phone: '9964199848', organization: 'Department of Mechanical and Industrial Engineering', designation: 'Professor', event: 'INNOFRAME' },
  { name: 'Dr. Gurumurthy B. M.',     email: 'gurumurthy.bm@manipal.edu',  phone: '9538365165', organization: 'Department of Mechanical & Industrial Engineering',   designation: 'Professor', event: 'INNOFRAME' },
  { name: 'Dr. Rajesh Nayak',         email: 'nayak.raj@manipal.edu',      phone: '9964381237', organization: 'Department of Mechanical & Industrial Engineering',   designation: 'Professor', event: 'INNOFRAME' },
  // NEXUS – CITY SCAPING
  { name: 'Dr. Sugandhini H K',       email: 'sugandhini.hk@manipal.edu',  phone: '8861327123', organization: 'School of Civil & Chemical Engineering',              designation: 'Professor', event: 'CITY SCAPING' },
  { name: 'Dr. Laxman P Kudva',       email: 'laxman.kudva@manipal.edu',   phone: '8861397123', organization: 'School of Civil & Chemical Engineering',              designation: 'Professor', event: 'CITY SCAPING' },
  { name: 'Dr. Radhika Bhandary P',   email: 'radhika.st@manipal.edu',     phone: '9886994515', organization: 'School of Civil & Chemical Engineering',              designation: 'Professor', event: 'CITY SCAPING' },
  // QUARK – BITFLIP
  { name: 'Dr. Arjun Sunil Rao',      email: 'arjun.rao@manipal.edu',      phone: '8123847327', organization: 'Department of Electronics & Communication Engineering',designation: 'Professor', event: 'BITFLIP' },
  { name: 'Dr. Adarsh Nigam',         email: 'adarsh.nigam@manipal.edu',   phone: '9179280380', organization: 'Department of Electronics & Communication Engineering',designation: 'Professor', event: 'BITFLIP' },
  // ROBOWARS – 15KG & 8KG CATEGORY
  { name: 'Sujan Shetty',             email: 'sujanshetty311@gmail.com',    phone: '9743152062', organization: 'CFAL PU College',                                      designation: 'Lecturer',  event: '15KG CATEGORY' },
  { name: 'Jason Dsilva',             email: 'jasondsilva001@gmail.com',    phone: '9483926031', organization: 'Bangalore',                                             designation: 'Professor', event: '15KG CATEGORY' },
  { name: 'Sujan Shetty',             email: 'sujanshetty311@gmail.com',    phone: '9743152062', organization: 'CFAL PU College',                                      designation: 'Lecturer',  event: '8KG CATEGORY' },
  { name: 'Jason Dsilva',             email: 'jasondsilva001@gmail.com',    phone: '9483926031', organization: 'Bangalore',                                             designation: 'Professor', event: '8KG CATEGORY' },
  // VORTEX – ICARUS
  { name: 'Dr. Navya Hegde',          email: 'navya.hegde@manipal.edu',    phone: '7795815556', organization: 'Department of Aeronautical and Automobile Engineering', designation: 'Professor', event: 'ICARUS' },
  { name: 'Dr. Laxmikant G Keni',     email: 'laxmikant.keni@manipal.edu', phone: '8660650345', organization: 'Department of Aeronautical and Automobile Engineering', designation: 'Professor', event: 'ICARUS' },
  // VORTEX – ESCAPE VELOCITY
  { name: 'Dr. Dayananda K Pai',      email: 'dayanand.pai@manipal.edu',   phone: 'NA',         organization: 'Department of Aeronautical and Automobile Engineering', designation: 'Professor', event: 'ESCAPE VELOCITY' },
  { name: 'Dr. Srinivas G',           email: 'srinivas.g@manipal.edu',     phone: '8123677706', organization: 'Department of Aeronautical and Automobile Engineering', designation: 'Professor', event: 'ESCAPE VELOCITY' },
];

const emptyForm = {
  name: '', email: '', phone: '', organization: '',
  designation: 'Professor', assigned_event_id: ''
};

export default function Judges() {
  const [items, setItems]               = useState([]);
  const [events, setEvents]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [editingItem, setEditingItem]   = useState(null);
  const [form, setForm]                 = useState(emptyForm);
  const [searchTerm, setSearchTerm]     = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [showImport, setShowImport]     = useState(false);
  const [importing, setImporting]       = useState(false);
  const [importLog, setImportLog]       = useState([]);
  const [cleaningDuplicates, setCleaningDuplicates] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchEvents();
  }, []);

  async function fetchItems() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('judges')
        .select('*, events(id, name)')
        .order('created_at', { ascending: false });
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
      console.error('Error fetching events:', err);
    }
  }

  // ── Find event ID by name (case-insensitive partial match) ──────────────────
  function resolveEventId(eventName) {
    if (!eventName) return null;
    const target = eventName.trim().toUpperCase();
    const match = events.find(ev => ev.name.toUpperCase() === target)
                 ?? events.find(ev => ev.name.toUpperCase().includes(target))
                 ?? events.find(ev => target.includes(ev.name.toUpperCase()));
    return match?.id ?? null;
  }

  // ── Bulk import from sheet (with dedupe) ────────────────────────────────────
  async function handleBulkImport() {
    setImporting(true);
    setImportLog([]);
    const logs = [];

    // Build a set of existing "name||email" keys to avoid duplicates
    const existing = new Set(
      items.map(i => `${i.name.trim().toLowerCase()}||${(i.email || '').trim().toLowerCase()}`)
    );

    for (const j of SHEET_JUDGES) {
      const key = `${j.name.trim().toLowerCase()}||${j.email.trim().toLowerCase()}`;
      if (existing.has(key)) {
        logs.push({ ok: null, msg: `— ${j.name} (${j.event}): already exists, skipped` });
        continue;
      }
      const eventId = resolveEventId(j.event);
      const payload = {
        name:              j.name,
        email:             j.email,
        phone:             j.phone,
        organization:      j.organization,
        designation:       j.designation,
        assigned_event_id: eventId,
      };
      try {
        const { error } = await supabase.from('judges').insert(payload);
        if (error) throw error;
        existing.add(key);
        logs.push({ ok: true, msg: `✓ ${j.name} → ${eventId ? j.event : '⚠ event not in DB'}` });
      } catch (err) {
        logs.push({ ok: false, msg: `✗ ${j.name}: ${err.message}` });
      }
    }

    setImportLog(logs);
    setImporting(false);
    await fetchItems();
  }

  // ── Remove existing duplicate judges from database ──────────────────────────
  async function cleanDuplicateJudges() {
    setCleaningDuplicates(true);
    try {
      const { data: allJudges, error } = await supabase
        .from('judges')
        .select('id, name, email, created_at')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const seen = new Set();
      const duplicateIds = [];

      for (const j of allJudges || []) {
        const key = `${(j.name || '').trim().toLowerCase()}||${(j.email || '').trim().toLowerCase()}`;
        if (seen.has(key)) {
          duplicateIds.push(j.id);
        } else {
          seen.add(key);
        }
      }

      if (duplicateIds.length === 0) {
        alert('No duplicate judges found in the database!');
      } else {
        const confirmDelete = window.confirm(`Found ${duplicateIds.length} duplicate judge entries. Remove them now?`);
        if (confirmDelete) {
          for (const id of duplicateIds) {
            await supabase.from('judges').delete().eq('id', id);
          }
          alert(`Successfully removed ${duplicateIds.length} duplicate judges!`);
          await fetchItems();
        }
      }
    } catch (err) {
      console.error('Error cleaning duplicate judges:', err);
      alert('Failed to clean duplicates: ' + err.message);
    } finally {
      setCleaningDuplicates(false);
    }
  }

  // ── Form open helpers ────────────────────────────────────────────────────────
  function openAdd() {
    setEditingItem(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setForm({
      name:              item.name,
      email:             item.email  || '',
      phone:             item.phone  || '',
      organization:      item.organization  || '',
      designation:       item.designation   || 'Professor',
      assigned_event_id: item.assigned_event_id || '',
    });
    setShowModal(true);
  }

  // ── Pre-fill form from sheet row ─────────────────────────────────────────────
  function prefillFromSheet(j) {
    const eventId = resolveEventId(j.event);
    setEditingItem(null);
    setForm({
      name:              j.name,
      email:             j.email,
      phone:             j.phone === 'NA' ? '' : j.phone,
      organization:      j.organization,
      designation:       j.designation,
      assigned_event_id: eventId || '',
    });
    setShowImport(false);
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

      {/* ── Top Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-white tracking-tight">Judges Directory</h1>
          <p className="text-xs text-slate-400 mt-1">Manage external panelists, university professors, and assigned tracks</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={cleanDuplicateJudges}
            disabled={cleaningDuplicates}
            className="flex items-center gap-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50"
            title="Keep one entry per judge and delete duplicates"
          >
            <Trash2 size={16} /> {cleaningDuplicates ? 'Cleaning...' : 'Remove Duplicates'}
          </button>
          <button
            onClick={() => { setShowImport(true); setImportLog([]); }}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95"
          >
            <Download size={16} /> Import from Sheet
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all duration-200 active:scale-95"
          >
            <Plus size={18} /> Add Judge
          </button>
        </div>
      </div>

      {/* ── Search Bar ─────────────────────────────────────────────────────── */}
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

      {/* ── Judges Table ───────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No judges found"
          description={searchTerm ? 'No judges matched your search.' : 'Use "Import from Sheet" to bulk-add confirmed judges, or add one manually.'}
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
                  <th className="px-6 py-4">Organization / Dept</th>
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
                            <p className="text-xs text-slate-400">{item.designation || 'Professor'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Building size={14} className="text-slate-500 flex-shrink-0" />
                          <span className="leading-snug">{item.organization || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Mail size={13} className="text-slate-500" />
                          <span>{item.email || 'NA'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={13} className="text-slate-500" />
                          <span>{item.phone || 'NA'}</span>
                        </div>
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

      {/* ── Add / Edit Judge Modal ──────────────────────────────────────────── */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Judge Details' : 'Register New Judge'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Full Name *</label>
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Email ID</label>
              <input
                type="text"
                placeholder="judge@university.edu or NA"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210 or NA"
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
                placeholder="e.g. Dept. of CSE, MIT Manipal"
                value={form.organization}
                onChange={e => setForm({ ...form, organization: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Designation</label>
              <input
                type="text"
                placeholder="e.g. Professor"
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
            {form.assigned_event_id === '' && (
              <p className="text-xs text-amber-400 mt-1">
                ⚠ Event not found in DB — make sure the event exists in the Events page first.
              </p>
            )}
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

      {/* ── Import from Sheet Panel ─────────────────────────────────────────── */}
      <Modal isOpen={showImport} onClose={() => setShowImport(false)} title="Import Confirmed Judges from Sheet">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            The list below contains <span className="text-white font-semibold">{SHEET_JUDGES.length} confirmed judges</span> from your Google Sheet
            (availability confirmed, red-labelled rows excluded). You can:
          </p>
          <ul className="text-xs text-slate-400 list-disc ml-4 space-y-1">
            <li>Click <span className="text-indigo-300 font-medium">Bulk Import All</span> to insert all at once into Supabase.</li>
            <li>Click any row's <span className="text-indigo-300 font-medium">Add</span> button to pre-fill the form and review before saving.</li>
            <li>Events must already exist in your Events page — otherwise the event field will be left unassigned.</li>
          </ul>

          {/* Bulk import button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkImport}
              disabled={importing}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
            >
              {importing ? 'Importing...' : `Bulk Import All ${SHEET_JUDGES.length} Judges`}
            </button>
          </div>

          {/* Import log */}
          {importLog.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-xl bg-slate-950/80 border border-slate-800 p-3 space-y-1">
              {importLog.map((l, i) => (
                <div key={i} className={`flex items-start gap-2 text-xs ${l.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {l.ok ? <CheckCircle size={13} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />}
                  <span>{l.msg}</span>
                </div>
              ))}
            </div>
          )}

          {/* Per-judge list */}
          <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
            {SHEET_JUDGES.map((j, idx) => {
              const eventId = resolveEventId(j.event);
              return (
                <div key={idx} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">{j.name}</p>
                      <span className="text-xs text-slate-500 shrink-0">{j.designation}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Mail size={11} />{j.email}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Phone size={11} />{j.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${eventId ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                        <Award size={10} />{j.event}{!eventId && ' ⚠ not in DB'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => prefillFromSheet(j)}
                    className="shrink-0 px-3 py-1.5 text-xs rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-600/30 font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              onClick={() => setShowImport(false)}
              className="px-4 py-2 text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirmation ─────────────────────────────────────────────── */}
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
