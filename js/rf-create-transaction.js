/* Receivable Finance Program form — aligned with trade-origin /receiver/create-request/receivable-finance-program */

function rfStepHead(num, title, required) {
  const star = required ? '<sup class="rf-required">*</sup>' : '';
  return `
    <div class="rf-step-head">
      <span class="rf-step-num">${num}</span>
      <span class="rf-step-title">${title}${star}</span>
    </div>
  `;
}

function rfField(label, value, placeholder) {
  return `
    <div class="rf-field">
      <span class="rf-field-label">${label}</span>
      <span class="rf-field-value">${value || placeholder || ''}</span>
    </div>
  `;
}

function rfRadioCard(name, value, label, checked, extraClass) {
  return `
    <label class="rf-radio-card${checked ? ' is-active' : ''}${extraClass ? ` ${extraClass}` : ''}">
      <input type="radio" name="${name}" value="${value}"${checked ? ' checked' : ''} />
      <span>${label}</span>
    </label>
  `;
}

function renderReceivableFinanceForm(ctx) {
  const {
    buyer,
    program,
    supplier,
    bank,
    bankAccount,
    invoiceRows,
    currency,
    rate,
    funderLimit,
  } = ctx;

  const buyerLabel = `${buyer.name} -1234567890123`;
  const bankSwift = 'EPBKPKKA';
  const bankCity = 'Karachi';
  const bankPref = program.recourse === 'without_recourse' ? 'Without Recourse' : 'With Recourse';

  const invoiceTableRows = invoiceRows.map((inv) => `
    <tr class="rf-inv-row cf-invoice-row cf-row-selected" data-invoice-id="${inv.id}" data-amount="${inv.amount}">
      <td class="rf-inv-check">
        <input type="checkbox" name="selectedInvoices" value="${inv.id}" class="invoice-checkbox" checked>
      </td>
      <td><input class="rf-inv-input" value="${inv.poNumber || ''}" readonly></td>
      <td><input class="rf-inv-input text-mono" value="${inv.invoiceNumber}" readonly></td>
      <td><input class="rf-inv-input text-right" value="${inv.amount.toLocaleString()}" readonly></td>
      <td><input class="rf-inv-input" value="${formatDate(inv.issueDate)}" readonly></td>
      <td><input class="rf-inv-input" value="${inv.tenor}" readonly></td>
      <td><input class="rf-inv-input" value="Invoice Date" readonly></td>
      <td><input class="rf-inv-input" value="${formatDate(inv.issueDate)}" readonly></td>
      <td><input class="rf-inv-input" value="${formatDate(inv.dueDate)}" readonly></td>
      <td><input class="rf-inv-input" value="Land" readonly></td>
      <td><input class="rf-inv-input" value="No" readonly></td>
    </tr>
  `).join('');

  const totalAmount = invoiceRows.reduce((s, i) => s + i.amount, 0);

  return `
    <div class="rf-page">
      <div class="rf-page-intro">
        <h2 class="rf-page-title">Receivable Finance Program</h2>
        <p class="rf-page-desc">Create your Receivable Finance Program request here</p>
      </div>

      <div class="rf-form" id="create-txn-form">
        <!-- Step 1: Buyer Details -->
        <section class="rf-step">
          ${rfStepHead(1, 'Buyer Details', true)}
          <div class="rf-panel">
            <div class="rf-field-grid">
              ${rfField('Name of Buyer*', buyerLabel, 'Select buyer')}
              ${rfField('Country of Buyer', buyer.country || 'Pakistan', 'The Data will be fetched here')}
              ${rfField('Address', 'Plot 12, Main Boulevard, Lahore', 'Fetch address')}
              ${rfField('CR Number', '1234567890123', 'Fetch CR')}
            </div>
          </div>
        </section>

        <!-- Step 2: Transaction Type -->
        <section class="rf-step">
          ${rfStepHead(2, 'Transaction Type')}
          <div class="rf-radio-row">
            ${rfRadioCard('isLocalTransit', 'local', 'Local', true)}
            ${rfRadioCard('isLocalTransit', 'international', 'International', false)}
          </div>
        </section>

        <!-- Step 3: Invoice Details -->
        <section class="rf-step">
          <div class="rf-step-head rf-step-head-split">
            <div class="rf-step-head-left">
              <span class="rf-step-num">3</span>
              <span class="rf-step-title">Invoice Details</span>
            </div>
            <span class="rf-currency-chip">${currency}</span>
          </div>
          <div class="rf-inv-scroll">
            <table class="rf-inv-table">
              <thead>
                <tr>
                  <th></th>
                  <th>PO Number*</th>
                  <th>Invoice Number*</th>
                  <th>Amount*</th>
                  <th>Invoice Date*</th>
                  <th>Tenor (days)*</th>
                  <th>Payment Terms*</th>
                  <th>Delivery / BL Date*</th>
                  <th>Invoice Maturity Date</th>
                  <th>Mode of Shipment</th>
                  <th>Transshipment</th>
                </tr>
              </thead>
              <tbody>${invoiceTableRows}</tbody>
            </table>
          </div>
          <div class="cf-selection-bar" id="invoice-selection-bar">
            <span class="cf-sel-count" id="selected-count">${invoiceRows.length} invoice${invoiceRows.length !== 1 ? 's' : ''} selected</span>
            <span class="cf-sel-divider">·</span>
            <span class="cf-sel-label">Total Amount:</span>
            <span class="cf-sel-total" id="selected-total">${formatAmt(totalAmount, currency)}</span>
          </div>
        </section>

        <!-- Step 5: Select Banks -->
        <section class="rf-step">
          <div class="rf-step-head rf-step-head-split">
            <div class="rf-step-head-left">
              <span class="rf-step-num">5</span>
              <span class="rf-step-title">Select banks you want to send your Funders request to</span>
            </div>
            <label class="rf-check-inline">
              <input type="checkbox" checked disabled> Send to all banks
            </label>
          </div>
          <div class="rf-field-grid rf-field-grid-3">
            ${rfField('Bank', bank?.name || '', 'Select bank')}
            ${rfField('Country', bank?.country || 'Pakistan', 'The Data will be fetched here')}
            ${rfField('City', bankCity, 'The Data will be fetched here')}
            ${rfField('Swift Code', bankSwift, 'The Data will be fetched here')}
            ${rfField('Receivable Finance Type', bankPref, 'The Data will be fetched here')}
            ${rfField('Bank Limit', formatAmt(funderLimit || program.limit, currency), 'The Data will be fetched here')}
          </div>
          <div class="rf-bank-chip">
            ${bank?.name || ''} (${rate}% P.A) – ${bankSwift} – Pakistan
          </div>
          <div class="rf-panel rf-consent">
            <p class="rf-consent-title">Do you consent to send this request to external banks? <sup class="rf-required">*</sup></p>
            <div class="rf-radio-row">
              ${rfRadioCard('isConsentToSendOtherBanks', 'yes', 'Yes', false, 'is-disabled')}
              ${rfRadioCard('isConsentToSendOtherBanks', 'no', 'No', true)}
            </div>
          </div>
        </section>

        <!-- Step 6: Beneficiary -->
        <section class="rf-step">
          ${rfStepHead(6, 'Beneficiary Credit Details — WHERE THE BANK WILL CREDIT FUND', true)}
          <div class="rf-panel">
            <div class="rf-field-grid">
              ${rfField('Bank Name*', bankAccount?.bankName || '', 'Select')}
              ${rfField('Account Title*', bankAccount?.accountTitle || supplier?.name || '', 'Title will be fetched here')}
              ${rfField('Bank Country', 'Pakistan', 'Country will be fetched here')}
              ${rfField('IBAN Number*', bankAccount?.iban || '', 'IBAN will be fetched here')}
              ${rfField('Account Currency', currency, 'Currency will be fetched here')}
              ${rfField('Bank Swift Code', bankSwift, 'Swift will be fetched here')}
            </div>
          </div>
        </section>

        <!-- Step 7: Executing Date -->
        <section class="rf-step rf-step-muted">
          ${rfStepHead(7, 'Expected Date of Executing Receivable Finance Discounting Transaction')}
          <input type="date" class="rf-date-input" name="expectedDiscountingDate">
        </section>

        <!-- Step 8: Discounting Charges -->
        <section class="rf-step">
          ${rfStepHead(8, 'Discounting Charges', true)}
          <div class="rf-panel">
            <div class="rf-radio-row">
              ${rfRadioCard('discountingChargesOnAccountOf', 'supplier', 'Exporter / Supplier', false)}
              ${rfRadioCard('discountingChargesOnAccountOf', 'buyer', 'Buyer', true)}
            </div>
          </div>
        </section>

        <!-- Step 9: Fees -->
        <section class="rf-step">
          ${rfStepHead(9, 'Fees')}
          <div class="rf-panel">
            <p class="rf-sub-label">Bank fees on account of <sup class="rf-required">*</sup></p>
            <div class="rf-radio-row mb-3">
              ${rfRadioCard('feeOnAccountOf', 'supplier', 'Exporter / Supplier', false)}
              ${rfRadioCard('feeOnAccountOf', 'buyer', 'Buyer', true)}
            </div>
            <div class="rf-radio-row">
              ${rfRadioCard('feeType', 'amount', 'Amount', true)}
              ${rfRadioCard('feeType', 'percentage', 'On Percentage', false)}
            </div>
          </div>
        </section>

        <!-- Step 10: Product Description -->
        <section class="rf-step">
          ${rfStepHead(10, 'Product / Service Description')}
          <div class="rf-panel">
            <textarea class="rf-textarea" name="productDescription" placeholder="Enter product or service description (max 50 characters)" maxlength="50" rows="2">${invoiceRows[0]?.description || 'Food supply'}</textarea>
            <button type="button" class="rf-add-desc" disabled>+ Add an additional Product/service description</button>
          </div>
        </section>

        <!-- Step 11: Remarks -->
        <section class="rf-step">
          ${rfStepHead(11, 'Remarks')}
          <div class="rf-panel">
            <textarea class="rf-textarea" name="remarks" placeholder="Enter remarks (max 50 characters)" maxlength="50" rows="2"></textarea>
          </div>
        </section>

        <!-- Step 12: Last Date for Receiving Bid -->
        <section class="rf-step">
          ${rfStepHead(12, 'Last Date for Receiving Bid (Transaction will get expired for all parties involved on this date)', true)}
          <div class="rf-panel">
            <div class="rf-date-row">
              <input type="date" class="rf-date-input" name="lastDateOfReceivingBids">
              <input type="time" class="rf-date-input" name="bidTime" value="17:00">
            </div>
          </div>
        </section>

        <div class="rf-form-actions" id="lastStep">
          <button type="button" class="btn btn-secondary rf-btn-draft" data-action="save-rf-draft">Save as Draft</button>
          <button type="button" class="btn btn-primary rf-btn-submit"
                  data-action="submit-financing-request"
                  data-program-id="${program.id}"
                  data-buyer-id="${buyer.id}"
                  data-supplier-id="${supplier?.id || ''}"
                  data-funder-id="${bank?.id || ''}"
                  data-currency="${currency}"
                  data-rate="${rate}"
                  data-charges-on="${program.chargesOn || 'buyer'}">
            Submit Request
          </button>
        </div>
      </div>
    </div>
  `;
}
