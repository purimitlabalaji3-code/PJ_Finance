import express from 'express';
import sql from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Returns today's date in YYYY-MM-DD using Indian Standard Time (IST / Asia/Kolkata)
const localToday = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());


// GET /api/collections?date=YYYY-MM-DD
router.get('/', auth, async (req, res) => {
  try {
    const date = req.query.date || localToday();
    
    // AUTO-GENERATION: Whenever collections are requested, ensure today and yesterday are generated
    // This makes the app "Self-Healing" if it wasn't opened for a day.
    const datesToCheck = [date, localToday()];
    for (const d of datesToCheck) {
      await generateForDate(d);
    }

    const rows = await sql`
      SELECT col.*, 
             c.name AS customer_name, c.phone, c.customer_code,
             l.total_amount, l.paid_days, l.daily_amount, l.loan_type
      FROM collections col
      JOIN customers c ON c.id = col.customer_id
      JOIN loans l ON l.id = col.loan_id
      WHERE col.date = ${date}
         OR (col.status = 'Pending' AND l.loan_type IN ('15-Day', 'Monthly'))
      ORDER BY col.date ASC, col.created_at DESC
    `;
    res.json(rows);
  } catch (err) {
    console.error('Error fetching collections:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to generate collections for a specific date
async function generateForDate(date) {
  return sql`
    INSERT INTO collections (loan_id, customer_id, due_amount, date)
    SELECT id, customer_id, daily_amount, ${date}
    FROM loans l
    WHERE status = 'Active' 
      AND EXTRACT(DOW FROM ${date}::date) != 0 -- Skip Sundays
      AND (
        (loan_type = 'Daily' OR loan_type IS NULL)
        OR (
          loan_type = '15-Day' 
          AND (
            MOD((${date}::date - start_date::date), 15) = 0 
            OR (MOD((${date}::date - start_date::date), 15) = 1 AND EXTRACT(DOW FROM ${date}::date) = 1)
          ) 
          AND ${date}::date > start_date
        )
        OR (
          loan_type = 'Monthly' 
          AND (
            MOD((${date}::date - start_date::date), 30) = 0 
            OR (MOD((${date}::date - start_date::date), 30) = 1 AND EXTRACT(DOW FROM ${date}::date) = 1)
          ) 
          AND ${date}::date > start_date
        )
      )
      AND start_date <= ${date}
      AND NOT EXISTS (
        SELECT 1 FROM collections c 
        WHERE c.loan_id = l.id AND c.date = ${date}
      )
    RETURNING id
  `;
}

// GET /api/collections/all — full history
router.get('/all', auth, async (req, res) => {
  try {
    const rows = await sql`
      SELECT col.*, 
             c.name AS customer_name, c.phone, c.customer_code,
             l.total_amount, l.paid_days, l.daily_amount, l.loan_type
      FROM collections col
      JOIN customers c ON c.id = col.customer_id
      JOIN loans l ON l.id = col.loan_id
      ORDER BY col.date DESC, col.created_at DESC
    `;
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/collections/loan/:loanId  — for loan detail timeline
router.get('/loan/:loanId', auth, async (req, res) => {
  try {
    const rows = await sql`
      SELECT * FROM collections 
      WHERE loan_id = ${req.params.loanId}
      ORDER BY date ASC
    `;
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/collections/generate
router.post('/generate', auth, async (req, res) => {
  try {
    const date = req.query.date || localToday();
    const result = await generateForDate(date);
    res.json({ message: `Generated ${result.length} collection entries`, date });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/collections/manual — for 15-Day / Monthly interest payments
router.post('/manual', auth, async (req, res) => {
  try {
    const { loanId, amount, date } = req.body;
    if (!loanId || !amount) return res.status(400).json({ error: 'loanId and amount required' });

    // Insert a paid collection directly
    const [row] = await sql`
      INSERT INTO collections (loan_id, customer_id, due_amount, paid_amount, date, status)
      SELECT id, customer_id, ${parseFloat(amount)}, ${parseFloat(amount)}, ${date || localToday()}, 'Paid'
      FROM loans WHERE id = ${loanId}
      RETURNING *
    `;

    // Increment paid_days to track how many interest cycles are paid
    await sql`UPDATE loans SET paid_days = paid_days + 1 WHERE id = ${loanId}`;

    res.status(201).json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/collections/:id/pay
router.patch('/:id/pay', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || parseFloat(amount) <= 0)
      return res.status(400).json({ error: 'Valid amount required' });

    const [row] = await sql`
      UPDATE collections
      SET paid_amount = ${parseFloat(amount)}, status = 'Paid'
      WHERE id = ${req.params.id}
      RETURNING *
    `;

    // Increment paidDays on the loan
    await sql`UPDATE loans SET paid_days = paid_days + 1 WHERE id = ${row.loan_id}`;

    // Auto-complete loan if 100 days paid
    await sql`
      UPDATE loans SET status = 'Completed'
      WHERE id = ${row.loan_id} AND paid_days >= total_days
    `;

    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/collections/:id/unpay
router.patch('/:id/unpay', auth, async (req, res) => {
  try {
    const [row] = await sql`
      UPDATE collections 
      SET paid_amount = 0, status = 'Pending'
      WHERE id = ${req.params.id}
      RETURNING *
    `;
    await sql`UPDATE loans SET paid_days = GREATEST(paid_days - 1, 0) WHERE id = ${row.loan_id}`;
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/collections/summary — for dashboard chart (last 7 days)
router.get('/summary', auth, async (req, res) => {
  try {
    const rows = await sql`
      SELECT 
        TO_CHAR(date, 'Dy') as day,
        SUM(paid_amount) as amount,
        date
      FROM collections
      WHERE date > CURRENT_DATE - INTERVAL '7 days'
      GROUP BY date
      ORDER BY date ASC
    `;
    
    // Ensure all days are present (even if 0) and formatted correctly
    res.json(rows.map(r => ({ day: r.day, amount: Number(r.amount) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
