import * as XLSX from 'xlsx';

// ─── Currency Formatting ───────────────────────────────────
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

// ─── Date Formatting ───────────────────────────────────────
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Classnames Helper ─────────────────────────────────────
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// ─── Status Badge Colors ───────────────────────────────────
export function getStatusBadge(status) {
  const map = {
    pending: 'badge-yellow',
    'in_progress': 'badge-blue',
    in_progress: 'badge-blue',
    submitted: 'badge-green',
    ordered: 'badge-blue',
    delivered: 'badge-green',
    partial: 'badge-yellow',
    paid: 'badge-green',
    unpaid: 'badge-red',
    upcoming: 'badge-blue',
    ongoing: 'badge-yellow',
    completed: 'badge-green',
    cancelled: 'badge-red',
  };
  return map[status?.toLowerCase()] || 'badge-gray';
}

export function getStatusLabel(status) {
  if (!status) return 'Unknown';
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// ─── Export to CSV ──────────────────────────────────────────
export function exportToCSV(data, filename) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      let val = row[h] ?? '';
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        val = '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

// ─── Export to Excel ────────────────────────────────────────
export function exportToExcel(data, filename, sheetName = 'Sheet1') {
  if (!data || data.length === 0) return;
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// ─── Download Blob ──────────────────────────────────────────
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Sorting Helper ────────────────────────────────────────
export function sortData(data, sortKey, sortDir) {
  if (!sortKey) return data;
  return [...data].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];
    if (valA == null) valA = '';
    if (valB == null) valB = '';
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDir === 'asc' ? valA - valB : valB - valA;
    }
    const strA = String(valA).toLowerCase();
    const strB = String(valB).toLowerCase();
    if (strA < strB) return sortDir === 'asc' ? -1 : 1;
    if (strA > strB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
}

// ─── Search/Filter Helper ──────────────────────────────────
export function filterData(data, searchTerm, searchFields) {
  if (!searchTerm || !searchFields?.length) return data;
  const term = searchTerm.toLowerCase();
  return data.filter(item =>
    searchFields.some(field => {
      const val = item[field];
      return val != null && String(val).toLowerCase().includes(term);
    })
  );
}
