// src/utils/exports.js
// Full PDF and CSV export utilities using jsPDF + jsPDF-AutoTable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

// ── PDF Header ─────────────────────────────────────────────────────────────
const addHeader = (doc, title, subtitle = '') => {
  const W = doc.internal.pageSize.getWidth();

  // Dark header bar
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, 28, 'F');

  // Brand label
  doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setFont('helvetica', 'bold');
  doc.text('PJ FINANCE', 14, 9);

  // Title
  doc.setFontSize(13);
  doc.setTextColor(...WHITE);
  doc.text(title, 14, 19);

  // Date on right
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, W - 14, 19, { align: 'right' });

  if (subtitle) {
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(subtitle, 14, 25);
  }
};

// ── PDF Footer ─────────────────────────────────────────────────────────────
const addFooter = (doc) => {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text('PJ Finance — Confidential', 14, H - 6);
  doc.text(`Page ${doc.getNumberOfPages()}`, W - 14, H - 6, { align: 'right' });
};

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

export const exportCustomersPDF = (customers) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  addHeader(doc, 'Customer Report', `Total Customers: ${customers.length}`);

  autoTable(doc, {
    startY: 32,
    head: [['Code', 'Name', 'Phone', 'Age', 'Gender', 'Aadhaar', 'Address', 'Status', 'Join Date']],
    body: customers.map((c) => [
      c.customerCode || '—',
      c.name, c.phone, c.age || '—', c.gender || '—',
      c.aadhaar || '—', c.address || '—', c.status, c.joinDate || '—'
    ]),
    styles:      { fontSize: 8, cellPadding: 3, textColor: 40 },
    headStyles:  { fillColor: DARK, textColor: GOLD, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: {
      0: { cellWidth: 18, fontStyle: 'bold' },
      7: { fontStyle: 'bold' },
    },
    didDrawPage: () => addFooter(doc),
  });

  doc.save(`PJ_Customers_${today()}.pdf`);
};

// ══════════════════════════════════════════════════════════════════════════
// 2. LOAN SUMMARY — CSV + PDF
// ══════════════════════════════════════════════════════════════════════════
export const exportLoansCSV = (loans) => {
  downloadCSV(`PJ_Loans_${today()}.csv`,
    ['Customer', 'Principal (Rs)', 'Interest %', 'Interest Amt (Rs)', 'Total Payable (Rs)', 'Daily EMI (Rs)', 'Paid Days', 'Total Days', 'Status', 'Start Date'],
    loans.map(l => {
      const p   = Number(l.loanAmount);
      const tot = Number(l.totalAmount) || p * (1 + Number(l.interest) / 100);
      return [l.customerName, p, `${l.interest}%`, Math.round(tot - p), Math.round(tot), l.dailyAmount, l.paidDays, l.totalDays, l.status, l.startDate];
    })
  );
};

export const exportLoansPDF = (loans) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  const totalDisbursed = loans.reduce((s, l) => s + Number(l.loanAmount), 0);
  const totalInterest  = loans.reduce((s, l) => {
    const tot = Number(l.totalAmount) || Number(l.loanAmount) * (1 + Number(l.interest) / 100);
    return s + (tot - Number(l.loanAmount));
  }, 0);

  addHeader(doc, 'Loan Summary Report', `Total Loans: ${loans.length} | Disbursed: ${fmt(totalDisbursed)} | Interest: ${fmt(totalInterest)}`);

  autoTable(doc, {
    startY: 32,
    head: [['Customer', 'Principal', 'Interest %', 'Interest Amt', 'Total Payable', 'Daily EMI', 'Paid Days', 'Total Days', 'Status', 'Start Date']],
    body: loans.map(l => {
      const p   = Number(l.loanAmount);
      const tot = Number(l.totalAmount) || p * (1 + Number(l.interest) / 100);
      return [l.customerName, fmt(p), `${l.interest}%`, fmt(Math.round(tot - p)), fmt(Math.round(tot)), fmt(l.dailyAmount), l.paidDays, l.totalDays, l.status, l.startDate];
    }),
    styles:     { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: DARK, textColor: GOLD, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: {
      2: { textColor: [...PINK] },
      3: { textColor: [...PINK], fontStyle: 'bold' },
      4: { fontStyle: 'bold' },
      8: { fontStyle: 'bold' },
    },
    didDrawCell: (data) => {
      if (data.column.index === 8 && data.section === 'body') {
        const val = data.cell.raw;
        data.cell.styles.textColor = val === 'Active' ? [...GREEN] : [...GRAY];
      }
    },
    didDrawPage: () => addFooter(doc),
  });

  // Totals row at bottom
  const finalY = (doc.lastAutoTable?.finalY || 100) + 6;
  doc.setFillColor(...DARK);
  doc.roundedRect(14, finalY, doc.internal.pageSize.getWidth() - 28, 14, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Disbursed: ${fmt(totalDisbursed)}   |   Total Interest: ${fmt(totalInterest)}   |   Total Payable: ${fmt(totalDisbursed + totalInterest)}`, 20, finalY + 9);

  doc.save(`PJ_Loans_${today()}.pdf`);
};

// ══════════════════════════════════════════════════════════════════════════
// 3. TODAY'S COLLECTION — CSV + PDF
// ══════════════════════════════════════════════════════════════════════════
export const exportCollectionCSV = (collections) => {
  downloadCSV(`PJ_Collection_${today()}.csv`,
    ['Customer', 'Phone', 'Due Amount (Rs)', 'Paid Amount (Rs)', 'Status', 'Date'],
    collections.map(c => [c.customerName, c.phone || '', c.dueAmount, c.paidAmount, c.status, c.date || today()])
  );
};

export const exportCollectionPDF = (collections) => {
  const doc  = new jsPDF();
  const paid = collections.filter(c => c.status === 'Paid');
  const pend = collections.filter(c => c.status === 'Pending');
  const totalPaid    = paid.reduce((s, c) => s + Number(c.paidAmount), 0);
  const totalPending = pend.reduce((s, c) => s + Number(c.dueAmount), 0);

  addHeader(doc, "Today's Collection Report",
    `${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
  );

  // Summary boxes
  const W = doc.internal.pageSize.getWidth();
  const boxes = [
    { label: 'Total Entries', value: String(collections.length), color: DARK },
    { label: 'Paid',          value: String(paid.length),        color: GREEN },
    { label: 'Pending',       value: String(pend.length),        color: RED   },
    { label: 'Collected',     value: fmt(totalPaid),             color: DARK  },
  ];
  const bw = (W - 28) / 4;
  boxes.forEach((b, i) => {
    const x = 14 + i * (bw + 2);
    doc.setFillColor(...b.color);
    doc.roundedRect(x, 32, bw, 16, 2, 2, 'F');
    doc.setFontSize(7); doc.setTextColor(...GRAY);
    doc.text(b.label, x + bw / 2, 37, { align: 'center' });
    doc.setFontSize(10); doc.setTextColor(...WHITE); doc.setFont('helvetica', 'bold');
    doc.text(b.value, x + bw / 2, 44, { align: 'center' });
  });

  autoTable(doc, {
    startY: 54,
    head: [['Code', 'Customer', 'Due Amt', 'Paid Amt', 'Remaining', 'Status']],
    body: collections.map(c => {
      const remaining = Number(c.totalAmount || 0) - (Number(c.paidDays || 0) * Number(c.dailyAmount || 0));
      return [
        c.customerCode || '—',
        c.customerName,
        fmt(c.dueAmount),
        c.status === 'Paid' ? fmt(c.paidAmount) : '—',
        fmt(Math.max(0, remaining)),
        c.status
      ];
    }),
    styles:     { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: DARK, textColor: GOLD, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    didDrawCell: (data) => {
      if (data.column.index === 4 && data.section === 'body') {
        data.cell.styles.textColor = data.cell.raw === 'Paid' ? [...GREEN] : [...RED];
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.column.index === 3 && data.section === 'body') {
        data.cell.styles.textColor = [...GREEN];
        data.cell.styles.fontStyle = 'bold';
      }
    },
    didDrawPage: () => addFooter(doc),
  });

  // Pending note
  if (pend.length > 0) {
    const fy = (doc.lastAutoTable?.finalY || 100) + 6;
    doc.setFillColor(255, 240, 240);
    doc.roundedRect(14, fy, W - 28, 10, 2, 2, 'F');
    doc.setFontSize(8); doc.setTextColor(...RED);
    doc.text(`⚠  ${pend.length} pending entries — Total pending: ${fmt(totalPending)}`, 18, fy + 7);
  }

  doc.save(`PJ_Collection_${today()}.pdf`);
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

export const exportSummaryPDF = ({ customers, loans, collections }) => {
  const doc = new jsPDF();
  const W   = doc.internal.pageSize.getWidth();

  const totalDisbursed = loans.reduce((s, l) => s + Number(l.loanAmount), 0);
  const totalInterest  = loans.reduce((s, l) => {
    const tot = Number(l.totalAmount) || Number(l.loanAmount) * (1 + Number(l.interest) / 100);
    return s + (tot - Number(l.loanAmount));
  }, 0);
  const totalPayable   = totalDisbursed + totalInterest;
  const collected      = collections.filter(c => c.status === 'Paid').reduce((s, c) => s + Number(c.paidAmount), 0);
  const pending        = collections.filter(c => c.status === 'Pending').reduce((s, c) => s + Number(c.dueAmount), 0);
  const activeLoans    = loans.filter(l => l.status === 'Active').length;
  const completedLoans = loans.filter(l => l.status === 'Completed').length;

  addHeader(doc, 'Business Summary Report', 'Complete financial overview');

  // KPI boxes — 2 rows × 4 cols
  const kpis = [
    { label: 'Total Customers',  value: String(customers.length),     color: [30, 30, 80]  },
    { label: 'Active Loans',     value: String(activeLoans),           color: [30, 80, 30]  },
    { label: 'Completed Loans',  value: String(completedLoans),        color: [60, 60, 60]  },
    { label: 'Total Disbursed',  value: fmt(totalDisbursed),           color: [80, 40, 10]  },
    { label: 'Total Interest',   value: fmt(Math.round(totalInterest)), color: [80, 10, 60] },
    { label: 'Total Payable',    value: fmt(Math.round(totalPayable)), color: [10, 60, 80]  },
    { label: "Today Collected",  value: fmt(collected),                color: [10, 80, 50]  },
    { label: "Today Pending",    value: fmt(pending),                  color: [80, 20, 20]  },
  ];
  const cols  = 4;
  const bw    = (W - 28) / cols;
  const bh    = 22;
  kpis.forEach((k, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x   = 14 + col * (bw + 2);
    const y   = 32 + row * (bh + 3);
    doc.setFillColor(...k.color);
    doc.roundedRect(x, y, bw, bh, 2, 2, 'F');
    doc.setFontSize(7);  doc.setTextColor(...GRAY);  doc.setFont('helvetica', 'normal');
    doc.text(k.label, x + bw / 2, y + 7,  { align: 'center' });
    doc.setFontSize(10); doc.setTextColor(...WHITE); doc.setFont('helvetica', 'bold');
    doc.text(k.value, x + bw / 2, y + 17, { align: 'center' });
  });

  // Loan details table
  const tableY = 32 + 2 * (bh + 3) + 8;
  doc.setFontSize(9); doc.setTextColor(...DARK); doc.setFont('helvetica', 'bold');
  doc.text('Loan Breakdown', 14, tableY - 2);

  autoTable(doc, {
    startY: tableY,
    head: [['Customer', 'Principal', 'Interest Amt', 'Total Payable', 'Daily EMI', 'Status']],
    body: loans.map(l => {
      const p   = Number(l.loanAmount);
      const tot = Number(l.totalAmount) || p * (1 + Number(l.interest) / 100);
      return [l.customerName, fmt(p), fmt(Math.round(tot - p)), fmt(Math.round(tot)), fmt(l.dailyAmount), l.status];
    }),
    styles:     { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: DARK, textColor: GOLD, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    didDrawCell: (data) => {
      if (data.column.index === 5 && data.section === 'body') {
        data.cell.styles.textColor = data.cell.raw === 'Active' ? [...GREEN] : [...GRAY];
        data.cell.styles.fontStyle = 'bold';
      }
    },
    didDrawPage: () => addFooter(doc),
  });

  doc.save(`PJ_BusinessSummary_${today()}.pdf`);
};

// ══════════════════════════════════════════════════════════════════════════
// 5. SINGLE LOAN STATEMENT — PDF
// ══════════════════════════════════════════════════════════════════════════
export const exportSingleLoanPDF = (loan, collections) => {
  const doc = new jsPDF();
  const W   = doc.internal.pageSize.getWidth();
  
  const principal = Number(loan.loanAmount || 0);
  const isTerm = loan.loanType !== 'Daily' && loan.loanType;
  const totalPayable = isTerm ? principal : Number(loan.totalAmount || (principal + (principal * Number(loan.interest) / 100)));
  
  const loanCollections = collections.filter(c => c.loanId === loan.id);
  const totalCollected = loanCollections.filter(c => c.status === 'Paid').reduce((s, c) => s + Number(c.paidAmount), 0);
  const remaining = Math.max(0, totalPayable - totalCollected);

  addHeader(doc, `Loan Statement — ${loan.customerName}`, `Loan ID: ${loan.id} | Started: ${loan.startDate}`);

  // Summary boxes
  const boxes = [
    { label: 'Principal',       value: fmt(principal),      color: DARK },
    ...(!isTerm ? [
      { label: 'Interest',        value: `${loan.interest}%`, color: DARK },
      { label: 'Total Payable',   value: fmt(Math.round(totalPayable)), color: [30, 30, 80] }
    ] : []),
    { label: isTerm ? 'Interest Paid' : 'Total Collected', value: fmt(Math.round(totalCollected)), color: GREEN },
    { label: isTerm ? 'Principal Due' : 'Remaining',       value: fmt(Math.round(remaining)), color: RED },
  ];
  
  const bw = (W - 28) / boxes.length;
  boxes.forEach((b, i) => {
    const x = 14 + i * (bw + 2);
    doc.setFillColor(...b.color);
    doc.roundedRect(x, 32, bw, 16, 2, 2, 'F');
    doc.setFontSize(7); doc.setTextColor(...GRAY);
    doc.text(b.label, x + bw / 2, 37, { align: 'center' });
    doc.setFontSize(10); doc.setTextColor(...WHITE); doc.setFont('helvetica', 'bold');
    doc.text(b.value, x + bw / 2, 44, { align: 'center' });
  });

  // Progress Bar
  doc.setFillColor(...DARK);
  doc.roundedRect(14, 52, W - 28, 6, 3, 3, 'F');
  
  const pct = totalPayable > 0 ? Math.min(100, (totalCollected / totalPayable) * 100) : 0;
  if (pct > 0) {
    doc.setFillColor(...GOLD);
    doc.roundedRect(14, 52, (W - 28) * (pct / 100), 6, 3, 3, 'F');
  }
  
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(`Paid: ${fmt(totalCollected)}`, 14, 63);
  doc.text(`Remaining: ${fmt(remaining)}`, W - 14, 63, { align: 'right' });


  // Payments Table
  doc.setFontSize(10); doc.setTextColor(...DARK); doc.setFont('helvetica', 'bold');
  doc.text('Payment History', 14, 75);

  autoTable(doc, {
    startY: 80,
    head: [['Day', 'Date', 'Status', 'Due Amt', 'Paid Amt', 'Note']],
    body: loanCollections.map((c, i) => {
      let extraNote = '';
      if (c.status === 'Paid') {
        const dAmt = Number(c.dueAmount);
        const pAmt = Number(c.paidAmount);
        if (pAmt > dAmt) extraNote = `+${fmt(pAmt - dAmt)} extra`;
        else if (pAmt < dAmt) extraNote = `Short by ${fmt(dAmt - pAmt)}`;
      }
      return [
        `Day ${i + 1}`,
        c.date || today(),
        c.status,
        fmt(c.dueAmount),
        c.status === 'Paid' ? fmt(c.paidAmount) : '—',
        extraNote
      ];
    }),
    styles:     { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: DARK, textColor: GOLD, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    didDrawCell: (data) => {
      // Status column
      if (data.column.index === 2 && data.section === 'body') {
        data.cell.styles.textColor = data.cell.raw === 'Paid' ? [...GREEN] : [...RED];
        data.cell.styles.fontStyle = 'bold';
      }
      // Paid Amount column
      if (data.column.index === 4 && data.section === 'body' && data.cell.raw !== '—') {
        data.cell.styles.textColor = [...GREEN];
      }
      // Note column
      if (data.column.index === 5 && data.section === 'body' && data.cell.raw.includes('extra')) {
        data.cell.styles.textColor = [...GOLD];
      } else if (data.column.index === 5 && data.section === 'body' && data.cell.raw.includes('Short')) {
        data.cell.styles.textColor = [...RED];
      }
    },
    didDrawPage: () => addFooter(doc),
  });

  doc.save(`PJ_Statement_${loan.id}.pdf`);
};
