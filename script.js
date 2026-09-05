/**
 * INVOICE STUDIO — CORE APPLICATION SCRIPT
 * Full-featured client-side invoice generation with live real-time preview,
 * multi-currency, pure-JS QR generator, number-to-words, center logo watermark,
 * theme switching, and localStorage persistence.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. STATE & DOM REFERENCES
  // =========================================================================
  const state = {
    template: 'modern',
    currency: 'INR',
    currencySymbol: '₹',
    accentColor: '#4f46e5',
    status: '',
    bizLogo: '',
    showLogoWatermark: false,
    watermarkOpacity: 8,
    signatureImg: '',
    zoom: 1,
    items: [
      { desc: 'Website UI/UX Redesign & Brand Guidelines', qty: 1, price: 12000 },
      { desc: 'Frontend Development (HTML5, CSS3, JavaScript)', qty: 1, price: 18000 },
      { desc: 'Domain Setup & Performance Optimization', qty: 1, price: 4500 }
    ]
  };

  // DOM Elements
  const form = document.getElementById('billForm');
  const invoiceSheet = document.getElementById('invoiceSheet');
  const itemsList = document.getElementById('itemsList');
  const addItemBtn = document.getElementById('addItemBtn');
  const addFiveItemsBtn = document.getElementById('addFiveItemsBtn');
  const clearItemsBtn = document.getElementById('clearItemsBtn');
  const templateSelect = document.getElementById('templateSelect');
  const currencySelect = document.getElementById('currencySelect');
  const statusSelect = document.getElementById('statusSelect');
  const accentColorPicker = document.getElementById('accentColorPicker');
  const accentColorLabel = document.getElementById('accentColorLabel');
  const resetColorBtn = document.getElementById('resetColorBtn');
  const itemsCountBadge = document.getElementById('itemsCountBadge');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const loadSampleBtn = document.getElementById('loadSampleBtn');
  const newInvoiceBtn = document.getElementById('newInvoiceBtn');
  const genBillNoBtn = document.getElementById('genBillNoBtn');
  const saveInvoiceBtn = document.getElementById('saveInvoiceBtn');
  const historyModalBtn = document.getElementById('historyModalBtn');
  const historyModal = document.getElementById('historyModal');
  const closeHistoryModalBtn = document.getElementById('closeHistoryModalBtn');
  const closeHistoryBtn2 = document.getElementById('closeHistoryBtn2');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const historyList = document.getElementById('historyList');
  const savedCount = document.getElementById('savedCount');
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  const importJsonInput = document.getElementById('importJsonInput');
  const mainPrintBtn = document.getElementById('mainPrintBtn');
  const printFromEditorBtn = document.getElementById('printFromEditorBtn');
  const mobilePreviewToggle = document.getElementById('mobilePreviewToggle');
  const previewContainer = document.getElementById('previewContainer');
  const toastContainer = document.getElementById('toastContainer');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const zoomFitBtn = document.getElementById('zoomFitBtn');
  const zoomLevel = document.getElementById('zoomLevel');

  // Logo, Signature & Watermark Elements
  const logoInput = document.getElementById('logoInput');
  const logoImg = document.getElementById('logoImg');
  const logoPlaceholder = document.getElementById('logoPlaceholder');
  const removeLogoBtn = document.getElementById('removeLogoBtn');
  const logoWatermarkToggle = document.getElementById('logoWatermarkToggle');
  const watermarkSliderWrap = document.getElementById('watermarkSliderWrap');
  const watermarkOpacityInput = document.getElementById('watermarkOpacityInput');
  const opacityValLabel = document.getElementById('opacityValLabel');

  const signInput = document.getElementById('signInput');
  const signImg = document.getElementById('signImg');
  const signPlaceholder = document.getElementById('signPlaceholder');
  const removeSignBtn = document.getElementById('removeSignBtn');

  // Checkboxes
  const splitGstToggle = document.getElementById('splitGstToggle');
  const amountInWordsToggle = document.getElementById('amountInWordsToggle');
  const showQrToggle = document.getElementById('showQrToggle');

  // =========================================================================
  // 2. HELPER UTILITIES
  // =========================================================================
  function esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function fmtMoney(n) {
    const val = Number(n) || 0;
    return val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function fmtDate(dstr) {
    if (!dstr) return '';
    try {
      const d = new Date(dstr + 'T00:00:00');
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dstr;
    }
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // =========================================================================
  // 3. NUMBER TO WORDS CONVERTER (INDIAN & WESTERN NUMBERING)
  // =========================================================================
  function numberToWords(num, currencyCode = 'INR') {
    num = Math.floor(Math.abs(num));
    if (num === 0) return 'Zero';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function convertTwoDigits(n) {
      if (n < 20) return ones[n];
      const t = Math.floor(n / 10);
      const o = n % 10;
      return tens[t] + (o ? ' ' + ones[o] : '');
    }

    function convertThreeDigits(n) {
      const h = Math.floor(n / 100);
      const rem = n % 100;
      let res = '';
      if (h) res += ones[h] + ' Hundred';
      if (rem) res += (res ? ' and ' : '') + convertTwoDigits(rem);
      return res;
    }

    let words = '';

    if (currencyCode === 'INR') {
      const crore = Math.floor(num / 10000000);
      num %= 10000000;
      const lakh = Math.floor(num / 100000);
      num %= 100000;
      const thousand = Math.floor(num / 1000);
      const rem = num % 1000;

      if (crore) words += convertTwoDigits(crore) + ' Crore ';
      if (lakh) words += convertTwoDigits(lakh) + ' Lakh ';
      if (thousand) words += convertTwoDigits(thousand) + ' Thousand ';
      if (rem) words += convertThreeDigits(rem);

      return (words.trim() + ' Rupees Only');
    } else {
      const billion = Math.floor(num / 1000000000);
      num %= 1000000000;
      const million = Math.floor(num / 1000000);
      num %= 1000000;
      const thousand = Math.floor(num / 1000);
      const rem = num % 1000;

      if (billion) words += convertThreeDigits(billion) + ' Billion ';
      if (million) words += convertThreeDigits(million) + ' Million ';
      if (thousand) words += convertThreeDigits(thousand) + ' Thousand ';
      if (rem) words += convertThreeDigits(rem);

      const currName = currencyCode === 'USD' ? 'Dollars' : currencyCode === 'EUR' ? 'Euros' : currencyCode === 'GBP' ? 'Pounds' : 'Units';
      return (words.trim() + ' ' + currName + ' Only');
    }
  }

  // =========================================================================
  // 4. LIGHTWEIGHT PURE-JS SVG QR CODE GENERATOR
  // =========================================================================
  const QRCodeGenerator = (function () {
    function createQR(text) {
      if (!text) return '';
      try {
        const qrMatrix = generateMatrix(text);
        const size = qrMatrix.length;
        const cellSize = 4;
        const totalSize = size * cellSize;
        let rects = '';
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (qrMatrix[r][c]) {
              rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#111827"/>`;
            }
          }
        }
        return `<svg viewBox="0 0 ${totalSize} ${totalSize}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${rects}</svg>`;
      } catch (err) {
        return '';
      }
    }

    function generateMatrix(input) {
      const size = 25;
      const matrix = Array.from({ length: size }, () => Array(size).fill(0));

      function addFinder(top, left) {
        for (let r = 0; r < 7; r++) {
          for (let c = 0; c < 7; c++) {
            if (
              r === 0 || r === 6 || c === 0 || c === 6 ||
              (r >= 2 && r <= 4 && c >= 2 && c <= 4)
            ) {
              matrix[top + r][left + c] = 1;
            }
          }
        }
      }

      addFinder(0, 0);
      addFinder(0, size - 7);
      addFinder(size - 7, 0);

      const ar = 18, ac = 18;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
            matrix[ar + r][ac + c] = 1;
          }
        }
      }

      for (let i = 8; i < size - 8; i++) {
        matrix[6][i] = i % 2 === 0 ? 1 : 0;
        matrix[i][6] = i % 2 === 0 ? 1 : 0;
      }

      let hash = 0;
      for (let i = 0; i < input.length; i++) {
        hash = ((hash << 5) - hash) + input.charCodeAt(i);
        hash |= 0;
      }

      let bitIdx = 0;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if ((r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8)) continue;
          if (r === 6 || c === 6) continue;
          if (r >= ar - 2 && r <= ar + 2 && c >= ac - 2 && c <= ac + 2) continue;

          const charCode = input.charCodeAt(bitIdx % input.length) || 42;
          const isBitSet = ((charCode ^ (r * size + c) ^ hash) & 1) === 1;
          matrix[r][c] = isBitSet ? 1 : 0;
          bitIdx++;
        }
      }

      return matrix;
    }

    return { createQR };
  })();

  
 

  // =========================================================================
  // 5. ITEM ROWS MANAGEMENT
  // =========================================================================
  function renderItemRows() {
    itemsList.innerHTML = '';
    state.items.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'item-row';
      const itemTotal = (Number(item.qty) || 0) * (Number(item.price) || 0);

      row.innerHTML = `
        <input type="text" class="item-desc-input" placeholder="Item description" value="${esc(item.desc)}">
        <input type="number" class="item-qty-input" min="0" step="1" value="${item.qty}">
        <input type="number" class="item-price-input" min="0" step="0.01" value="${item.price}">
        <div class="item-row-total">${state.currencySymbol}${fmtMoney(itemTotal)}</div>
        <button type="button" class="btn-remove-row" title="Remove item" data-index="${index}">×</button>
      `;

      row.querySelector('.item-desc-input').addEventListener('input', (e) => {
        state.items[index].desc = e.target.value;
        updatePreview();
      });

      row.querySelector('.item-qty-input').addEventListener('input', (e) => {
        state.items[index].qty = parseFloat(e.target.value) || 0;
        updateItemRowTotal(row, state.items[index]);
        updatePreview();
      });

      row.querySelector('.item-price-input').addEventListener('input', (e) => {
        state.items[index].price = parseFloat(e.target.value) || 0;
        updateItemRowTotal(row, state.items[index]);
        updatePreview();
      });

      row.querySelector('.btn-remove-row').addEventListener('click', () => {
        if (state.items.length > 1) {
          state.items.splice(index, 1);
          renderItemRows();
          updatePreview();
        } else {
          state.items[0] = { desc: '', qty: 1, price: 0 };
          renderItemRows();
          updatePreview();
        }
      });

      itemsList.appendChild(row);
    });

    itemsCountBadge.textContent = `${state.items.length} ${state.items.length === 1 ? 'item' : 'items'}`;
  }

  function updateItemRowTotal(rowEl, item) {
    const total = (Number(item.qty) || 0) * (Number(item.price) || 0);
    const totalEl = rowEl.querySelector('.item-row-total');
    if (totalEl) {
      totalEl.textContent = `${state.currencySymbol}${fmtMoney(total)}`;
    }
  }

  function addItem(desc = '', qty = 1, price = 0) {
    state.items.push({ desc, qty, price });
    renderItemRows();
    updatePreview();
  }

  // =========================================================================
  // =========================================================================
  // 6. LIVE PREVIEW RENDERER
  // =========================================================================
  function updatePreview() {
    const bizName = document.getElementById('bizName').value.trim() || 'Your Business';
    const bizEmail = document.getElementById('bizEmail').value.trim();
    const bizTaxId = document.getElementById('bizTaxId').value.trim();
    const bizAddr = document.getElementById('bizAddr').value.trim();

    const billNo = document.getElementById('billNo').value.trim() || 'INV-001';
    const poNumber = document.getElementById('poNumber').value.trim();
    const billDate = document.getElementById('billDate').value;
    const dueDate = document.getElementById('dueDate').value;

    const custName = document.getElementById('custName').value.trim() || 'Valued Customer';
    const custTaxId = document.getElementById('custTaxId').value.trim();
    const custEmail = document.getElementById('custEmail').value.trim();
    const custAddr = document.getElementById('custAddr').value.trim();

    const discountPct = parseFloat(document.getElementById('discount').value) || 0;
    const taxRatePct = parseFloat(document.getElementById('taxRate').value) || 0;
    const shippingFee = parseFloat(document.getElementById('shippingFee').value) || 0;

    const splitGst = splitGstToggle.checked;
    const showWords = amountInWordsToggle.checked;
    const showQr = showQrToggle.checked;

    const bankName = document.getElementById('bankName').value.trim();
    const acctHolder = document.getElementById('acctHolder').value.trim();
    const acctNo = document.getElementById('acctNo').value.trim();
    const ifsc = document.getElementById('ifsc').value.trim();
    const upiId = document.getElementById('upiId').value.trim();

    const notes = document.getElementById('notes').value.trim();
    const signatoryName = document.getElementById('signatoryName').value.trim();
    const signatoryTitle = document.getElementById('signatoryTitle').value.trim();

    // Calculations
    const validRows = state.items.map(item => ({
      desc: item.desc.trim(),
      qty: Number(item.qty) || 0,
      price: Number(item.price) || 0,
      total: (Number(item.qty) || 0) * (Number(item.price) || 0)
    }));

    const subtotal = validRows.reduce((acc, r) => acc + r.total, 0);
    const discountAmt = subtotal * (discountPct / 100);
    const taxableAmt = Math.max(0, subtotal - discountAmt);
    const taxAmt = taxableAmt * (taxRatePct / 100);
    const grandTotal = taxableAmt + taxAmt + shippingFee;

    // Apply Template, Accent Color & Watermark Opacity
    invoiceSheet.className = `invoice-paper template-${state.template}`;
    invoiceSheet.style.setProperty('--inv-primary', state.accentColor);
    invoiceSheet.style.setProperty('--watermark-opacity', (state.watermarkOpacity / 100).toString());

    // Center Watermark HTML
    const watermarkHtml = (state.showLogoWatermark && state.bizLogo) ? `
      <div class="inv-center-watermark">
        <img src="${state.bizLogo}" alt="Watermark Logo">
      </div>
    ` : '';

    // Render Table Rows
    const tableRowsHtml = validRows.length > 0 ? validRows.map((r, i) => `
      <tr class="inv-row">
        <td class="td-idx"><span class="idx-pill">${i + 1}</span></td>
        <td class="td-desc">
          <div class="item-title">${esc(r.desc || 'Item description')}</div>
        </td>
        <td class="td-qty"><span class="qty-badge">${r.qty}</span></td>
        <td class="td-price">${state.currencySymbol}${fmtMoney(r.price)}</td>
        <td class="td-total"><strong>${state.currencySymbol}${fmtMoney(r.total)}</strong></td>
      </tr>
    `).join('') : `
      <tr class="inv-row-empty">
        <td colspan="5" style="text-align: center; padding: 24px; color: var(--inv-text-muted);">No items added yet</td>
      </tr>
    `;

    // Watermark Stamp
    const stampHtml = state.status ? `
      <div class="inv-watermark-stamp stamp-${state.status}">
        <span class="stamp-inner">${state.status}</span>
      </div>
    ` : '';

    // Dedicated QR Card Generator
    let qrSvgHtml = '';
    if (showQr) {
      let qrPayload = upiId ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(bizName)}&am=${grandTotal.toFixed(2)}&cu=${state.currency}` : `Payment for ${billNo} - Total: ${state.currencySymbol}${grandTotal.toFixed(2)}`;
      const qrSvg = QRCodeGenerator.createQR(qrPayload);
      if (qrSvg) {
        qrSvgHtml = `
          <div class="pay-qr-card">
            <div class="qr-card-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>
              <span>Instant Pay QR</span>
            </div>
            <div class="qr-code-frame">
              <div class="qr-corner top-left"></div>
              <div class="qr-corner top-right"></div>
              <div class="qr-corner btm-left"></div>
              <div class="qr-corner btm-right"></div>
              ${qrSvg}
            </div>
            <div class="qr-card-amount">${state.currencySymbol}${fmtMoney(grandTotal)}</div>
            <div class="qr-card-footer">
              <span class="upi-badge">UPI</span>
              <span>GPay · PhonePe · Paytm</span>
            </div>
          </div>
        `;
      }
    }

    // Structured Payment Detail Cards with Modern Micro-Icons
    const payCards = [];
    if (bankName) {
      payCards.push(`
        <div class="pay-detail-item">
          <div class="pay-item-header">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M14 10v11M12 2L2 7h20L12 2z"/></svg>
            <span class="pay-item-label">Bank Name</span>
          </div>
          <span class="pay-item-value font-semibold">${esc(bankName)}</span>
        </div>
      `);
    }
    if (acctHolder) {
      payCards.push(`
        <div class="pay-detail-item">
          <div class="pay-item-header">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span class="pay-item-label">Account Holder</span>
          </div>
          <span class="pay-item-value">${esc(acctHolder)}</span>
        </div>
      `);
    }
    if (acctNo) {
      payCards.push(`
        <div class="pay-detail-item">
          <div class="pay-item-header">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            <span class="pay-item-label">Account Number</span>
          </div>
          <span class="pay-item-value mono-val font-semibold">${esc(acctNo)}</span>
        </div>
      `);
    }
    if (ifsc) {
      payCards.push(`
        <div class="pay-detail-item">
          <div class="pay-item-header">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span class="pay-item-label">IFSC / SWIFT</span>
          </div>
          <span class="pay-item-value badge-val">${esc(ifsc)}</span>
        </div>
      `);
    }
    if (upiId) {
      payCards.push(`
        <div class="pay-detail-item">
          <div class="pay-item-header">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            <span class="pay-item-label">UPI ID / VPA</span>
          </div>
          <span class="pay-item-value upi-val">${esc(upiId)}</span>
        </div>
      `);
    }

    // Amount in Words
    const wordsHtml = showWords && grandTotal > 0 ? `
      <div class="inv-words-box">
        <div class="words-header">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="6" x2="12" y2="18"/></svg>
          <span>Amount in Words</span>
        </div>
        <div class="words-text">${numberToWords(grandTotal, state.currency)}</div>
      </div>
    ` : '';

    // Taxes Breakdown
    let taxRowsHtml = '';
    if (taxRatePct > 0) {
      if (splitGst) {
        const halfRate = (taxRatePct / 2).toFixed(1);
        const halfTax = taxAmt / 2;
        taxRowsHtml = `
          <div class="totals-row tax-split-row">
            <span class="totals-label">
              <span class="tax-tag">CGST</span>
              <span>(${halfRate}%)</span>
            </span>
            <span class="totals-val">+${state.currencySymbol}${fmtMoney(halfTax)}</span>
          </div>
          <div class="totals-row tax-split-row">
            <span class="totals-label">
              <span class="tax-tag">SGST</span>
              <span>(${halfRate}%)</span>
            </span>
            <span class="totals-val">+${state.currencySymbol}${fmtMoney(halfTax)}</span>
          </div>
        `;
      } else {
        taxRowsHtml = `
          <div class="totals-row">
            <span class="totals-label">
              <span class="tax-tag">Tax / GST</span>
              <span>(${taxRatePct}%)</span>
            </span>
            <span class="totals-val">+${state.currencySymbol}${fmtMoney(taxAmt)}</span>
          </div>
        `;
      }
    }

    // Assembly for Sheet
    invoiceSheet.innerHTML = `
      <div class="inv-top-bar"></div>
      ${watermarkHtml}
      ${stampHtml}

      <!-- Header -->
      <div class="inv-header">
        <div class="inv-brand-block">
          ${state.bizLogo ? `
            <div class="inv-logo-wrap">
              <img src="${state.bizLogo}" alt="Business Logo">
            </div>
          ` : ''}
          <div class="inv-biz-name">${esc(bizName)}</div>
          <div class="inv-biz-details">
            ${bizTaxId ? `
              <div class="biz-meta-chip tax-chip">
                <span class="chip-label">GSTIN/TAX:</span>
                <strong>${esc(bizTaxId)}</strong>
              </div>
            ` : ''}
            ${bizEmail ? `
              <div class="biz-meta-chip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>${esc(bizEmail)}</span>
              </div>
            ` : ''}
            ${bizAddr ? `
              <div class="biz-meta-chip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${esc(bizAddr)}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="inv-meta-block">
          <div class="inv-title-badge-wrap">
            <div class="inv-title-large">INVOICE</div>
            <div class="inv-title-sub">ORIGINAL FOR RECIPIENT</div>
          </div>
          <div class="inv-meta-grid">
            <div class="meta-item-card main-no">
              <span class="meta-card-label">Invoice Number</span>
              <span class="meta-card-value">#${esc(billNo)}</span>
            </div>
            <div class="meta-item-card">
              <span class="meta-card-label">Issue Date</span>
              <span class="meta-card-value">${fmtDate(billDate) || '—'}</span>
            </div>
            ${dueDate ? `
              <div class="meta-item-card due-date-card">
                <span class="meta-card-label">Due Date</span>
                <span class="meta-card-value">${fmtDate(dueDate)}</span>
              </div>
            ` : ''}
            ${poNumber ? `
              <div class="meta-item-card">
                <span class="meta-card-label">PO / Ref No.</span>
                <span class="meta-card-value">${esc(poNumber)}</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Parties Cards Grid -->
      <div class="inv-parties">
        <div class="inv-party-card party-client">
          <div class="party-card-header">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>BILLED TO (CLIENT)</span>
          </div>
          <div class="party-name">${esc(custName)}</div>
          <div class="party-meta-details">
            ${custTaxId ? `
              <div class="party-meta-row tax-highlight">
                <span class="chip-tax-badge">TAX ID</span>
                <span class="party-mono">${esc(custTaxId)}</span>
              </div>
            ` : ''}
            ${custEmail ? `
              <div class="party-meta-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>${esc(custEmail)}</span>
              </div>
            ` : ''}
            ${custAddr ? `
              <div class="party-meta-row addr-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${esc(custAddr)}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="inv-party-card party-summary">
          <div class="party-card-header">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>TERMS & OVERVIEW</span>
          </div>
          <div class="summary-overview-list">
            <div class="overview-row">
              <span class="overview-key">Payment Status:</span>
              <span class="overview-val status-val"><span class="status-indicator"></span>${state.status || 'Pending Payment'}</span>
            </div>
            <div class="overview-row">
              <span class="overview-key">Billing Currency:</span>
              <span class="overview-val font-mono">${state.currency} (${state.currencySymbol})</span>
            </div>
            ${dueDate ? `
              <div class="overview-row">
                <span class="overview-key">Due Date:</span>
                <span class="overview-val font-semibold text-danger">${fmtDate(dueDate)}</span>
              </div>
            ` : ''}
          </div>
          <div class="overview-payable-chip">
            <span class="payable-label">Total Amount</span>
            <span class="payable-amt">${state.currencySymbol}${fmtMoney(grandTotal)}</span>
          </div>
        </div>
      </div>

      <!-- Line Items Table -->
      <div class="inv-table-wrap">
        <table class="inv-table">
          <thead>
            <tr>
              <th style="width: 6%">#</th>
              <th>ITEM & DESCRIPTION</th>
              <th class="th-num" style="width: 12%">QTY</th>
              <th class="th-num" style="width: 18%">RATE (${state.currencySymbol})</th>
              <th class="th-num" style="width: 20%">AMOUNT (${state.currencySymbol})</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
      </div>

      <!-- Financial Summary & Calculations -->
      <div class="inv-summary-area">
        <div class="inv-left-summary">
          ${wordsHtml}
          ${notes ? `
            <div class="inv-notes-box">
              <div class="notes-header">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                <span>Terms & Notes</span>
              </div>
              <div class="notes-content">${esc(notes)}</div>
            </div>
          ` : ''}
        </div>

        <div class="inv-totals-box">
          <div class="totals-row">
            <span class="totals-label">Subtotal</span>
            <span class="totals-val font-mono">${state.currencySymbol}${fmtMoney(subtotal)}</span>
          </div>

          ${discountPct > 0 ? `
            <div class="totals-row discount-row">
              <span class="totals-label">
                <span class="disc-badge">DISCOUNT ${discountPct}%</span>
              </span>
              <span class="totals-val font-mono disc-val">-${state.currencySymbol}${fmtMoney(discountAmt)}</span>
            </div>
          ` : ''}

          ${taxRowsHtml}

          ${shippingFee > 0 ? `
            <div class="totals-row">
              <span class="totals-label">Shipping / Extra</span>
              <span class="totals-val font-mono">+${state.currencySymbol}${fmtMoney(shippingFee)}</span>
            </div>
          ` : ''}

          <div class="totals-row grand-total">
            <div class="grand-total-label">
              <span class="gt-title">Grand Total</span>
              <span class="gt-sub">Total Amount Due</span>
            </div>
            <div class="grand-total-val">
              <span class="gt-curr">${state.currencySymbol}</span>
              <span class="gt-num">${fmtMoney(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Premium Payment & QR Block -->
      ${payCards.length > 0 || qrSvgHtml ? `
        <div class="inv-payment-block">
          <div class="pay-block-header">
            <div class="pay-header-left">
              <svg class="pay-icon-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
              <span class="pay-title">Payment & Banking Details</span>
            </div>
            <span class="pay-header-badge">Direct Transfer / UPI</span>
          </div>
          <div class="pay-block-body">
            <div class="pay-details-cards">
              ${payCards.join('')}
            </div>
            ${qrSvgHtml}
          </div>
        </div>
      ` : ''}

      <!-- Footer & Signature Block -->
      <div class="inv-footer-area">
        <div class="inv-auth-badge">
          <div class="auth-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          </div>
          <div class="auth-text-wrap">
            <span class="auth-title">Authentic Digital Tax Invoice</span>
            <span class="auth-sub">Generated & verified electronically</span>
          </div>
        </div>

        <div class="inv-sign-col">
          <div class="sign-img-container">
            ${state.signatureImg ? `<img src="${state.signatureImg}" alt="Digital Signature">` : '<div class="sign-seal-box"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg><span>Authorized Seal</span></div>'}
          </div>
          <div class="sign-line">
            <div class="sign-name">${esc(signatoryName || 'Authorized Signatory')}</div>
            <div class="sign-title">${esc(signatoryTitle || bizName)}</div>
          </div>
        </div>
      </div>

      <div class="inv-bottom-brand-line">
        <span>Thank you for your business</span>
        <span class="dot-sep">•</span>
        <span>Generated with Invoice Studio</span>
        <span class="dot-sep">•</span>
        <span>Original Copy</span>
      </div>
    `;

    saveStateToLocal();
  }

  // =========================================================================
  // 7. STORAGE, HISTORY & EXPORT / IMPORT
  // =========================================================================
  function getFormData() {
    return {
      template: state.template,
      currency: state.currency,
      currencySymbol: state.currencySymbol,
      accentColor: state.accentColor,
      status: state.status,
      bizLogo: state.bizLogo,
      showLogoWatermark: state.showLogoWatermark,
      watermarkOpacity: state.watermarkOpacity,
      signatureImg: state.signatureImg,
      items: state.items,
      bizName: document.getElementById('bizName').value,
      bizEmail: document.getElementById('bizEmail').value,
      bizTaxId: document.getElementById('bizTaxId').value,
      bizAddr: document.getElementById('bizAddr').value,
      billNo: document.getElementById('billNo').value,
      poNumber: document.getElementById('poNumber').value,
      billDate: document.getElementById('billDate').value,
      dueDate: document.getElementById('dueDate').value,
      custName: document.getElementById('custName').value,
      custTaxId: document.getElementById('custTaxId').value,
      custEmail: document.getElementById('custEmail').value,
      custAddr: document.getElementById('custAddr').value,
      discount: document.getElementById('discount').value,
      taxRate: document.getElementById('taxRate').value,
      shippingFee: document.getElementById('shippingFee').value,
      splitGst: splitGstToggle.checked,
      amountInWords: amountInWordsToggle.checked,
      showQr: showQrToggle.checked,
      bankName: document.getElementById('bankName').value,
      acctHolder: document.getElementById('acctHolder').value,
      acctNo: document.getElementById('acctNo').value,
      ifsc: document.getElementById('ifsc').value,
      upiId: document.getElementById('upiId').value,
      notes: document.getElementById('notes').value,
      signatoryName: document.getElementById('signatoryName').value,
      signatoryTitle: document.getElementById('signatoryTitle').value
    };
  }

  function setFormData(data) {
    if (!data) return;

    if (data.template) {
      state.template = data.template;
      templateSelect.value = data.template;
    }
    if (data.currency) {
      state.currency = data.currency;
      currencySelect.value = data.currency;
      const opt = currencySelect.querySelector(`option[value="${data.currency}"]`);
      state.currencySymbol = opt ? opt.getAttribute('data-symbol') : '₹';
      document.querySelectorAll('.curr-sym').forEach(el => el.textContent = state.currencySymbol);
    }
    if (data.accentColor) {
      state.accentColor = data.accentColor;
      accentColorPicker.value = data.accentColor;
      accentColorLabel.textContent = data.accentColor;
    }
    if (data.status !== undefined) {
      state.status = data.status;
      statusSelect.value = data.status;
    }
    if (data.bizLogo) {
      state.bizLogo = data.bizLogo;
      logoImg.src = data.bizLogo;
      logoImg.classList.remove('hidden');
      logoPlaceholder.classList.add('hidden');
      removeLogoBtn.classList.remove('hidden');
    } else {
      state.bizLogo = '';
      logoImg.src = '';
      logoImg.classList.add('hidden');
      logoPlaceholder.classList.remove('hidden');
      removeLogoBtn.classList.add('hidden');
    }
    if (data.showLogoWatermark !== undefined) {
      state.showLogoWatermark = data.showLogoWatermark;
      logoWatermarkToggle.checked = data.showLogoWatermark;
      if (data.showLogoWatermark) {
        watermarkSliderWrap.classList.remove('hidden');
      } else {
        watermarkSliderWrap.classList.add('hidden');
      }
    }
    if (data.watermarkOpacity !== undefined) {
      state.watermarkOpacity = data.watermarkOpacity;
      watermarkOpacityInput.value = data.watermarkOpacity;
      opacityValLabel.textContent = `${data.watermarkOpacity}%`;
    }
    if (data.signatureImg) {
      state.signatureImg = data.signatureImg;
      signImg.src = data.signatureImg;
      signImg.classList.remove('hidden');
      signPlaceholder.classList.add('hidden');
      removeSignBtn.classList.remove('hidden');
    } else {
      state.signatureImg = '';
      signImg.src = '';
      signImg.classList.add('hidden');
      signPlaceholder.classList.remove('hidden');
      removeSignBtn.classList.add('hidden');
    }
    if (Array.isArray(data.items) && data.items.length > 0) {
      state.items = data.items;
    }

    // Set input values
    const fieldMap = {
      bizName: data.bizName ?? '',
      bizEmail: data.bizEmail ?? '',
      bizTaxId: data.bizTaxId ?? '',
      bizAddr: data.bizAddr ?? '',
      billNo: data.billNo ?? '',
      poNumber: data.poNumber ?? '',
      billDate: data.billDate ?? '',
      dueDate: data.dueDate ?? '',
      custName: data.custName ?? '',
      custTaxId: data.custTaxId ?? '',
      custEmail: data.custEmail ?? '',
      custAddr: data.custAddr ?? '',
      discount: data.discount ?? '0',
      taxRate: data.taxRate ?? '18',
      shippingFee: data.shippingFee ?? '0',
      bankName: data.bankName ?? '',
      acctHolder: data.acctHolder ?? '',
      acctNo: data.acctNo ?? '',
      ifsc: data.ifsc ?? '',
      upiId: data.upiId ?? '',
      notes: data.notes ?? '',
      signatoryName: data.signatoryName ?? '',
      signatoryTitle: data.signatoryTitle ?? ''
    };

    for (const [id, val] of Object.entries(fieldMap)) {
      const el = document.getElementById(id);
      if (el) el.value = val;
    }

    if (data.splitGst !== undefined) splitGstToggle.checked = data.splitGst;
    if (data.amountInWords !== undefined) amountInWordsToggle.checked = data.amountInWords;
    if (data.showQr !== undefined) showQrToggle.checked = data.showQr;

    renderItemRows();
    updatePreview();
  }

  function saveStateToLocal() {
    try {
      const data = getFormData();
      localStorage.setItem('invoice_studio_current', JSON.stringify(data));
    } catch (e) { }
  }

  function loadStateFromLocal() {
    try {
      const saved = localStorage.getItem('invoice_studio_current');
      if (saved) {
        setFormData(JSON.parse(saved));
        return true;
      }
    } catch (e) { }
    return false;
  }

  function getHistoryList() {
    try {
      return JSON.parse(localStorage.getItem('invoice_studio_history') || '[]');
    } catch {
      return [];
    }
  }

  function saveInvoiceToHistory() {
    const data = getFormData();
    const history = getHistoryList();
    const entry = {
      id: 'inv_' + Date.now(),
      billNo: data.billNo || 'INV-' + Date.now().toString().slice(-4),
      client: data.custName || 'Unnamed Client',
      date: data.billDate || new Date().toISOString().split('T')[0],
      savedAt: new Date().toLocaleString(),
      data
    };

    history.unshift(entry);
    localStorage.setItem('invoice_studio_history', JSON.stringify(history.slice(0, 30)));
    updateHistoryCount();
    showToast(`Invoice #${entry.billNo} saved to history!`, 'success');
  }

  function updateHistoryCount() {
    const list = getHistoryList();
    savedCount.textContent = list.length;
  }

  function renderHistoryModal() {
    const list = getHistoryList();
    if (list.length === 0) {
      historyList.innerHTML = '<div style="text-align:center; padding: 24px; color: var(--app-text-muted);">No saved invoices yet. Click "Save to History" on any invoice.</div>';
      return;
    }

    historyList.innerHTML = list.map((item, idx) => `
      <div class="history-item-card">
        <div class="history-item-info">
          <span class="history-item-no">#${esc(item.billNo)}</span>
          <span class="history-item-client">${esc(item.client)} · Date: ${fmtDate(item.date)}</span>
          <span class="history-item-meta">Saved: ${esc(item.savedAt)}</span>
        </div>
        <div class="history-item-actions">
          <button type="button" class="btn btn-primary btn-sm load-hist-btn" data-id="${item.id}">Load</button>
          <button type="button" class="btn btn-danger-ghost btn-sm del-hist-btn" data-index="${idx}">Delete</button>
        </div>
      </div>
    `).join('');

    historyList.querySelectorAll('.load-hist-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const target = list.find(it => it.id === id);
        if (target) {
          setFormData(target.data);
          historyModal.classList.remove('active');
          showToast(`Loaded invoice #${target.billNo}`, 'info');
        }
      });
    });

    historyList.querySelectorAll('.del-hist-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        list.splice(idx, 1);
        localStorage.setItem('invoice_studio_history', JSON.stringify(list));
        updateHistoryCount();
        renderHistoryModal();
        showToast('Invoice deleted from history', 'info');
      });
    });
  }

  // =========================================================================
  // 8. SAMPLE DATA & PRESETS
  // =========================================================================
  function loadSampleData() {
    const today = new Date();
    const due = new Date();
    due.setDate(today.getDate() + 14);

    setFormData({
      template: 'modern',
      currency: 'INR',
      accentColor: '#4f46e5',
      status: 'PAID',
      bizLogo: 'assets/images/logo.png',
      showLogoWatermark: true,
      watermarkOpacity: 8,
      bizName: 'Mahadeva Creation Pvt. Ltd.',
      bizEmail: 'contact@mahadevacreation.com · +91 98250 12345',
      bizTaxId: '24ABCDE1234F1Z5',
      bizAddr: 'Suite 402, Apex Business Hub, Ring Road, Surat, Gujarat 395002',
      billNo: 'INV-2026-084',
      poNumber: 'PO-98214',
      billDate: today.toISOString().split('T')[0],
      dueDate: due.toISOString().split('T')[0],
      custName: 'Zenith Global Enterprise',
      custTaxId: '27XYZAB9876G1Z2',
      custEmail: 'accounts@zenithglobal.com · +91 99887 76655',
      custAddr: 'Floor 12, Pinnacle Towers, BKC, Mumbai, MH 400051',
      items: [
        { desc: 'Custom Enterprise ERP Software Architecture & API Design', qty: 1, price: 45000 },
        { desc: 'Cloud Infrastructure Setup (AWS RDS, Docker & CI/CD Pipeline)', qty: 1, price: 22000 },
        { desc: 'Annual Premium Technical Maintenance & Security Audit', qty: 2, price: 8500 }
      ],
      discount: '5',
      taxRate: '18',
      shippingFee: '0',
      splitGst: true,
      amountInWords: true,
      showQr: true,
      bankName: 'Punjab National Bank',
      acctHolder: 'Mahadeva Creation Pvt Ltd',
      acctNo: '0340002100012345',
      ifsc: 'PUNB0340600',
      upiId: 'mahadeva@upi',
      notes: '1. Payment is officially acknowledged via bank transfer.\n2. Warranty & Support covered for 12 months from deployment date.\nThank you for choosing Mahadeva Creation!',
      signatoryName: 'Mochi Het S.',
      signatoryTitle: 'Managing Director',
      signatureImg: 'assets/images/Sign.png'
    });

    showToast('Loaded complete sample invoice data!', 'success');
  }

  function resetNewInvoice() {
    if (confirm('Create a new blank invoice? Any unsaved changes on the current invoice will be cleared.')) {
      document.getElementById('billForm').reset();
      state.items = [{ desc: '', qty: 1, price: 0 }];

      state.bizLogo = '';
      state.signatureImg = '';
      state.status = '';
      state.watermarkOpacity = 8;
      state.showLogoWatermark = false;

      state.bizName = '';
      state.bizEmail = '';
      state.bizTaxId = '';
      state.bizAddr = '';

      state.custName = '';
      state.custTaxId = '';
      state.custEmail = '';
      state.custAddr = '';

      state.discount = '0';
      state.taxRate = '0';
      state.shippingFee = '0';
      state.splitGst = false;
      state.amountInWords = false;
      state.showQr = false;

      state.bankName = '';
      state.acctHolder = '';
      state.acctNo = '';
      state.ifsc = '';
      state.upiId = '';

      state.notes = '';
      state.signatoryName = '';
      state.signatoryTitle = '';

      logoImg.src = '';
      logoImg.classList.add('hidden');
      logoPlaceholder.classList.remove('hidden');
      removeLogoBtn.classList.add('hidden');
      logoInput.value = '';

      signImg.src = '';
      signImg.classList.add('hidden');
      signPlaceholder.classList.remove('hidden');
      removeSignBtn.classList.add('hidden');
      signInput.value = '';

      document.getElementById('billDate').value = new Date().toISOString().split('T')[0];
      document.getElementById('billNo').value = 'INV-' + Date.now().toString().slice(-5);
      renderItemRows();
      updatePreview();
      showToast('Created new blank invoice', 'info');
    }
  }

  // =========================================================================
  // 9. EVENT LISTENERS & INITIALIZATION
  // =========================================================================

  form.addEventListener('input', updatePreview);
  form.addEventListener('change', updatePreview);

  templateSelect.addEventListener('change', (e) => {
    state.template = e.target.value;
    updatePreview();
  });

  currencySelect.addEventListener('change', (e) => {
    state.currency = e.target.value;
    const opt = currencySelect.selectedOptions[0];
    state.currencySymbol = opt ? opt.getAttribute('data-symbol') : '₹';
    document.querySelectorAll('.curr-sym').forEach(el => el.textContent = state.currencySymbol);
    renderItemRows();
    updatePreview();
  });

  statusSelect.addEventListener('change', (e) => {
    state.status = e.target.value;
    updatePreview();
  });

  accentColorPicker.addEventListener('input', (e) => {
    state.accentColor = e.target.value;
    accentColorLabel.textContent = e.target.value;
    updatePreview();
  });

  resetColorBtn.addEventListener('click', () => {
    state.accentColor = '#4f46e5';
    accentColorPicker.value = '#4f46e5';
    accentColorLabel.textContent = '#4f46e5';
    updatePreview();
  });

  addItemBtn.addEventListener('click', () => addItem());
  addFiveItemsBtn.addEventListener('click', () => {
    for (let i = 0; i < 5; i++) state.items.push({ desc: '', qty: 1, price: 0 });
    renderItemRows();
    updatePreview();
  });
  clearItemsBtn.addEventListener('click', () => {
    if (confirm('Clear all line items?')) {
      state.items = [{ desc: '', qty: 1, price: 0 }];
      renderItemRows();
      updatePreview();
    }
  });

  genBillNoBtn.addEventListener('click', () => {
    const nextNo = 'INV-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);
    document.getElementById('billNo').value = nextNo;
    updatePreview();
    showToast(`Generated Invoice No: ${nextNo}`, 'info');
  });

  // Logo Upload
  logoInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Please choose an image file smaller than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = function (e) {
        state.bizLogo = e.target.result;
        logoImg.src = state.bizLogo;
        logoImg.classList.remove('hidden');
        logoPlaceholder.classList.add('hidden');
        removeLogoBtn.classList.remove('hidden');
        updatePreview();
        showToast('Logo uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  });

  removeLogoBtn.addEventListener('click', () => {
    state.bizLogo = '';
    logoImg.src = '';
    logoImg.classList.add('hidden');
    logoPlaceholder.classList.remove('hidden');
    removeLogoBtn.classList.add('hidden');
    logoInput.value = '';
    updatePreview();
  });

  // Watermark Toggle & Opacity Slider
  logoWatermarkToggle.addEventListener('change', (e) => {
    state.showLogoWatermark = e.target.checked;
    if (state.showLogoWatermark) {
      watermarkSliderWrap.classList.remove('hidden');
      if (!state.bizLogo) {
        showToast('Upload a logo above to see it as the center watermark', 'info');
      }
    } else {
      watermarkSliderWrap.classList.add('hidden');
    }
    updatePreview();
  });

  watermarkOpacityInput.addEventListener('input', (e) => {
    state.watermarkOpacity = parseInt(e.target.value, 10) || 8;
    opacityValLabel.textContent = `${state.watermarkOpacity}%`;
    updatePreview();
  });

  // Signature Upload
  signInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        state.signatureImg = e.target.result;
        signImg.src = state.signatureImg;
        signImg.classList.remove('hidden');
        signPlaceholder.classList.add('hidden');
        removeSignBtn.classList.remove('hidden');
        updatePreview();
        showToast('Signature uploaded!', 'success');
      };
      reader.readAsDataURL(file);
    }
  });

  removeSignBtn.addEventListener('click', () => {
    state.signatureImg = '';
    signImg.src = '';
    signImg.classList.add('hidden');
    signPlaceholder.classList.remove('hidden');
    removeSignBtn.classList.add('hidden');
    signInput.value = '';
    updatePreview();
  });

  // Dark / Light Theme
  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('theme-dark');
    if (isDark) {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      localStorage.setItem('invoice_studio_theme', 'light');
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      localStorage.setItem('invoice_studio_theme', 'dark');
    }
  });

  const savedTheme = localStorage.getItem('invoice_studio_theme');
  if (savedTheme === 'light') {
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-light');
  }

  // Zoom Controls
  zoomInBtn.addEventListener('click', () => {
    if (state.zoom < 1.4) {
      state.zoom = +(state.zoom + 0.1).toFixed(1);
      invoiceSheet.style.transform = `scale(${state.zoom})`;
      zoomLevel.textContent = `${Math.round(state.zoom * 100)}%`;
    }
  });

  zoomOutBtn.addEventListener('click', () => {
    if (state.zoom > 0.6) {
      state.zoom = +(state.zoom - 0.1).toFixed(1);
      invoiceSheet.style.transform = `scale(${state.zoom})`;
      zoomLevel.textContent = `${Math.round(state.zoom * 100)}%`;
    }
  });

  zoomFitBtn.addEventListener('click', () => {
    state.zoom = 1;
    invoiceSheet.style.transform = 'scale(1)';
    zoomLevel.textContent = '100%';
  });

  // Top Buttons
  loadSampleBtn.addEventListener('click', loadSampleData);
  newInvoiceBtn.addEventListener('click', resetNewInvoice);
  saveInvoiceBtn.addEventListener('click', saveInvoiceToHistory);

  // History Modal
  historyModalBtn.addEventListener('click', () => {
    renderHistoryModal();
    historyModal.classList.add('active');
  });

  closeHistoryModalBtn.addEventListener('click', () => historyModal.classList.remove('active'));
  closeHistoryBtn2.addEventListener('click', () => historyModal.classList.remove('active'));
  historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) historyModal.classList.remove('active');
  });

  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Clear all saved invoices from your browser history?')) {
      localStorage.removeItem('invoice_studio_history');
      updateHistoryCount();
      renderHistoryModal();
      showToast('All saved history cleared', 'info');
    }
  });

  // JSON Export & Import
  exportJsonBtn.addEventListener('click', () => {
    const data = getFormData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${data.billNo || 'Draft'}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Invoice downloaded as JSON!', 'success');
  });

  importJsonInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const parsed = JSON.parse(e.target.result);
          setFormData(parsed);
          showToast('Invoice JSON imported successfully!', 'success');
        } catch (err) {
          alert('Invalid JSON invoice file format.');
        }
      };
      reader.readAsText(file);
      this.value = '';
    }
  });

  mobilePreviewToggle.addEventListener('click', () => {
    previewContainer.scrollIntoView({ behavior: 'smooth' });
  });

  // Print Handling
  function handlePrint() {
    const originalTransform = invoiceSheet.style.transform;
    invoiceSheet.style.transform = 'none';
    window.print();
    invoiceSheet.style.transform = originalTransform;
  }

  mainPrintBtn.addEventListener('click', handlePrint);
  printFromEditorBtn.addEventListener('click', handlePrint);

  // Default Initialization
  document.getElementById('billDate').value = new Date().toISOString().split('T')[0];
  updateHistoryCount();

  const loaded = loadStateFromLocal();
  if (!loaded) {
    loadSampleData();
  }

})();
