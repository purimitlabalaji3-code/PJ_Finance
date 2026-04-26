// src/utils/exports.js
// Full PDF and CSV export utilities using jsPDF + jsPDF-AutoTable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2pdf from 'html2pdf.js';

const today  = () => new Date().toISOString().split('T')[0];
const fmt    = (n) => `Rs.${Number(n || 0).toLocaleString('en-IN')}`;

// ── Date range helpers ─────────────────────────────────────────────────────
export const dateRanges = {
  daily:   () => { const d = new Date(); return { label: 'Daily',   from: d.toISOString().split('T')[0], to: d.toISOString().split('T')[0] }; },
  weekly:  () => { const d = new Date(); const f = new Date(d); f.setDate(d.getDate() - 6); return { label: 'Weekly',  from: f.toISOString().split('T')[0], to: d.toISOString().split('T')[0] }; },
  monthly: () => { const d = new Date(); const f = new Date(d); f.setDate(d.getDate() - 29); return { label: 'Monthly', from: f.toISOString().split('T')[0], to: d.toISOString().split('T')[0] }; },
  all:     () => { return { label: 'All Time', from: '2000-01-01', to: '2099-12-31' }; },
};

const inRange = (dateStr, from, to) => {
  if (!dateStr) return false;
  const d = dateStr.split('T')[0];
  return d >= from && d <= to;
};
// ── Brand colours ──────────────────────────────────────────────────────────
const DARK  = [18, 18, 18];
const GOLD  = [255, 193, 7];
const WHITE = [255, 255, 255];
const GRAY  = [120, 120, 120];
const GREEN = [16, 185, 129];
const RED   = [239, 68, 68];
const PINK  = [236, 72, 153];
const PRIMARY_BLUE = [37, 99, 235]; // Blue-600
const DARK_BLUE = [30, 58, 138]; // Blue-900

// ── Image Helper ───────────────────────────────────────────────────────────
const getImageDataUrl = async (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve({ url: canvas.toDataURL('image/png'), w: img.width, h: img.height });
    };
    img.onerror = () => resolve(null);
  });
};

// ── PDF Header Template ──────────────────────────────────────────────────
const getHtmlHeader = (title, subtitle = '') => `
  <div class="pdf-header" style="display: flex; align-items: center; border: 2px solid #1e3a8a; padding: 20px; border-radius: 12px; margin-bottom: 25px; background: white; position: relative; height: 90px;">
    <!-- LEFT: Logo and Text -->
    <div style="display: flex; align-items: center; gap: 18px; flex: 1;">
      <img src="/logo.png" style="height: 65px; object-fit: contain;" onerror="this.style.display='none'">
      <div>
        <h1 style="margin: 0; font-size: 26px; color: #1e3a8a; font-weight: 900; letter-spacing: 0.5px;">PJ FINANCE</h1>
        <h2 style="margin: 4px 0 0; font-size: 16px; color: #475569; font-weight: 700; text-transform: uppercase;">${title}</h2>
      </div>
    </div>

    <!-- MIDDLE: Centered Image -->
    <div style="position: absolute; left: 50%; transform: translateX(-50%); text-align: center;">
      <img src="/download.png" style="height: 75px; object-fit: contain;" onerror="this.style.display='none'">
    </div>

    <!-- RIGHT: Meta Info -->
    <div style="text-align: right; flex: 1;">
      <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 5px;">Generated: ${new Date().toLocaleString('en-IN')}</div>
      ${subtitle ? `<div style="font-weight: 900; font-size: 18px; color: #1e3a8a; border-top: 1px solid #e2e8f0; padding-top: 5px; display: inline-block;">${subtitle}</div>` : ''}
    </div>
  </div>
`;

// Standard Table CSS for all PDFs
const tableStyles = `
  table { width: 100%; border-collapse: collapse; font-size: 11px; page-break-inside: auto; }
  tr { page-break-inside: avoid; page-break-after: auto; }
  thead { display: table-header-group; }
  tfoot { display: table-footer-group; }
  th { background: #1e3a8a; color: white; padding: 10px; text-align: left; text-transform: uppercase; position: sticky; top: 0; }
  td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
  .pdf-page { padding: 20px; background: white; min-height: 100%; box-sizing: border-box; }
`;

// ── CSV Helper ─────────────────────────────────────────────────────────────
export const downloadCSV = (filename, headers, rows) => {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map(r => r.map(esc).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ══════════════════════════════════════════════════════════════════════════
// 1. CUSTOMER LIST — CSV + PDF
// ══════════════════════════════════════════════════════════════════════════
export const exportCustomersCSV = (customers) => {
  downloadCSV(`PJ_Customers_${today()}.csv`,
    ['Code', 'Name', 'Phone', 'Age', 'Gender', 'Aadhaar', 'Address', 'Status', 'Join Date'],
    customers.map((c) => [
      c.customerCode || '—',
      c.name, c.phone, c.age || '', c.gender || '',
      c.aadhaar || '', c.address || '', c.status, c.joinDate || ''
    ])
  );
};

export const exportCustomersPDF = async (customers) => {
  const container = document.createElement('div');
  container.innerHTML = `
    <div class="pdf-page" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      ${getHtmlHeader('Customer List Report', `Total Customers: ${customers.length}`)}
      <style>${tableStyles}</style>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Age/Sex</th>
            <th>Address</th>
            <th>Status</th>
            <th>Join Date</th>
          </tr>
        </thead>
        <tbody>
          ${customers.map((c, i) => `
            <tr style="background: ${i % 2 === 0 ? 'white' : '#f8fafc'}">
              <td style="font-weight: bold; color: #1e3a8a;">${c.customerCode || '—'}</td>
              <td>${c.name}</td>
              <td>${c.phone}</td>
              <td>${c.age || '—'} / ${c.gender || '—'}</td>
              <td>${c.address || '—'}</td>
              <td style="color: ${c.status === 'Active' ? '#10b981' : '#64748b'}; font-weight: bold;">${c.status}</td>
              <td>${c.joinDate || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  const opt = {
    margin: [10, 10],
    filename: `PJ_Customers_${today()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  html2pdf().set(opt).from(container).save();
};

// ══════════════════════════════════════════════════════════════════════════
// 2. LOAN SUMMARY — CSV + PDF
// ══════════════════════════════════════════════════════════════════════════
export const exportLoansCSV = (loans) => {
  downloadCSV(`PJ_Loans_${today()}.csv`,
    ['Code', 'Customer', 'Principal (Rs)', 'Interest %', 'Interest Amt (Rs)', 'Total Payable (Rs)', 'Daily EMI (Rs)', 'Paid Days', 'Total Days', 'Status', 'Start Date'],
    loans.map(l => {
      const p   = Number(l.loanAmount);
      const tot = Number(l.totalAmount) || p * (1 + Number(l.interest) / 100);
      return [l.customerCode || '—', l.customerName, p, `${l.interest}%`, Math.round(tot - p), Math.round(tot), l.dailyAmount, l.paidDays, l.totalDays, l.status, l.startDate];
    })
  );
};

export const exportLoansPDF = async (loans) => {
  const totalDisbursed = loans.reduce((s, l) => s + Number(l.loanAmount), 0);
  const totalInterest  = loans.reduce((s, l) => {
    const tot = Number(l.totalAmount) || Number(l.loanAmount) * (1 + Number(l.interest) / 100);
    return s + (tot - Number(l.loanAmount));
  }, 0);

  const container = document.createElement('div');
  container.innerHTML = `
    <div class="pdf-page" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      ${getHtmlHeader('Loan Summary Report', `Total Loans: ${loans.length}`)}
      <style>${tableStyles}</style>
      <table>
        <thead>
          <tr>
            <th>Loan ID</th>
            <th>Cust Code</th>
            <th>Customer</th>
            <th>Principal</th>
            <th>Interest %</th>
            <th>Interest Amt</th>
            <th>Total Payable</th>
            <th>EMI</th>
            <th>Paid Days</th>
            <th>Status</th>
            <th>Start Date</th>
          </tr>
        </thead>
        <tbody>
          ${loans.map((l, i) => {
            const p = Number(l.loanAmount);
            const tot = Number(l.totalAmount) || p * (1 + Number(l.interest) / 100);
            return `
              <tr style="background: ${i % 2 === 0 ? 'white' : '#f8fafc'}">
                <td style="font-weight: bold; color: #1e3a8a;">${l.loanCode || '—'}</td>
                <td>${l.customerCode || '—'}</td>
                <td>${l.customerName}</td>
                <td style="color: #db2777; font-weight: bold;">${fmt(p)}</td>
                <td>${l.interest}%</td>
                <td style="color: #db2777;">${fmt(Math.round(tot - p))}</td>
                <td style="color: #db2777; font-weight: bold;">${fmt(Math.round(tot))}</td>
                <td>${fmt(l.dailyAmount)}</td>
                <td><b>${l.paidDays}</b> / ${l.totalDays}</td>
                <td style="color: ${l.status === 'Active' ? '#10b981' : '#64748b'}; font-weight: bold;">${l.status}</td>
                <td>${l.startDate}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      <div style="margin-top: 20px; background: #1e3a8a; color: white; padding: 15px; border-radius: 8px; display: flex; justify-content: space-around; font-size: 14px;">
        <div>Total Disbursed: <b>${fmt(totalDisbursed)}</b></div>
        <div>Total Interest: <b>${fmt(totalInterest)}</b></div>
        <div>Total Payable: <b>${fmt(totalDisbursed + totalInterest)}</b></div>
      </div>
    </div>
  `;

  const opt = {
    margin: 0,
    filename: `PJ_Loans_${today()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(opt).from(container).save();
};

// ══════════════════════════════════════════════════════════════════════════
// 3. TODAY'S COLLECTION — CSV + PDF
// ══════════════════════════════════════════════════════════════════════════
export const exportCollectionCSV = (collections) => {
  downloadCSV(`PJ_Collection_${today()}.csv`,
    ['Code', 'Customer', 'Phone', 'Due Amount (Rs)', 'Paid Amount (Rs)', 'Status', 'Date'],
    collections.map(c => [c.customerCode || '—', c.customerName, c.phone || '', c.dueAmount, c.paidAmount, c.status, c.date || today()])
  );
};

export const exportCollectionPDF = async (collections, loans = []) => {
  const paid = collections.filter(c => c.status === 'Paid');
  const pend = collections.filter(c => c.status === 'Pending');
  const totalPaid    = paid.reduce((s, c) => s + Number(c.paidAmount), 0);
  const totalPending = pend.reduce((s, c) => s + Number(c.dueAmount), 0);

  const container = document.createElement('div');
  container.innerHTML = `
    <div class="pdf-page" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      ${getHtmlHeader('Daily Collection Report', `${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`)}
      <style>${tableStyles}</style>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
        <div style="padding: 12px; border-radius: 8px; text-align: center; color: white; background: #1e3a8a">
          <div style="font-size: 10px; opacity: 0.9; text-transform: uppercase;">Total Entries</div>
          <div style="font-size: 16px; font-weight: bold;">${collections.length}</div>
        </div>
        <div style="padding: 12px; border-radius: 8px; text-align: center; color: white; background: #10b981">
          <div style="font-size: 10px; opacity: 0.9; text-transform: uppercase;">Paid</div>
          <div style="font-size: 16px; font-weight: bold;">${paid.length}</div>
        </div>
        <div style="padding: 12px; border-radius: 8px; text-align: center; color: white; background: #ef4444">
          <div style="font-size: 10px; opacity: 0.9; text-transform: uppercase;">Pending</div>
          <div style="font-size: 16px; font-weight: bold;">${pend.length}</div>
        </div>
        <div style="padding: 12px; border-radius: 8px; text-align: center; color: white; background: #2563eb">
          <div style="font-size: 10px; opacity: 0.9; text-transform: uppercase;">Collected</div>
          <div style="font-size: 16px; font-weight: bold;">${fmt(totalPaid)}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Cust Code</th>
            <th>Customer</th>
            <th>Due Amount</th>
            <th>Paid Amount</th>
            <th>Remaining</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${collections.map((c, i) => {
            const loan = loans.find(l => l.id === c.loanId);
            let remaining = 0;
            if (loan) {
              remaining = (loan.loanType === '15-Day' || loan.loanType === 'Monthly') 
                ? Number(loan.totalAmount) 
                : Number(loan.totalAmount) - Number(loan.totalCollected || 0);
            }
            return `
              <tr style="background: ${i % 2 === 0 ? 'white' : '#f8fafc'}">
                <td style="font-weight: bold;">${c.customerCode || '—'}</td>
                <td>${c.customerName || '—'}</td>
                <td>${fmt(c.dueAmount)}</td>
                <td style="color: #10b981; font-weight: bold;">${c.status === 'Paid' ? fmt(c.paidAmount) : '—'}</td>
                <td>${fmt(Math.max(0, remaining))}</td>
                <td style="font-weight: bold; color: ${c.status === 'Paid' ? '#10b981' : '#ef4444'}">${c.status}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      
      ${pend.length > 0 ? `
        <div style="margin-top: 20px; background: #fef2f2; border: 1px solid #fca5a5; padding: 12px; border-radius: 8px; color: #ef4444; font-size: 13px; font-weight: 500;">
          ⚠  ${pend.length} pending entries — Total pending: ${fmt(totalPending)}
        </div>
      ` : ''}
    </div>
  `;

  const opt = {
    margin: 0,
    filename: `PJ_Collection_${today()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(opt).from(container).save();
};

// ══════════════════════════════════════════════════════════════════════════
// 4. BUSINESS SUMMARY — CSV + PDF
// ══════════════════════════════════════════════════════════════════════════
export const exportSummaryCSV = (data) => {
  downloadCSV(`PJ_Summary_${today()}.csv`,
    ['Metric', 'Value'],
    Object.entries(data).map(([k, v]) => [k, v])
  );
};

export const exportSummaryPDF = async ({ customers, loans, collections }) => {
  const totalDisbursed = loans.reduce((s, l) => s + Number(l.loanAmount), 0);
  const totalInterest  = loans.reduce((s, l) => {
    const tot = Number(l.totalAmount) || Number(l.loanAmount) * (1 + Number(l.interest) / 100);
    return s + (tot - Number(l.loanAmount));
  }, 0);
  const totalPayable   = totalDisbursed + totalInterest;
  const collectedToday = collections.filter(c => c.status === 'Paid').reduce((s, c) => s + Number(c.paidAmount), 0);
  const pendingToday   = collections.filter(c => c.status === 'Pending').reduce((s, c) => s + Number(c.dueAmount), 0);
  const activeLoans    = loans.filter(l => l.status === 'Active').length;

  const container = document.createElement('div');
  container.innerHTML = `
    <div class="pdf-page" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      ${getHtmlHeader('Business Summary Report')}
      <style>${tableStyles}</style>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
        <div style="padding: 12px; border-radius: 8px; text-align: center; color: white; background: #1e3a8a"><div style="font-size: 10px; opacity: 0.9; text-transform: uppercase;">Total Customers</div><div style="font-size: 16px; font-weight: bold;">${customers.length}</div></div>
        <div style="padding: 12px; border-radius: 8px; text-align: center; color: white; background: #0f766e"><div style="font-size: 10px; opacity: 0.9; text-transform: uppercase;">Active Loans</div><div style="font-size: 16px; font-weight: bold;">${activeLoans}</div></div>
        <div style="padding: 12px; border-radius: 8px; text-align: center; color: white; background: #b45309"><div style="font-size: 10px; opacity: 0.9; text-transform: uppercase;">Total Disbursed</div><div style="font-size: 16px; font-weight: bold;">${fmt(totalDisbursed)}</div></div>
        <div style="padding: 12px; border-radius: 8px; text-align: center; color: white; background: #4338ca"><div style="font-size: 10px; opacity: 0.9; text-transform: uppercase;">Total Payable</div><div style="font-size: 16px; font-weight: bold;">${fmt(totalPayable)}</div></div>
        <div style="padding: 12px; border-radius: 8px; text-align: center; color: white; background: #15803d"><div style="font-size: 10px; opacity: 0.9; text-transform: uppercase;">Today Collected</div><div style="font-size: 16px; font-weight: bold;">${fmt(collectedToday)}</div></div>
        <div style="padding: 12px; border-radius: 8px; text-align: center; color: white; background: #b91c1c"><div style="font-size: 10px; opacity: 0.9; text-transform: uppercase;">Today Pending</div><div style="font-size: 16px; font-weight: bold;">${fmt(pendingToday)}</div></div>
      </div>

      <h3 style="margin: 20px 0 10px; color: #1e3a8a; font-size: 16px;">Loan Breakdown</h3>
      <table>
        <thead>
          <tr>
            <th>Loan ID</th>
            <th>Customer</th>
            <th>Principal</th>
            <th>Interest Amt</th>
            <th>Total Payable</th>
            <th>EMI</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${loans.map((l, i) => {
            const p = Number(l.loanAmount);
            const tot = Number(l.totalAmount) || p * (1 + Number(l.interest) / 100);
            return `
              <tr style="background: ${i % 2 === 0 ? 'white' : '#f8fafc'}">
                <td style="font-weight: bold; color: #1e3a8a;">${l.loanCode || '—'}</td>
                <td>${l.customerName}</td>
                <td>${fmt(p)}</td>
                <td>${fmt(Math.round(tot - p))}</td>
                <td style="font-weight: bold;">${fmt(Math.round(tot))}</td>
                <td>${fmt(l.dailyAmount)}</td>
                <td style="color: ${l.status === 'Active' ? '#10b981' : '#64748b'}; font-weight: bold;">${l.status}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  const opt = {
    margin: 0,
    filename: `PJ_Summary_${today()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(opt).from(container).save();
};

// ══════════════════════════════════════════════════════════════════════════
// 5. SINGLE LOAN STATEMENT — PDF
// ══════════════════════════════════════════════════════════════════════════
export const exportLoanStatementPDF = async (loan, loanCollections) => {
  const totalPayable   = Number(loan.totalAmount);
  const totalCollected = Number(loan.totalCollected || 0);
  const remaining      = Math.max(0, totalPayable - totalCollected);

  const container = document.createElement('div');
  container.innerHTML = `
    <div class="pdf-page" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      ${getHtmlHeader('Loan Statement / Ledger', `${loan.loanCode || '—'} | ${loan.customerName}`)}
      <style>${tableStyles}</style>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px;">
        <div class="info-box"><div>Loan Type</div><div style="font-weight:bold">${loan.loanType}</div></div>
        <div class="info-box"><div>Principal</div><div style="font-weight:bold">${fmt(loan.loanAmount)}</div></div>
        <div class="info-box"><div>Interest Rate</div><div style="font-weight:bold">${loan.interest}%</div></div>
        <div class="info-box"><div>Total Payable</div><div style="color: #2563eb; font-weight:bold">${fmt(totalPayable)}</div></div>
        <div class="info-box"><div>Total Collected</div><div style="color: #10b981; font-weight:bold">${fmt(totalCollected)}</div></div>
        <div class="info-box"><div>Remaining Balance</div><div style="color: #ef4444; font-weight:bold">${fmt(remaining)}</div></div>
      </div>

      <div style="height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; margin-bottom: 20px;">
        <div style="height: 100%; background: #2563eb; width: ${(totalCollected / totalPayable) * 100}%"></div>
      </div>

      <h3 style="margin-bottom: 10px; font-size: 16px; color: #1e3a8a">Payment History</h3>
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Date</th>
            <th>Due Amount</th>
            <th>Paid Amount</th>
            <th>Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${loanCollections.map((c, i) => {
            let note = '';
            if (c.status === 'Paid') {
              const diff = Number(c.paidAmount) - Number(c.dueAmount);
              if (diff > 0) note = `<span style="color: #2563eb">+${fmt(diff)} extra</span>`;
              else if (diff < 0) note = `<span style="color: #ef4444">Short by ${fmt(Math.abs(diff))}</span>`;
            }
            return `
              <tr>
                <td>${i + 1}</td>
                <td>${c.date || today()}</td>
                <td>${fmt(c.dueAmount)}</td>
                <td style="font-weight: bold; color: #10b981">${c.status === 'Paid' ? fmt(c.paidAmount) : '—'}</td>
                <td style="font-weight: bold; color: ${c.status === 'Paid' ? '#10b981' : '#ef4444'}">${c.status}</td>
                <td style="font-size: 9px;">${note}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  const opt = {
    margin: 0,
    filename: `PJ_Statement_${loan.loanCode || loan.id}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(opt).from(container).save();
};
