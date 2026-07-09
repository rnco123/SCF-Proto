const PAGE_TITLES = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your supply chain finance activity' },
  'supplier-dashboard': { title: 'Dashboard', subtitle: 'All SCF financing transactions on your account' },
  invoices: { title: 'Invoices', subtitle: 'View and manage all invoices' },
  'early-payment': { title: 'Early Payment', subtitle: 'Request accelerated payment on approved invoices' },
  transactions: { title: 'Receivable Finance Program', subtitle: 'Receivable Finance Program allows suppliers to receive early payment on approved invoices from participating banks.' },
  programs: { title: 'Manage Program', subtitle: 'Add, update, or remove suppliers and funders in your program' },
  approvals: { title: 'Approvals', subtitle: 'Review and approve supplier invoices' },
  suppliers: { title: 'Suppliers', subtitle: 'Manage your enrolled supplier network' },
  'add-supplier': { title: 'Add Supplier', subtitle: 'Enroll a supplier into an SCF program' },
  'add-bank': { title: 'Add Bank', subtitle: 'Enroll a bank/funder into an SCF program' },
  opportunities: { title: 'Funding Opportunities', subtitle: 'Review and fund invoice discounting requests' },
  portfolio: { title: 'Portfolio', subtitle: 'Active funded positions and performance' },
  'create-program': { title: 'Create SCF Program', subtitle: 'Set up a new buyer-initiated supply chain finance program' },
  'create-transaction': { title: 'Receivable Finance Program', subtitle: 'Create your Receivable Finance Program request here' },
  repay: { title: 'Repayments', subtitle: 'Repay financed invoices at maturity' },
  invitations: { title: 'Invitations', subtitle: 'Program invitations from buyers' },
  'supplier-transactions': { title: 'Financing Received', subtitle: 'SCF transactions financed on your invoices' },
  'funder-transactions': { title: 'SCF Transactions', subtitle: 'Review, approve, and disburse financing requests' },
  'funder-dashboard': { title: 'Dashboard', subtitle: 'View financing requests from your enrolled programs' },
  kyc: { title: 'KYC & Onboarding', subtitle: 'Complete KYC and set your financing parameters' },
};

const VIEW_MAP = {
  supplier: {
    dashboard: () => Views.supplierDashboard(),
  },
  buyer: {
    dashboard: () => Views.buyerDashboard(),
    approvals: () => Views.buyerApprovals(),
    invoices: () => Views.buyerInvoices(),
    suppliers: () => Views.buyerSuppliers(),
    'add-supplier': () => Views.buyerAddSupplier(),
    'add-bank': () => Views.buyerAddBank(),
    programs: () => Views.buyerManageProgram(),
    'create-program': () => Views.buyerCreateProgram(),
    transactions: () => Views.buyerTransactions(),
    'create-transaction': () => Views.buyerCreateTransaction(),
    repay: () => Views.buyerRepay(),
  },
  funder: {
    dashboard: () => Views.funderDashboard(),
    opportunities: () => Views.funderOpportunities(),
    portfolio: () => Views.funderPortfolio(),
    programs: () => Views.funderPrograms(),
    'funder-transactions': () => Views.funderTransactions(),
    kyc: () => Views.funderKyc(),
  },
};

function parseRoute() {
  const hash = location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean);
  if (!parts.length) return { role: null, page: null };
  return { role: parts[0], page: parts[1] || 'dashboard' };
}

function renderShell(role, page, content, pageKey) {
  const data = getData();
  const party = getParty(role);
  const nav = data.navigation[role];
  const pageInfo = PAGE_TITLES[pageKey || page] || { title: page, subtitle: '' };

  return `
    <div class="app-shell">
      <aside class="sidebar">
        <a href="#/${role}/${role === 'buyer' ? 'transactions' : 'dashboard'}" class="sidebar-brand">
          <img src="assets/logo.png" alt="TradeOrigin">
        </a>
        <div class="sidebar-role">
          <div class="sidebar-role-label">Signed in as</div>
          <div class="sidebar-role-name">${party.contact}</div>
          <div class="sidebar-role-company">${party.id} · ${party.name}</div>
          ${party.designation ? `<div class="sidebar-role-company">${party.designation}</div>` : ''}
        </div>
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-label">Menu</div>
            ${nav.map((item) => {
              const isActive = page === item.id || (item.id === 'transactions' && page === 'create-transaction');
              return `
              <a href="#/${role}/${item.id}" class="nav-item ${isActive ? 'active' : ''}">
                ${icon(item.icon)}
                ${item.label}
              </a>`;
            }).join('')}
          </div>
        </nav>
        <div class="sidebar-footer">
          <button class="switch-role-btn" data-action="switch-role">
            ${icon('refresh')}
            Switch Role
          </button>
        </div>
      </aside>
      <main class="main-content">
        <header class="page-header">
          <div class="page-header-left">
            <h1>${pageInfo.title}</h1>
            <p>${pageInfo.subtitle}</p>
          </div>
          <div class="page-header-actions">
            ${role === 'buyer' && page === 'transactions' ? `
              <a href="#/buyer/programs" class="btn btn-secondary btn-sm mp-header-btn">Manage Program</a>
              <a href="#/buyer/create-transaction" class="btn btn-primary btn-sm">${icon('plus-circle')} Create Request</a>
            ` : ''}
          </div>
        </header>
        <div class="page-body" id="page-content">
          ${content}
        </div>
      </main>
    </div>
  `;
}

function render() {
  const { role, page } = parseRoute();
  const app = document.getElementById('app');

  if (!role) {
    app.innerHTML = Views.landing();
    return;
  }

  if (role === 'supplier' && page !== 'dashboard') {
    location.hash = '#/supplier/dashboard';
    return;
  }

  const viewFn = VIEW_MAP[role]?.[page];
  if (!viewFn) {
    const fallback = role === 'buyer' ? 'transactions' : 'dashboard';
    location.hash = `#/${role}/${fallback}`;
    return;
  }

  setState({ role, page });
  const content = viewFn();
  const pageKey = role === 'supplier' && page === 'dashboard' ? 'supplier-dashboard' : page;
  app.innerHTML = renderShell(role, page, content, pageKey);
  bindEvents();
}

function transactionModalBody(txn) {
  const { role } = getState();
  return role === 'supplier'
    ? Views.supplierTransactionDetail(txn)
    : Views.transactionDetail(txn);
}

function bindEvents() {
  const { role } = getState();

  document.querySelectorAll('[data-action="enter-as"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setActiveEntity(btn.dataset.role, btn.dataset.entityId);
      location.hash = `#/${btn.dataset.role}/dashboard`;
    });
  });

  document.querySelector('[data-action="switch-role"]')?.addEventListener('click', () => {
    location.hash = '#/';
  });

  document.querySelectorAll('[data-action="request-funding"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.invoiceId;
      const inv = getInvoiceById(id);
      showModal({
        title: 'Confirm Early Payment Request',
        body: `
          <p class="mb-4">You are requesting early payment for invoice <strong>${inv.invoiceNumber}</strong>.</p>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Invoice Amount</label>
              <div class="value">${formatCurrency(inv.amount)}</div>
            </div>
            <div class="detail-item">
              <label>Net Proceeds</label>
              <div class="value" style="color: var(--color-success)">${formatCurrency(inv.discountOffer.netProceeds)}</div>
            </div>
            <div class="detail-item">
              <label>Discount</label>
              <div class="value">−${formatCurrency(inv.discountOffer.discountAmount)}</div>
            </div>
            <div class="detail-item">
              <label>Payment Date</label>
              <div class="value">${formatDate(inv.discountOffer.earlyPaymentDate)}</div>
            </div>
          </div>
        `,
        footer: `
          <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
          <button class="btn btn-primary" data-action="confirm-funding" data-invoice-id="${id}">Confirm Request</button>
        `,
      });
      bindModalEvents();
    });
  });

  document.querySelectorAll('[data-action="approve"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.invoiceId;
      const inv = getInvoiceById(id);
      const rate = getProgramsForRole('buyer').find((p) => p.id === inv.programId)?.discountRate || 4.25;
      const discountAmount = Math.round(inv.amount * (rate / 100) * (daysUntil(inv.dueDate) / 365) * 100) / 100;

      updateInvoiceStatus(id, {
        status: 'approved',
        approvedDate: new Date().toISOString().split('T')[0],
        approvedBy: getParty('buyer').contact,
        discountOffer: {
          rate,
          earlyPaymentDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          discountAmount,
          netProceeds: inv.amount - discountAmount,
        },
      });
      showToast(`Invoice ${inv.invoiceNumber} approved`);
      render();
    });
  });

  document.querySelectorAll('[data-action="reject"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.invoiceId;
      const inv = getInvoiceById(id);
      updateInvoiceStatus(id, { status: 'rejected' });
      showToast(`Invoice ${inv.invoiceNumber} rejected`, 'error');
      render();
    });
  });

  document.querySelectorAll('[data-action="fund"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const oppId = btn.dataset.oppId;
      const opp = getFundingOpportunities().find((o) => o.id === oppId);
      const inv = getInvoiceById(opp.invoiceId);

      updateOpportunityStatus(oppId, 'funded');
      updateInvoiceStatus(opp.invoiceId, {
        status: 'funded',
        fundingStatus: 'disbursed',
        fundedDate: new Date().toISOString().split('T')[0],
        fundedAmount: inv.discountOffer?.netProceeds || inv.amount - opp.expectedYield,
        funderId: 'BNK-001',
      });
      showToast(`Funded ${formatCurrency(opp.amount)} to ${opp.supplierName}`);
      render();
    });
  });

  document.querySelectorAll('[data-action="decline"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      updateOpportunityStatus(btn.dataset.oppId, 'declined');
      showToast('Opportunity declined', 'error');
      render();
    });
  });

  document.querySelectorAll('tr[data-invoice-id]:not(.cf-invoice-row)').forEach((row) => {
    row.addEventListener('click', () => {
      const inv = getInvoiceById(row.dataset.invoiceId);
      showModal({
        title: `Invoice ${inv.invoiceNumber}`,
        body: Views.invoiceDetail(inv),
        footer: `<button class="btn btn-secondary" data-action="close-modal">Close</button>`,
      });
      bindModalEvents();
    });
  });

  document.querySelectorAll('.filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.filter;
      document.querySelectorAll('#invoice-table tbody tr, .data-table tbody tr[data-status]').forEach((row) => {
        if (filter === 'all' || row.dataset.status === filter) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });

  document.querySelector('#add-supplier-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const companyName = form.companyName.value.trim();
    const pocName = form.pocName.value.trim();
    const designation = form.designation.value.trim();
    const email = form.email.value.trim();

    if (!companyName || !pocName || !designation || !email) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const programId = form.programId?.value;
    if (!programId) {
      showToast('Select a program to enroll this supplier', 'error');
      return;
    }

    const supplier = addSupplier({
      companyName,
      ntn: form.ntn.value.trim(),
      industry: form.industry.value,
      city: form.city.value.trim(),
      pocName,
      designation,
      email,
      phone: form.phone.value.trim(),
      programId,
      paymentTerms: parseInt(form.paymentTerms.value, 10) || 60,
      riskRating: form.riskRating.value,
      notes: form.notes.value.trim(),
    });

    showToast(`${supplier.name} enrolled in program as ${supplier.id}`);
    location.hash = '#/buyer/suppliers';
  });

  document.querySelector('[data-action="cancel-add-supplier"]')?.addEventListener('click', () => {
    location.hash = '#/buyer/suppliers';
  });

  document.querySelector('#add-bank-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const programId = form.programId.value;
    const bankId = form.bankId.value;
    try {
      const bank = addBankToProgram({ programId, bankId });
      const program = getProgramById(programId);
      showToast(`${bank.name} enrolled in ${program.name}`);
      location.hash = '#/buyer/programs';
    } catch (err) {
      showToast(err.message || 'Could not enroll bank', 'error');
    }
  });

  document.querySelector('[data-action="cancel-add-bank"]')?.addEventListener('click', () => {
    location.hash = '#/buyer/programs';
  });

  /* ── Manage Program: suppliers & funders ───────────────── */
  document.querySelector('[data-action="mp-add-supplier"]')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="mp-add-supplier"]');
    const programId = btn.dataset.programId;
    const available = getAvailableSuppliersForProgram(programId);
    showModal({
      title: 'Add Supplier',
      body: Views.mpAddSupplierModal(programId, available, getNextSupplierId()),
      footer: `
        <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
        <button class="btn btn-primary" data-action="confirm-mp-add-supplier" data-program-id="${programId}">Add Supplier</button>
      `,
    });
    bindModalEvents();
  });

  document.querySelectorAll('[data-action="mp-edit-supplier"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const supplier = getData().suppliers.find((s) => s.id === btn.dataset.supplierId);
      if (!supplier) return;
      showModal({
        title: 'Edit Supplier',
        body: Views.mpEditSupplierModal(supplier),
        footer: `
          <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
          <button class="btn btn-primary" data-action="confirm-mp-edit-supplier"
                  data-supplier-id="${supplier.id}" data-program-id="${btn.dataset.programId}">Save Changes</button>
        `,
      });
      bindModalEvents();
    });
  });

  document.querySelectorAll('[data-action="mp-delete-supplier"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      showModal({
        title: 'Remove Supplier',
        body: `<p>Remove <strong>${btn.dataset.supplierName}</strong> from this program?</p>`,
        footer: `
          <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
          <button class="btn btn-primary mp-btn-danger-solid" data-action="confirm-mp-delete-supplier"
                  data-supplier-id="${btn.dataset.supplierId}" data-program-id="${btn.dataset.programId}">Remove</button>
        `,
      });
      bindModalEvents();
    });
  });

  document.querySelector('[data-action="mp-add-funder"]')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="mp-add-funder"]');
    const programId = btn.dataset.programId;
    const available = getAvailableBanksForProgram(programId);
    showModal({
      title: 'Add Funder',
      body: Views.mpAddFunderModal(programId, available),
      footer: available.length ? `
        <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
        <button class="btn btn-primary" data-action="confirm-mp-add-funder" data-program-id="${programId}">Add Funder</button>
      ` : `<button class="btn btn-secondary" data-action="close-modal">Close</button>`,
    });
    bindModalEvents();
  });

  document.querySelectorAll('[data-action="mp-edit-funder"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bank = getData().banks.find((b) => b.id === btn.dataset.bankId);
      const program = getProgramById(btn.dataset.programId);
      if (!bank || !program) return;
      showModal({
        title: 'Edit Funder',
        body: Views.mpEditFunderModal(bank, program.id, program.currency || 'PKR'),
        footer: `
          <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
          <button class="btn btn-primary" data-action="confirm-mp-edit-funder"
                  data-bank-id="${bank.id}" data-program-id="${program.id}">Save Changes</button>
        `,
      });
      bindModalEvents();
    });
  });

  document.querySelectorAll('[data-action="mp-delete-funder"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      showModal({
        title: 'Remove Funder',
        body: `<p>Remove <strong>${btn.dataset.bankName}</strong> from this program?</p>`,
        footer: `
          <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
          <button class="btn btn-primary mp-btn-danger-solid" data-action="confirm-mp-delete-funder"
                  data-bank-id="${btn.dataset.bankId}" data-program-id="${btn.dataset.programId}">Remove</button>
        `,
      });
      bindModalEvents();
    });
  });

  document.querySelectorAll('input[name="programId"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const select = document.getElementById('bank-select');
      if (!select || !radio.checked) return;
      const available = getAvailableBanksForProgram(radio.value);
      select.innerHTML = available.length
        ? available.map((b) => `<option value="${b.id}">${b.id} · ${b.name} — ${b.pocName}</option>`).join('')
        : '<option value="">No banks available</option>';
    });
  });

  /* ── Create Program (simplified single-page form) ──────── */
  document.querySelectorAll('.cp-selectable-row').forEach((row) => {
    row.addEventListener('click', () => {
      const isSelected = row.classList.toggle('cp-row-selected');
      const type = row.dataset.type;
      const id = row.dataset.id;
      const label = row.dataset.label;

      const chipsEl = document.getElementById(
        type === 'supplier' ? 'selected-suppliers-chips' : 'selected-banks-chips'
      );
      const areaEl = document.getElementById(
        type === 'supplier' ? 'selected-suppliers-area' : 'selected-banks-area'
      );

      if (isSelected) {
        const chip = document.createElement('span');
        chip.className = 'cp-chip';
        chip.dataset.id = id;
        chip.innerHTML = `${id} &middot; ${label} <button type="button" class="cp-chip-remove" data-id="${id}" data-type="${type}">&times;</button>`;
        chipsEl.appendChild(chip);
      } else {
        chipsEl.querySelector(`.cp-chip[data-id="${id}"]`)?.remove();
      }

      if (areaEl) areaEl.style.display = chipsEl.children.length ? '' : 'none';
    });
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.cp-chip-remove');
    if (!btn) return;
    const id = btn.dataset.id;
    const type = btn.dataset.type;
    document.querySelector(`.cp-selectable-row[data-id="${id}"][data-type="${type}"]`)?.classList.remove('cp-row-selected');
    btn.closest('.cp-chip')?.remove();
    const chipsEl = document.getElementById(
      type === 'supplier' ? 'selected-suppliers-chips' : 'selected-banks-chips'
    );
    const areaEl = document.getElementById(
      type === 'supplier' ? 'selected-suppliers-area' : 'selected-banks-area'
    );
    if (areaEl) areaEl.style.display = chipsEl?.children.length ? '' : 'none';
  });

  document.querySelector('#create-program-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.elements['programName'].value;
    const supplierIds = Array.from(
      document.querySelectorAll('.cp-selectable-row[data-type="supplier"].cp-row-selected')
    ).map((r) => r.dataset.id);
    const funderIds = Array.from(
      document.querySelectorAll('.cp-selectable-row[data-type="bank"].cp-row-selected')
    ).map((r) => r.dataset.id);

    const program = addProgram({ name, supplierIds, funderIds });
    showToast('Program created successfully');
    location.hash = '#/buyer/programs';
  });

  /* ── Create Transaction wizard ─────────────────────────── */
  document.querySelector('#create-txn-form-1')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const radios = form.querySelectorAll('[name="txnProgramId"]');
    let txnProgramId = '';
    radios.forEach((r) => { if (r.checked) txnProgramId = r.value; });
    setState({
      createTxnStep: 2,
      createTxnData: { ...(getState().createTxnData || {}), txnProgramId },
    });
    render();
  });

  document.querySelector('#create-txn-form-2')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    let txnSupplierId = '', txnFunderId = '';
    form.querySelectorAll('[name="txnSupplierId"]').forEach((r) => { if (r.checked) txnSupplierId = r.value; });
    form.querySelectorAll('[name="txnFunderId"]').forEach((r) => { if (r.checked) txnFunderId = r.value; });
    setState({
      createTxnStep: 3,
      createTxnData: { ...(getState().createTxnData || {}), txnSupplierId, txnFunderId },
    });
    render();
  });

  document.querySelector('#create-txn-form-3')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const txnInvoiceIds = [];
    form.querySelectorAll('[name="txnInvoiceIds"]:checked').forEach((cb) => txnInvoiceIds.push(cb.value));
    if (!txnInvoiceIds.length) {
      showToast('Please select at least one invoice', 'error');
      return;
    }
    const total = txnInvoiceIds.reduce((s, id) => {
      const inv = getInvoiceById(id);
      return s + (inv ? inv.amount : 0);
    }, 0);
    setState({
      createTxnStep: 4,
      createTxnData: { ...(getState().createTxnData || {}), txnInvoiceIds, txnTotal: total },
    });
    render();
  });

  document.querySelector('[data-action="create-txn-prev"]')?.addEventListener('click', () => {
    setState({ createTxnStep: Math.max(1, (getState().createTxnStep || 1) - 1) });
    render();
  });

  document.querySelector('[data-action="create-txn-submit"]')?.addEventListener('click', (e) => {
    const fd = getState().createTxnData || {};
    const totalEl = e.target.dataset.total;
    const buyer = getParty('buyer');
    const txn = createSCFTransaction({
      programId: fd.txnProgramId,
      buyerId: buyer.id,
      supplierId: fd.txnSupplierId,
      funderId: fd.txnFunderId,
      invoiceIds: fd.txnInvoiceIds || [],
      totalAmount: parseFloat(totalEl) || fd.txnTotal || 0,
    });
    setState({ createTxnStep: 1, createTxnData: {} });
    showToast(`Transaction ${txn.id} submitted for funder review`);
    location.hash = '#/buyer/transactions';
  });

  /* ── Invoice selection total ───────────────────────────── */
  document.querySelectorAll('[name="txnInvoiceIds"]').forEach((cb) => {
    cb.addEventListener('change', () => {
      const fd = getState().createTxnData || {};
      const program = getProgramById(fd.txnProgramId);
      const checked = document.querySelectorAll('[name="txnInvoiceIds"]:checked');
      let total = 0;
      checked.forEach((c) => {
        const inv = getInvoiceById(c.value);
        if (inv) total += inv.amount;
      });
      const el = document.getElementById('invoice-selected-total');
      if (el) el.textContent = formatAmt(total, program?.currency || 'PKR');
    });
  });

  /* ── Funder actions ────────────────────────────────────── */
  document.querySelectorAll('[data-action="funder-approve"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const txnId = btn.dataset.txnId;
      const now = new Date().toISOString().split('T')[0];
      updateTransactionStatus(txnId, { status: 'approved', approvedDate: now });
      updateTransactionTimeline(txnId, 5, now);
      showToast(`Transaction ${txnId} approved — ready to disburse`);
      render();
    });
  });

  document.querySelectorAll('[data-action="funder-reject"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const txnId = btn.dataset.txnId;
      updateTransactionStatus(txnId, { status: 'rejected' });
      showToast(`Transaction ${txnId} rejected`, 'error');
      render();
    });
  });

  document.querySelectorAll('[data-action="funder-disburse"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const txnId = btn.dataset.txnId;
      const txn = getTransactionById(txnId);
      const now = new Date().toISOString().split('T')[0];
      updateTransactionStatus(txnId, { status: 'repaying', disbursedDate: now });
      updateTransactionTimeline(txnId, 6, now);
      updateTransactionTimeline(txnId, 7, now);
      getData().activities.unshift({
        id: `ACT-${Date.now()}`,
        type: 'funds_disbursed',
        title: `${formatAmt(txn.totalAmount, txn.currency)} disbursed to ${getCompanyName(txn.supplierId)} for ${txnId}`,
        party: getParty('funder').name,
        timestamp: new Date().toISOString(),
        roles: ['supplier', 'funder', 'buyer'],
      });
      showToast(`${formatAmt(txn.totalAmount, txn.currency)} disbursed to ${getCompanyName(txn.supplierId)}`);
      render();
    });
  });

  /* ── KYC activation ────────────────────────────────────── */
  document.querySelector('#kyc-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const invId = form.querySelector('[data-inv-id]')?.dataset.invId
      || form.querySelector('[type="submit"]')?.dataset.invId;
    const financingLimit = form.elements['financingLimit']?.value;
    const agreedRate = form.elements['agreedRate']?.value;

    const invitations = getInvitationsForRole('funder');
    const inv = invitations[0];
    if (inv) {
      activateFunderInvitation(inv.id, { financingLimit, agreedRate });
      showToast(`KYC approved — ${getParty('funder').name} is now active`);
      render();
    }
  });

  /* ── Accept supplier invitation ────────────────────────── */
  document.querySelectorAll('[data-action="accept-invitation"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const invId = btn.dataset.invId;
      showModal({
        title: 'Accept Invitation — Add Bank Account',
        body: `
          <p class="text-secondary mb-4">Provide your beneficiary bank account details to receive financing payments.</p>
          <form id="bank-account-form">
            <div class="form-group mb-4">
              <label class="form-label">Bank Name <span class="required">*</span></label>
              <input class="form-input" name="bankName" required placeholder="e.g. Bank Al Habib" value="Bank Al Habib" />
            </div>
            <div class="form-group mb-4">
              <label class="form-label">Account Number <span class="required">*</span></label>
              <input class="form-input" name="accountNumber" required placeholder="e.g. 0123-1234567890" value="0123-1234567890" />
            </div>
            <div class="form-group mb-4">
              <label class="form-label">Account Title <span class="required">*</span></label>
              <input class="form-input" name="accountTitle" required placeholder="Company legal name" value="${getParty('supplier').name}" />
            </div>
            <div class="form-group mb-4">
              <label class="form-label">IBAN</label>
              <input class="form-input" name="iban" placeholder="PK36BAHL..." value="PK36BAHL0123001234567890" />
            </div>
          </form>
        `,
        footer: `
          <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
          <button class="btn btn-primary" data-action="confirm-accept-invitation" data-inv-id="${invId}">${icon('check')} Accept &amp; Confirm</button>
        `,
      });
      bindModalEvents();
    });
  });

  document.querySelectorAll('[data-action="decline-invitation"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      showToast('Invitation declined', 'error');
    });
  });

  /* ── Buyer repay ───────────────────────────────────────── */
  document.querySelectorAll('[data-action="buyer-repay"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const txnId = btn.dataset.txnId;
      const invoiceId = btn.dataset.invoiceId;
      const inv = getInvoiceById(invoiceId);
      repayInvoice(txnId, invoiceId);
      showToast(`${inv?.invoiceNumber || invoiceId} marked as repaid`);
      render();
    });
  });

  /* ── View transaction modal ────────────────────────────── */
  document.querySelectorAll('[data-action="view-transaction"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const txnId = btn.dataset.txnId;
      const txn = getTransactionById(txnId);
      if (!txn) return;
      showModal({
        title: `Transaction ${txn.id}`,
        body: transactionModalBody(txn),
        footer: `<button class="btn btn-secondary" data-action="close-modal">Close</button>`,
      });
      bindModalEvents();
    });
  });

  document.querySelectorAll('.txn-row').forEach((row) => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      const txnId = row.dataset.txnId;
      const txn = getTransactionById(txnId);
      if (!txn) return;
      showModal({
        title: `Transaction ${txn.id}`,
        body: transactionModalBody(txn),
        footer: `<button class="btn btn-secondary" data-action="close-modal">Close</button>`,
      });
      bindModalEvents();
    });
  });

  /* ── Transaction table row clicks (from buyerTransactions / supplierTransactions / funderTransactions) */
  document.querySelectorAll('tr[data-txn-id]').forEach((row) => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('button, a')) return;
      const txn = getTransactionById(row.dataset.txnId);
      if (!txn) return;
      showModal({
        title: `Transaction ${txn.id}`,
        body: transactionModalBody(txn),
        footer: `<button class="btn btn-secondary" data-action="close-modal">Close</button>`,
      });
      bindModalEvents();
    });
  });

  /* ── Create Financing Request (single-page form) ───────────── */
  const updateTransactionSummary = () => {
    const checkboxes = document.querySelectorAll('.invoice-checkbox');
    if (!checkboxes.length) return;

    const checked = document.querySelectorAll('.invoice-checkbox:checked');
    let total = 0;
    checked.forEach((cb) => {
      const row = cb.closest('tr');
      total += parseFloat(row?.dataset.amount || 0);
    });

    const submitBtn = document.querySelector('[data-action="submit-financing-request"]');
    const rate = parseFloat(submitBtn?.dataset.rate || 18.5);
    const chargesOn = submitBtn?.dataset.chargesOn || 'buyer';
    const avgTenor = 90;
    const discount = Math.round(total * (rate / 100) * (avgTenor / 365));
    const proceeds = chargesOn === 'buyer' ? total : total - discount;

    // Highlight selected rows
    checkboxes.forEach((cb) => {
      cb.closest('tr')?.classList.toggle('cf-row-selected', cb.checked);
    });

    const count = checked.length;
    const currency = submitBtn?.dataset.currency || 'PKR';

    const selCount = document.getElementById('selected-count');
    const selTotal = document.getElementById('selected-total');
    const sumTotal = document.getElementById('sum-total');
    const sumDiscount = document.getElementById('sum-discount');
    const sumProceeds = document.getElementById('sum-proceeds');

    if (selCount) selCount.textContent = `${count} invoice${count !== 1 ? 's' : ''} selected`;
    if (selTotal) selTotal.textContent = formatAmt(total, currency);
    if (sumTotal) sumTotal.textContent = formatAmt(total, currency);
    if (sumDiscount) sumDiscount.textContent = `− ${formatAmt(discount, currency)}`;
    if (sumProceeds) sumProceeds.textContent = formatAmt(proceeds, currency);

    const selectAll = document.getElementById('select-all-invoices');
    if (selectAll) {
      selectAll.indeterminate = count > 0 && count < checkboxes.length;
      selectAll.checked = count === checkboxes.length;
    }
  };

  document.getElementById('select-all-invoices')?.addEventListener('change', (e) => {
    document.querySelectorAll('.invoice-checkbox').forEach((cb) => { cb.checked = e.target.checked; });
    updateTransactionSummary();
  });

  document.querySelectorAll('.invoice-checkbox').forEach((cb) => {
    cb.addEventListener('change', updateTransactionSummary);
  });

  document.querySelectorAll('.cf-invoice-row').forEach((row) => {
    row.addEventListener('click', (e) => {
      if (e.target.type === 'checkbox') return;
      const cb = row.querySelector('.invoice-checkbox');
      if (cb) { cb.checked = !cb.checked; updateTransactionSummary(); }
    });
  });

  document.querySelector('[data-action="save-rf-draft"]')?.addEventListener('click', () => {
    showToast('Draft saved successfully');
    location.hash = '#/buyer/transactions';
  });

  document.querySelectorAll('.rf-radio-card:not(.is-disabled)').forEach((card) => {
    card.addEventListener('click', () => {
      const input = card.querySelector('input[type="radio"]');
      if (!input || input.disabled) return;
      const group = document.querySelectorAll(`input[name="${input.name}"]`);
      group.forEach((r) => {
        r.closest('.rf-radio-card')?.classList.toggle('is-active', r === input);
      });
      input.checked = true;
    });
  });

  document.querySelector('[data-action="cancel-create-txn"]')?.addEventListener('click', () => {
    location.hash = `#/${getState().role}/transactions`;
  });

  document.querySelector('[data-action="submit-financing-request"]')?.addEventListener('click', (btn) => {
    const el = btn.target.closest('[data-action="submit-financing-request"]');
    const checked = document.querySelectorAll('.invoice-checkbox:checked');
    const selectedIds = Array.from(checked).map((cb) => cb.value);

    if (!selectedIds.length) {
      showToast('Please select at least one invoice', 'error');
      return;
    }

    const totalAmount = Array.from(checked).reduce((sum, cb) => {
      return sum + parseFloat(cb.closest('tr')?.dataset.amount || 0);
    }, 0);

    const txn = createSCFTransaction({
      programId: el.dataset.programId,
      buyerId: el.dataset.buyerId,
      supplierId: el.dataset.supplierId,
      funderId: el.dataset.funderId,
      invoiceIds: selectedIds,
      totalAmount,
    });

    showToast(`Transaction ${txn.id} submitted — ${formatAmt(totalAmount, el.dataset.currency || 'PKR')}`);
    location.hash = '#/buyer/transactions';
  });

  document.querySelector('[data-action="submit-invoice"]')?.addEventListener('click', () => {
    showModal({
      title: 'Submit New Invoice',
      body: `
        <div class="form-group">
          <label class="form-label">Invoice Number</label>
          <input class="form-input" placeholder="e.g. PC-8900" />
        </div>
        <div class="form-group">
          <label class="form-label">PO Number</label>
          <input class="form-input" placeholder="e.g. MRG-PO-23001" />
        </div>
        <div class="form-group">
          <label class="form-label">Amount (USD)</label>
          <input class="form-input" type="number" placeholder="0.00" />
        </div>
        <div class="form-group">
          <label class="form-label">Due Date</label>
          <input class="form-input" type="date" />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-textarea" placeholder="Goods or services description"></textarea>
        </div>
      `,
      footer: `
        <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
        <button class="btn btn-primary" data-action="close-modal">Submit</button>
      `,
    });
    bindModalEvents();
  });
}

function bindModalEvents() {
  document.querySelectorAll('[data-action="close-modal"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById('modal-root').innerHTML = '';
    });
  });

  document.querySelector('[data-action="confirm-mp-add-supplier"]')?.addEventListener('click', (e) => {
    const programId = e.target.dataset.programId;
    const existingId = document.getElementById('mp-existing-supplier')?.value;

    if (existingId) {
      enrollExistingSupplierInProgram(existingId, programId);
      document.getElementById('modal-root').innerHTML = '';
      showToast('Supplier enrolled in program');
      render();
      return;
    }

    const companyName = document.getElementById('mp-supplier-company')?.value.trim();
    const pocName = document.getElementById('mp-supplier-poc')?.value.trim();
    const designation = document.getElementById('mp-supplier-designation')?.value.trim();
    const email = document.getElementById('mp-supplier-email')?.value.trim();

    if (!companyName || !pocName || !designation || !email) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const supplier = addSupplier({
      companyName,
      pocName,
      designation,
      email,
      phone: document.getElementById('mp-supplier-phone')?.value.trim() || '',
      programId,
    });

    document.getElementById('modal-root').innerHTML = '';
    showToast(`${supplier.name} added as ${supplier.id}`);
    render();
  });

  document.querySelector('[data-action="confirm-mp-edit-supplier"]')?.addEventListener('click', (e) => {
    const supplierId = e.target.dataset.supplierId;
    updateSupplierDetails(supplierId, {
      companyName: document.getElementById('mp-edit-supplier-company')?.value.trim(),
      pocName: document.getElementById('mp-edit-supplier-poc')?.value.trim(),
      designation: document.getElementById('mp-edit-supplier-designation')?.value.trim(),
      email: document.getElementById('mp-edit-supplier-email')?.value.trim(),
      phone: document.getElementById('mp-edit-supplier-phone')?.value.trim(),
      status: document.getElementById('mp-edit-supplier-status')?.value,
    });
    document.getElementById('modal-root').innerHTML = '';
    showToast('Supplier updated');
    render();
  });

  document.querySelector('[data-action="confirm-mp-delete-supplier"]')?.addEventListener('click', (e) => {
    removeSupplierFromProgram(e.target.dataset.supplierId, e.target.dataset.programId);
    document.getElementById('modal-root').innerHTML = '';
    showToast('Supplier removed from program');
    render();
  });

  document.querySelector('[data-action="confirm-mp-add-funder"]')?.addEventListener('click', (e) => {
    const programId = e.target.dataset.programId;
    const bankId = document.getElementById('mp-funder-select')?.value;
    if (!bankId) {
      showToast('Select a bank', 'error');
      return;
    }
    try {
      const bank = addBankToProgram({ programId, bankId });
      document.getElementById('modal-root').innerHTML = '';
      showToast(`${bank.name} added to program`);
      render();
    } catch (err) {
      showToast(err.message || 'Could not add funder', 'error');
    }
  });

  document.querySelector('[data-action="confirm-mp-edit-funder"]')?.addEventListener('click', (e) => {
    const bankId = e.target.dataset.bankId;
    const programId = e.target.dataset.programId;
    updateFunderProgramDetails(bankId, programId, {
      pocName: document.getElementById('mp-edit-funder-poc')?.value.trim(),
      designation: document.getElementById('mp-edit-funder-designation')?.value.trim(),
      agreedRate: parseFloat(document.getElementById('mp-edit-funder-rate')?.value) || 0,
      financingLimit: parseFloat(document.getElementById('mp-edit-funder-limit')?.value) || 0,
    });
    document.getElementById('modal-root').innerHTML = '';
    showToast('Funder updated');
    render();
  });

  document.querySelector('[data-action="confirm-mp-delete-funder"]')?.addEventListener('click', (e) => {
    removeFunderFromProgram(e.target.dataset.bankId, e.target.dataset.programId);
    document.getElementById('modal-root').innerHTML = '';
    showToast('Funder removed from program');
    render();
  });

  document.querySelector('[data-action="confirm-accept-invitation"]')?.addEventListener('click', (e) => {
    const invId = e.target.dataset.invId;
    const form = document.getElementById('bank-account-form');
    if (!form) return;
    const bankAccount = {
      bankName: form.elements['bankName'].value,
      accountNumber: form.elements['accountNumber'].value,
      accountTitle: form.elements['accountTitle'].value,
      iban: form.elements['iban'].value,
    };
    acceptSupplierInvitation(invId, bankAccount);
    document.getElementById('modal-root').innerHTML = '';
    showToast('Invitation accepted — bank account saved');
    render();
  });

  document.querySelector('[data-action="confirm-funding"]')?.addEventListener('click', (e) => {
    const id = e.target.dataset.invoiceId;
    const inv = getInvoiceById(id);
    updateInvoiceStatus(id, { fundingStatus: 'requested' });

    const existing = getFundingOpportunities().find((o) => o.invoiceId === id);
    if (!existing) {
      getData().fundingOpportunities.push({
        id: `FO-${Date.now()}`,
        invoiceId: id,
        supplierName: getParty('supplier').name,
        buyerName: getParty('buyer').name,
        amount: inv.amount,
        discountRate: inv.discountOffer.rate,
        tenor: daysUntil(inv.dueDate),
        expectedYield: inv.discountOffer.discountAmount,
        programId: inv.programId,
        status: 'available',
        submittedDate: new Date().toISOString().split('T')[0],
      });
    }

    document.getElementById('modal-root').innerHTML = '';
    showToast(`Early payment requested for ${inv.invoiceNumber}`);
    render();
  });
}

async function init() {
  await loadData();
  window.addEventListener('hashchange', render);
  if (!location.hash) location.hash = '#/';
  render();
}

init();
