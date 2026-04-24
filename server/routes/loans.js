import express from 'express';
import sql from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/loans
router.get('/', auth, async (req, res) => {
  try {
    const rows = await sql`
      SELECT l.*, c.name AS customer_name, c.phone, c.customer_code,
      COALESCE((SELECT SUM(paid_amount) FROM collections WHERE loan_id = l.id AND status = 'Paid'), 0) as total_collected
      FROM loans l
      JOIN customers c ON c.id = l.customer_id
      ORDER BY l.created_at DESC
    `;
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/loans/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const [row] = await sql`
      SELECT l.*, c.name AS customer_name, c.phone, c.customer_code,
      COALESCE((SELECT SUM(paid_amount) FROM collections WHERE loan_id = l.id AND status = 'Paid'), 0) as total_collected
      FROM loans l
      JOIN customers c ON c.id = l.customer_id
      WHERE l.id = ${req.params.id}
    `;
    if (!row) return res.status(404).json({ error: 'Loan not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/loans
router.post('/', auth, async (req, res) => {
  try {
    const { customerId, loanAmount, interest, startDate, loanType } = req.body;
    if (!customerId || !loanAmount) return res.status(400).json({ error: 'customerId and loanAmount required' });

    const amt = parseFloat(loanAmount);
    const type = loanType || 'Daily';
    
    let totalAmount, dailyAmount;
    if (type === 'Daily') {
      const rate = parseFloat(interest || 10);
      totalAmount = amt + (amt * rate / 100);
      dailyAmount = Math.ceil(totalAmount / 100);
    } else {
      // Term loan (15-Day / Monthly)
      // totalAmount is Principal. dailyAmount stores the fixed interest cycle amount.
      totalAmount = amt;
      dailyAmount = parseFloat(interest || 0);
    }

    const [row] = await sql`
      INSERT INTO loans (customer_id, loan_amount, interest, total_amount, daily_amount, start_date, loan_type)
      VALUES (${customerId}, ${amt}, ${parseFloat(interest || 0)}, ${totalAmount}, ${dailyAmount}, ${startDate || new Date().toISOString().split('T')[0]}, ${type})
      RETURNING *
    `;

    // Fetch with customer name and code
    const [full] = await sql`
      SELECT l.*, c.name AS customer_name, c.customer_code, 0 as total_collected FROM loans l
      JOIN customers c ON c.id = l.customer_id
      WHERE l.id = ${row.id}
    `;
    res.status(201).json(full);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/loans/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await sql`DELETE FROM loans WHERE id = ${req.params.id}`;
    res.json({ message: 'Loan deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
