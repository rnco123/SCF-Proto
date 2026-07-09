function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatRelativeDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(dateStr);
}

function statusBadge(status) {
  const map = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    funded: 'badge-funded',
    paid: 'badge-paid',
    rejected: 'badge-rejected',
    draft: 'badge-draft',
    disbursed: 'badge-funded',
    requested: 'badge-pending',
    settled: 'badge-paid',
    available: 'badge-approved',
    pending_review: 'badge-pending',
    active: 'badge-approved',
    submitted: 'badge-pending',
    repaying: 'badge-pending',
    closed: 'badge-paid',
    invited: 'badge-pending',
    accepted: 'badge-approved',
    onboarding: 'badge-pending',
    kyc_pending: 'badge-pending',
    kyc_approved: 'badge-approved',
  };
  const cls = map[status] || 'badge-draft';
  const labelMap = {
    pending_review: 'Pending Review',
    kyc_pending: 'KYC Pending',
    kyc_approved: 'KYC Approved',
  };
  const label = labelMap[status] || status.replace(/_/g, ' ');
  return `<span class="badge ${cls}">${label}</span>`;
}

function riskBadge(rating) {
  const map = { low: 'badge-funded', medium: 'badge-pending', high: 'badge-rejected' };
  return `<span class="badge ${map[rating] || 'badge-draft'}">${rating} risk</span>`;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const due = new Date(dateStr);
  const now = new Date();
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

function pct(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

function el(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-root');
  const toast = el(`<div class="toast ${type}">${message}</div>`);
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function showModal({ title, body, footer, onClose }) {
  const root = document.getElementById('modal-root');
  const overlay = el(`
    <div class="modal-overlay" role="dialog" aria-modal="true">
      <div class="modal">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="btn btn-ghost btn-icon" data-action="close" aria-label="Close">${icon('x')}</button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    </div>
  `);

  function close() {
    overlay.remove();
    if (onClose) onClose();
  }

  overlay.querySelector('[data-action="close"]').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  root.appendChild(overlay);
  return { close, el: overlay };
}

function invoiceTableRow(inv, options = {}) {
  const showSupplier = options.showSupplier;
  const supplierName = inv.supplierName || getSupplierName(inv.supplierId) || '—';
  return `
    <tr data-invoice-id="${inv.id}">
      <td class="text-mono">${inv.invoiceNumber}</td>
      ${showSupplier ? `<td>${supplierName}</td>` : ''}
      <td class="font-medium">${formatCurrency(inv.amount)}</td>
      <td>${formatDate(inv.dueDate)}</td>
      <td>${statusBadge(inv.status)}</td>
      <td class="text-secondary">${inv.description}</td>
    </tr>
  `;
}

function activityDot(type) {
  const map = {
    invoice_submitted: 'warning',
    invoice_approved: 'info',
    funding_requested: 'warning',
    funds_disbursed: 'success',
    settlement: 'success',
    transaction_submitted: 'warning',
    program_created: 'info',
    program_activated: 'success',
    invitation_accepted: 'info',
    bank_enrolled: 'info',
  };
  return map[type] || '';
}

function programTypeLabel(type) {
  const map = {
    reverse_factoring: 'Reverse Factoring',
    dynamic_discounting: 'Dynamic Discounting',
    payables_finance: 'Payables Finance',
    buyer_initiated_scf: 'Buyer-Initiated SCF',
  };
  return map[type] || type;
}

function formatPKR(amount) {
  return 'PKR ' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(amount));
}

function formatAmt(amount, currency) {
  if (currency === 'PKR') return formatPKR(amount);
  return formatCurrency(amount, currency || 'USD');
}
