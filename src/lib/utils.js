/**
 * Utility functions for TechTatva Dashboard
 * Pure zero-dependency helpers
 */

// ─── Currency Formatting ───────────────────────────────────
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

// ─── Date Formatting ───────────────────────────────────────
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// ─── Classnames Helper ─────────────────────────────────────
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// ─── Status Badge Variant & Labels ─────────────────────────
export function getStatusBadgeVariant(status) {
  const map = {
    pending: 'warning',
    in_progress: 'info',
    draft: 'info',
    submitted: 'success',
    ordered: 'info',
    delivered: 'success',
    received: 'success',
    partial: 'warning',
    paid: 'success',
    unpaid: 'danger',
    upcoming: 'info',
    ongoing: 'warning',
    completed: 'success',
    cancelled: 'danger',
  };
  return map[status?.toLowerCase()] || 'neutral';
}

export function getStatusLabel(status) {
  if (!status) return 'Unknown';
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// ─── Zero-Dependency Native CSV Exporter ───────────────────
export function exportToCSV(data, filename = 'export.csv') {
  if (!data || !data.length) {
    console.warn('exportToCSV: No data provided to export.');
    return;
  }

  const headers = Object.keys(data[0]);
  const formatCell = (val) => {
    if (val === null || val === undefined) return '""';
    if (typeof val === 'object') {
      val = JSON.stringify(val);
    }
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows = [
    headers.map(formatCell).join(','),
    ...data.map(row => headers.map(header => formatCell(row[header])).join(','))
  ];

  const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
